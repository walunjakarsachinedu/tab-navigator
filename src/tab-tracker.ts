import { EventEmitter, EventHandler } from "./util/event-emitter";
import { TabData } from "./types";
import Queue, { DataGetter } from "./util/queue";

class TabTracker {
  private _tabQue: Queue<TabData>;
  private _tabEvent: EventEmitter<Queue<TabData>>;

  constructor() {
    this._tabQue = new Queue<TabData>();
    this._tabEvent = new EventEmitter<Queue<TabData>>();
    this._listenToChromeTabEvents();
  }

  private _listenToChromeTabEvents() {
    chrome.tabs.onCreated.addListener(this._onTabCreated.bind(this));
    // fire event on tab navigation, loading status change, title change
    chrome.tabs.onUpdated.addListener(this._onTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this._onTabRemoved.bind(this));
    // fired when tab get into focus
    chrome.tabs.onActivated.addListener(this._onTabActivated.bind(this));
  }

  addTabEventListener(listener: EventHandler<Queue<TabData>>) {
    this._tabEvent.addListener(listener);
  }

  private _onTabCreated(tab: chrome.tabs.Tab) {
    // console.log('Tab created:', tab.id);
    this._tabQue.add({
      id: tab.id!,
      url: tab.url ?? "",
      title: tab.title ?? "",
      status: tab.status ?? ""
    });
    this._tabEvent.emit(this._tabQue);
  }

  private _onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    // console.log('Tab updated:', tabId);
    this._tabQue.update(
      { getData: TabTracker.getTabByIdFunc(tabId) },
      changeInfo
    );

    // TODO: call move front only on url change

    this._tabEvent.emit(this._tabQue);
  }

  private _onTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    this._tabQue.moveFront({ getData: TabTracker.getTabByIdFunc(activeInfo.tabId) });
  }

  private _onTabRemoved(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    // console.log('Tab removed:', tabId);
    this._tabQue.remove({ getData: TabTracker.getTabByIdFunc(tabId) });
    this._tabEvent.emit(this._tabQue);
  }

  static getTabByIdFunc(tabId: number): DataGetter<TabData> {
    return (que) => { return que.find(el =>  el.id === tabId); };
  }
}




export default TabTracker;