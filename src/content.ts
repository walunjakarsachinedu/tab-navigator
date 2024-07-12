import { TabNavigatorOverlay } from "./components/tab-navigator-component";
import MyKeyboard from "./keyboard";

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

function showOverlay() {
  if(overlayVisible) return;
  const overlay = createOverlay();
  document.body.appendChild(overlay);
  overlayVisible = true;
  document.addEventListener('mousedown', handleOutsideClick);
  // document.addEventListener('keydown', handleKeyPress);
  // updateSelectedTab();
}

function hideOverlay() {
  if(!overlayVisible) return;
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  overlayVisible = false;
  document.removeEventListener('mousedown', handleOutsideClick);
  // document.removeEventListener('keydown', handleKeyPress);
}

function handleOutsideClick(e: MouseEvent) {
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay && !overlay.contains(e.target as Node)) {
    hideOverlay();
  }
}

function createOverlay() : HTMLElement {
  overlay.show([
    { id: 1, url: 'https://example.com', title: 'How to Learn JavaScript in 30 Days: A Comprehensive Guide', status: 'active' },
    { id: 2, url: 'https://example.org', title: 'The Ultimate Guide to Understanding CSS Grid and Flexbox', status: 'inactive' },
    { id: 3, url: 'https://example.net', title: 'Mastering Python: Tips and Tricks for Effective Python Programming', status: 'active' },
    { id: 4, url: 'https://example.edu', title: 'An In-Depth Analysis of Machine Learning Algorithms and Applications', status: 'inactive' },
    { id: 5, url: 'https://example.co', title: 'The Complete Guide to Web Development: HTML, CSS, JavaScript, and Beyond', status: 'active' }
  ]);
  overlay.selectItem(0);
  overlay.onItemSelected((tab) => {
    console.log('Tab selected:', tab);
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

keyboard.listenKeyDown((keys: Set<String>) => {
  if(keys.has("alt") && keys.has("j")) {
    if(!overlayVisible) {
      selectedTabIndex = 0;
      showOverlay(); 
    }
    selectNextItem();
  }
  if(keys.has("alt") && keys.has("k")) {
    if(!overlayVisible) {
      selectedTabIndex = 0;
      showOverlay(); 
    }
    selectPreviousItem();
  }
});

keyboard.listenKeyUp((keys: String) => {
  if(keys == "alt") hideOverlay();
});
