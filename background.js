// Inject the script if page matches with the host_permissions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./getLyrics.js"]
        })
        .then(() => {
            console.log("Detected Spotify page! Starting LyricsFinder...");
        })
        .catch(err => console.log(err));
    }
});

// Gets the content of the requested curl
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "get_content") {
    fetch(request.curl)
      .then((response) => response.text())
      .then((content) => {
        sendResponse({ content: content });
      });
    return true;
  }
});