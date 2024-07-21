import { TabNavigatorOverlay } from "./components/tab-navigator-component";
import MyKeyboard from "./browser/keyboard";
import { TabData } from "./types/types";

let overlayVisible = false;
let overlay = new TabNavigatorOverlay();
let keyboard = new MyKeyboard(["alt"]);
overlay.element.id = 'tab-navigator-overlay';
let selectedTabIndex = 0;

(async () => {
  await showOverlay();
  selectNextItem();
})();

async function showOverlay() {
  if(overlayVisible) return;

  const overlayEl = await createOverlay();
  document.body.appendChild(overlayEl);
  overlay.selectItem(selectedTabIndex);
  overlayVisible = true;
  document.addEventListener('mousedown', handleOutsideClick);
  // document.addEventListener('keydown', handleKeyPress);
  // updateSelectedTab();
}

async function hideOverlay() {
  if(selectedTabIndex!=0) await selectTab();
  window.close();
}

function handleOutsideClick(e: MouseEvent) {
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay && !overlay.contains(e.target as Node)) {
    hideOverlay();
  }
}

var tabs: TabData[] = [];
async function createOverlay() : Promise<HTMLElement> {
  tabs = await getTabs();
  overlay.show(tabs);
  overlay.onItemSelected(async (tab) => {
    selectedTabIndex = tabs.indexOf(tab);
    await hideOverlay();
  });

  overlay.onItemDeleted(async (tab) => {
    tabs = tabs.filter(t => t != tab);
    if(selectedTabIndex >= tabs.length) selectedTabIndex = tabs.length - 1; 
    await deleteTab(tab);
  });

  return overlay.element;
}

function selectNextItem(): void {
  selectedTabIndex = (selectedTabIndex + 1) % overlay.tabs.length;
  overlay.selectItem(selectedTabIndex);
}

function selectPreviousItem(): void {
  selectedTabIndex = (selectedTabIndex - 1 + overlay.tabs.length) % overlay.tabs.length;
  overlay.selectItem(selectedTabIndex);
}

keyboard.listenKeyDown(async (keys: Set<String>) => {
  if(keys.has("alt") && keys.has("j")) {
    selectNextItem();
  }
  if(keys.has("alt") && keys.has("k")) {
    selectPreviousItem();
  }
});

keyboard.listenKeyUp((key: String) => {
  if(key == "alt") hideOverlay();
});

function  getTabs(): Promise<TabData[]> {
  return new Promise<TabData[]>((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getTabs" }, function(response) {
      if (response) resolve(response.tabs);
      else reject(new Error("Failed to get tabs"));
    });
  });
}

async function selectTab(): Promise<void> {
  return new Promise((resolve, reject) => {
    if(tabs[selectedTabIndex]) chrome.runtime.sendMessage({ action: "selectTab" , id: tabs[selectedTabIndex].id });
  });
}

async function deleteTab(tab: TabData): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "deleteTab", id: tab.id});
  });
}
