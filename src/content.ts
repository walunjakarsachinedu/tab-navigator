import { TabNavigatorOverlay } from "./components/tab-navigator-component";
import MyKeyboard from "./keyboard";
import { TabData } from "./types";

let overlayVisible = false;
let draggedElement: HTMLElement | null = null;
let overlay = new TabNavigatorOverlay();
let keyboard = new MyKeyboard();
overlay.element.id = 'tab-navigator-overlay';
let selectedTabIndex = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleOverlay") {
    toggleOverlay();
  }
});

function toggleOverlay() {
  if (overlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

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
  if(!overlayVisible) return;
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  overlayVisible = false;
  document.removeEventListener('mousedown', handleOutsideClick);
  // document.removeEventListener('keydown', handleKeyPress);
  await selectTab();
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

  overlay.element.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);

  return overlay.element;
}

function startDragging(e: MouseEvent) {
  e.preventDefault();
  draggedElement = document.getElementById('tab-navigator-overlay');
  draggedElement!.style.cursor = 'grabbing';
  const rect = draggedElement!.getBoundingClientRect();
  draggedElement!.dataset.offsetX = (e.clientX - rect.left - rect.width/2).toString();
  draggedElement!.dataset.offsetY = (e.clientY - rect.top).toString();
}

function drag(e: MouseEvent) {
  if (draggedElement) {
    const x = e.clientX - parseFloat(draggedElement!.dataset.offsetX!);
    const y = e.clientY - parseFloat(draggedElement!.dataset.offsetY!);
    draggedElement.style.left = `${x}px`;
    draggedElement.style.top = `${y}px`;
  }
}

function stopDragging() {
  if (draggedElement) {
    draggedElement.style.cursor = 'grab';
    draggedElement = null;
  }
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
    (document.activeElement as HTMLElement)?.blur();
    if(!overlayVisible) {
      selectedTabIndex = 0;
      await showOverlay(); 
    }
    selectNextItem();
  }
  if(keys.has("alt") && keys.has("k")) {
    if(!overlayVisible) {
      selectedTabIndex = 0;
      await showOverlay(); 
    }
    selectPreviousItem();
  }
});

keyboard.listenKeyUp((keys: String) => {
  if(keys == "alt") hideOverlay();
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
