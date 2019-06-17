chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlMatches: 'academico.ifms.edu.br/administrativo/professores/diario*'
        },
      })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});
});


// A function to use as callback
function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
    alert("ola2");
}

// When the browser-action button is clicked...
chrome.pageAction.onClicked.addListener(function (tab) {
    // ...check the URL of the active tab against our pattern and...
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
});