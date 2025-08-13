chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action) {
    chrome.scripting.executeScript({
      target: { tabId: request.tabId },
      files: ["content.js"]
    }).then(() => {
      chrome.tabs.sendMessage(request.tabId, request).catch(error => {
        console.error("Error sending message to content script:", error);
      });
    }).catch(error => {
      console.error("Error injecting content script:", error);
    });
  }
});