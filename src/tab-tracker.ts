import { EventEmitter, EventHandler } from "./util/event-emitter";
import { TabData } from "./types";
import Queue, { DataGetter } from "./util/queue";

/**
 * @class This class starts listening to Chrome tab events once an instance is created.
 */
class TabTracker {
  private _tabQue: Queue<TabData>;

  constructor() {
    this._tabQue = new Queue<TabData>();
    this._listenToChromeTabEvents();
  }

  /**
   * 
   * @returns The tab queue with the current active tab first, followed by previously visited tabs.
   */
  getTabQue() {
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
      status: tab.status ?? ""
    });
  }

  private _onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    // console.log('Tab updated:', tabId);
    this._tabQue.update(
      { getData: TabTracker.getTabByIdFunc(tabId) },
      changeInfo
    );
  }

  private _onTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    this._tabQue.moveFront({ getData: TabTracker.getTabByIdFunc(activeInfo.tabId) });
  }

  private _onTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    // console.log('Tab removed:', tabId);
    this._tabQue.remove({ getData: TabTracker.getTabByIdFunc(tabId) });
  }

  static getTabByIdFunc(tabId: number): DataGetter<TabData> {
    return (que) => { return que.find(el =>  el.id === tabId); };
  }
}




export default TabTracker;