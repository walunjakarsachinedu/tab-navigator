import TabTracker from "./tab-tracker";
import { TabData } from "./types";
import Queue from "./util/queue";


// chrome.commands.onCommand?.addListener((command) => {
//   if (command === "toggle-overlay") {
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//       chrome.tabs.sendMessage(tabs[0].id, {action: "toggleOverlay"});
//     });
//   }
// });

const tabTracker = new TabTracker();
console.log(tabTracker.getTabQue());