chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchHTML") {
    fetch(request.url)
      .then(response => {
        const finalUrl = response.url;
        return response.text().then(html => ({ html, finalUrl }));
      })
      .then(result => {
        sendResponse({ success: true, html: result.html, finalUrl: result.finalUrl });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; 
  }
});