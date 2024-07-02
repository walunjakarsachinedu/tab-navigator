let overlayVisible = false;
let draggedElement = null;
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
  const overlay = createOverlay();
  document.body.appendChild(overlay);
  overlayVisible = true;
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleKeyPress);
  updateSelectedTab();
}

function hideOverlay() {
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  overlayVisible = false;
  document.removeEventListener('mousedown', handleOutsideClick);
  document.removeEventListener('keydown', handleKeyPress);
}

function handleOutsideClick(e) {
  const overlay = document.getElementById('tab-navigator-overlay');
  if (overlay && !overlay.contains(e.target)) {
    hideOverlay();
  }
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'tab-navigator-overlay';
  overlay.innerHTML = `
    <div class="container">
      <ul class="tab-list">
        <li>Tab 1: Google</li>
        <li>Tab 2: GitHub</li>
        <li>Tab 3: Stack Overflow</li>
        <li>Tab 4: YouTube</li>
        <li>Tab 5: Netflix</li>
      </ul>
    </div>
  `;

  overlay.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);

  return overlay;
}

function startDragging(e) {
  e.preventDefault();
  draggedElement = document.getElementById('tab-navigator-overlay');
  draggedElement.style.cursor = 'grabbing';
  const rect = draggedElement.getBoundingClientRect();
  draggedElement.dataset.offsetX = e.clientX - rect.left - rect.width/2;
  draggedElement.dataset.offsetY = e.clientY - rect.top;
}

function drag(e) {
  if (draggedElement) {
    const x = e.clientX - draggedElement.dataset.offsetX;
    const y = e.clientY - draggedElement.dataset.offsetY;
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

function handleKeyPress(e) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedTabIndex = Math.max(0, selectedTabIndex - 1);
    updateSelectedTab();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const tabList = document.querySelectorAll('#tab-navigator-overlay .tab-list li');
    selectedTabIndex = Math.min(tabList.length - 1, selectedTabIndex + 1);
    updateSelectedTab();
  }
}

function updateSelectedTab() {
  const tabList = document.querySelectorAll('#tab-navigator-overlay .tab-list li');
  tabList.forEach((tab, index) => {
    if (index === selectedTabIndex) {
      tab.classList.add('selected');
    } else {
      tab.classList.remove('selected');
    }
  });
}