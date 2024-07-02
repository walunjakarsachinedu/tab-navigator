console.log("executing background.js");

chrome.commands.onCommand?.addListener((command) => {
  if (command === "toggle-overlay") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleOverlay"});
    });
  }
});