import { TabData } from "../types/types";
import Queue, { DataGetter } from "../util/queue";

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
   * @returns The tab queue with the current active tab first, followed by previously visited tabs.
   */
  async getTabQue(): Promise<TabData[]> {
    try { await this._isLoading; } catch {}
    return this._tabQue.getQueData();
  }

  private _listenToChromeTabEvents() {
    chrome.tabs.onCreated.addListener(this._onTabCreated.bind(this));
    // fire event on tab navigation, loading status change, title change
    chrome.tabs.onUpdated.addListener(this._onTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this._onTabRemoved.bind(this));
    // fired when tab get into focus
    chrome.tabs.onActivated.addListener(this._onTabActivated.bind(this));
  }

  private _onTabCreated(tab: chrome.tabs.Tab) {
    // console.log('Tab created:', tab.id);
    this._tabQue.add({
      id: tab.id!,
      url: tab.url ?? "",
      title: tab.title ?? "",
      status: tab.status ?? "",
      favIconUrl: tab.favIconUrl ?? ""
    });
    this.storeState();
  }

  private _onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    // console.log('Tab updated:', tabId);
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

  private async storeState() {
    const tabData = this._tabQue.getQueData();
    const jsonData = JSON.stringify(tabData);
    await chrome.storage.local.set({"tabQueue": jsonData});
  }

  private async restoreState() {
    const jsonData = await chrome.storage.local.get('tabQueue');
    if (jsonData && jsonData['tabQueue']) {
      const tabData: TabData[] = JSON.parse(jsonData['tabQueue']);
      // Validate all restored tabs are actually present or not
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
            favIconUrl: tab.favIconUrl ?? ""
          }));
        validTabs.forEach(tab => this._tabQue.add(tab));
        remainingTabs.forEach(tab => this._tabQue.add(tab));
      });
    }
  }

  static getTabByIdFunc(tabId: number): DataGetter<TabData> {
    return (que) => { return que.find(el =>  el.id === tabId); };
  }
}




export default TabTracker;