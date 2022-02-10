let minhasTabs = {};
//
function getFolhaPonto(professor, dataInicio, dataFim) {
    let myUrlWithParams = new URL("https://suap.ifms.edu.br/ponto/frequencia_funcionario/");

    dataInicio = dataInicio.substring(8, 10) + "/" + dataInicio.substring(5, 7) + "/" + dataInicio.substring(0, 4);
    dataFim = dataFim.substring(8, 10) + "/" + dataFim.substring(5, 7) + "/" + dataFim.substring(0, 4);

    myUrlWithParams.searchParams.append("funcionario", professor);
    myUrlWithParams.searchParams.append("faixa_0", dataInicio);
    myUrlWithParams.searchParams.append("faixa_1", dataFim);

    return myUrlWithParams;
}


chrome.runtime.onInstalled.addListener(function (details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches: "https://academico.ifms.edu.br/administrativo/professores/diario*"
                        },
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
            , {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches: "https://suap.ifms.edu.br/*"
                        },
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (let prof of request.professores.split(" ")) {
        let url = getFolhaPonto(prof, request.dataInicio, request.dataFim);
        chrome.tabs.create({'url': url.href});
    }
});
