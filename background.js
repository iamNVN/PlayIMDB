// Listens for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'open_new_tab' && request.url) {
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
  }
});
