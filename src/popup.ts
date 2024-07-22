import { TabNavigatorOverlay } from "./components/tab-navigator-component";
import MyKeyboard from "./browser/keyboard";
import { TabData } from "./types/types";

let overlay = new TabNavigatorOverlay();
let keyboard = new MyKeyboard(["alt"]);
let highlightedTab: TabData | undefined;

overlay.element.id = 'tab-navigator-overlay';

(async () => {
  await showOverlay();
  overlay.selectNextItem();
})();

async function showOverlay() {
  const overlayEl = await createOverlay();
  document.body.appendChild(overlayEl);
  overlay.selectItem(0);
}

var tabs: TabData[] = [];
async function createOverlay() : Promise<HTMLElement> {
  tabs = await getTabs();
  overlay.show(tabs);
  addEventHandler();

  return overlay.element;
}

function addEventHandler() {
  overlay.onItemSelected(async (tab) => {
    await selectTabThenHideOverlay(tab);
  });

  overlay.onItemDeleted(async (tab) => {
    tabs = tabs.filter(t => t != tab);
    await deleteTab(tab);
  });

  overlay.onItemHighlighted((tab) => highlightedTab = tab);
}


keyboard.listenKeyDown(async (keys: Set<String>) => {
  if(keys.has("alt") && keys.has("j")) {
    overlay.selectNextItem();
  }
  if(keys.has("alt") && keys.has("k")) {
    overlay.selectPreviousItem();
  }
});

keyboard.listenKeyUp((key: String) => {
  if(key == "alt") selectTabThenHideOverlay();
});

function  getTabs(): Promise<TabData[]> {
  return new Promise<TabData[]>((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getTabs" }, function(response) {
      if (response) resolve(response.tabs);
      else reject(new Error("Failed to get tabs"));
    });
  });
}


let activeTabId: number|undefined;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  activeTabId = tabs[0].id;
});

async function selectTabThenHideOverlay(tab?: TabData) {
  const isCurrentTab = (tab??highlightedTab)?.id == activeTabId;
  if(!isCurrentTab) await selectTab(tab);
  window.close();
}

async function selectTab(tab?: TabData): Promise<void> {
  return new Promise((resolve, reject) => {
    tab ??= highlightedTab;
    if(tab) chrome.runtime.sendMessage({ action: "selectTab" , id: tab.id });
  });
}

async function deleteTab(tab: TabData): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "deleteTab", id: tab.id});
  });
}
