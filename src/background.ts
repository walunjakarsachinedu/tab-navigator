import TabTracker from "./tab-tracker";


const tabTracker = new TabTracker();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getTabs") {
    sendResponse(sendResponse({ tabs: tabTracker.getTabQue() }));
  }
  else if (request.action === "selectTab") {
    chrome.tabs.update(request.id, { active: true });
  }
});

// const tabTracker = new TabTracker();
// console.log(tabTracker.getTabQue());