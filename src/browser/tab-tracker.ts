import { TabData } from "../types/types";
import Queue, { DataGetter } from "../util/queue";
import { getCurrentWindowId, removeSchemaFromUrl } from "../util/utils";

/**
 * @class This class starts listening to Chrome tab events once an instance is created.
 */
class TabTracker {
  private _tabQue: Queue<TabData>;
  private _isLoading: Promise<void>;

  constructor() {
    this._tabQue = new Queue<TabData>();
    this._isLoading = this.restoreState().finally(() => this._listenToChromeTabEvents());
  }

  /**
   * 
   * @returns The tab queue for current window with the current active tab first, followed by previously visited tabs.
   */
  async getTabQue(): Promise<TabData[]> {
    try { await this._isLoading; } catch {}
    const windowId = await getCurrentWindowId();
    return this._tabQue.getQueData().filter(tabs => tabs.windowId == windowId);
  }

  private _listenToChromeTabEvents() {
    chrome.tabs.onCreated.addListener(this._onTabCreated.bind(this));
    // fire event on tab navigation, loading status change, title change
    chrome.tabs.onUpdated.addListener(this._onTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this._onTabRemoved.bind(this));
    // fired when tab get into focus
    chrome.tabs.onActivated.addListener(this._onTabActivated.bind(this));
    chrome.tabs.onAttached.addListener(this._onTabMoved.bind(this));
  }

  private _onTabCreated(tab: chrome.tabs.Tab) {
    // console.log('Tab created:', tab.id);
    if(tab.url) tab.url = removeSchemaFromUrl(tab.url);
    this._tabQue.add({
      id: tab.id!,
      url: tab.url ?? "",
      title: tab.title ?? "",
      status: tab.status ?? "",
      favIconUrl: tab.favIconUrl ?? "",
      windowId: tab.windowId,
    });
    this.storeState();
  }

  private _onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    // console.log('Tab updated:', tabId);
    if(changeInfo.url) changeInfo.url = removeSchemaFromUrl(changeInfo.url);
    if(changeInfo.url == 'chrome://newtab/') {
      changeInfo.favIconUrl = '';
      changeInfo.title = 'New Tab';
    }
    this._tabQue.update(
      { getData: TabTracker.getTabByIdFunc(tabId) },
      changeInfo
    );
    this.storeState();
  }

  private _onTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    this._tabQue.moveFront({ getData: TabTracker.getTabByIdFunc(activeInfo.tabId) });
    this.storeState();
  }

  private _onTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    // console.log('Tab removed:', tabId);
    this._tabQue.remove({ getData: TabTracker.getTabByIdFunc(tabId) });
    this.storeState();
  }

  private _onTabMoved(tabId: number, attachInfo: chrome.tabs.TabAttachInfo) {
    this._tabQue.update(
      { getData: TabTracker.getTabByIdFunc(tabId) },
      {windowId: attachInfo.newWindowId}
    );
  }

  private async storeState() {
    const tabData = this._tabQue.getQueData();
    const jsonData = JSON.stringify(tabData);
    await chrome.storage.local.set({"tabQueue": jsonData});
  }

  private async restoreState(): Promise<void> {
    const jsonData = await chrome.storage.local.get('tabQueue');
    if (jsonData && jsonData['tabQueue']) {
      const tabData: TabData[] = JSON.parse(jsonData['tabQueue']);
      // Validate all restored tabs are actually present or not
      return new Promise((resolve) => {
        chrome.tabs.query({}, (tabs) => {
          const validTabs = tabData.filter(tab => tabs.some(t => t.id === tab.id));
          const remainingTabs = tabs
            .filter(tab => tabData
              .every(t => t.id != tab.id))
            .map<TabData>(tab => ({
              id: tab.id!,
              url: tab.url ?? "",
              title: tab.title ?? "",
              status: tab.status ?? "",
              favIconUrl: tab.favIconUrl ?? "", 
              windowId: tab.windowId ?? "",
            }));
          validTabs.forEach(tab => this._tabQue.add(tab));
          remainingTabs.forEach(tab => this._tabQue.add(tab));
          resolve();
        });
      }); 
    }
  }

  static getTabByIdFunc(tabId: number): DataGetter<TabData> {
    return (que) => { return que.find(el =>  el.id === tabId); };
  }
}




export default TabTracker;