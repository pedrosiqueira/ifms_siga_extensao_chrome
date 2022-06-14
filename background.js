// Wrap in an onInstalled callback in order to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
    // Page actions are disabled by default and enabled on select tabs
    // chrome.action.disable();

    // Clear all rules to ensure only our expected rules are set
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        let exampleRule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { pathPrefix: 'academico.ifms.edu.br/administrativo/professores/diario' },
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { pathPrefix: 'suap.ifms.edu.br' },
                }),
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        chrome.declarativeContent.onPageChanged.addRules([exampleRule]);
    });
});