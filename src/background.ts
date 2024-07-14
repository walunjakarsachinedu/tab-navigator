import TabTracker from "./tab-tracker";


async function handleContentScriptMessage(request: any, sendResponse: (response?: any) => void) {
  if (request.action === "getTabs") {
    sendResponse({ tabs: await tabTracker.getTabQue() });
  }
  else if (request.action === "selectTab") {
    chrome.tabs.update(request.id, { active: true });
  }  
}

const tabTracker = new TabTracker();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  handleContentScriptMessage(request, sendResponse);
  return true;  // Keep the message channel open for asynchronous response
});


