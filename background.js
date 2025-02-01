chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Video Injector Extension Installed");
});

// Listens for tab changes and injects content.js when a YouTube page is opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the page is YouTube
  if (tab.url && tab.url.includes('youtube.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
});
