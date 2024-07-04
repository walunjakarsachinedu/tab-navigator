console.log("executing background.js");

chrome.commands.onCommand?.addListener((command) => {
  if (command === "toggle-overlay") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleOverlay"});
    });
  }
});



class TabTracker {
  constructor() {
    this.tabsData = {};
    this.eventListeners = new Set();
    this.initEventListeners();
  }

  initEventListeners() {
    chrome.tabs.onCreated.addListener(this.onTabCreated.bind(this));
    chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));
    chrome.tabs.onRemoved.addListener(this.onTabRemoved.bind(this));
  }

  addTabEventListener(listener) {
    this.eventListeners.add(listener);
  }

  executeListener(event) {
    for(let listener of this.eventListeners) listener(event);
  }

  onTabCreated(tab) {
    // console.log('Tab created:', tab.id);
    this.updateTabData(tab.id, tab);
    this.executeListener({tabData: this.tabsData, name: "created"});
  }

  onTabUpdated(tabId, changeInfo, tab) {
    // console.log('Tab updated:', tabId);
    this.updateTabData(tabId, tab);
    this.executeListener({tabData: this.tabsData, name: "updated"});
  }

  onTabRemoved(tabId, removeInfo) {
    // console.log('Tab removed:', tabId);
    delete this.tabsData[tabId];
    this.executeListener({tabData: this.tabsData, name: "removed"});
  }

  updateTabData(tabId, tab) {
    this.tabsData[tabId] = {
      url: tab.url,
      title: tab.title,
      status: tab.status
    };
  }
}

const tabTracker = new TabTracker();
tabTracker.addTabEventListener((tabData) => {
  console.log("tabData: ", tabData);
});