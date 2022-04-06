function changeDisplay(display) {
    if (document.getElementById("breadcrumbs")) document.getElementById("breadcrumbs").style.display = display;
    if (document.getElementById("feedback_message")) document.getElementById("feedback_message").style.display = display;
    if (document.getElementById("box filters collapsed")) document.getElementsByClassName("box filters collapsed")[0].style.display = display;
    if (document.getElementById("page-break")) document.getElementsByClassName("page-break")[0].style.display = display;
    if (document.getElementById("action-links hide-sm")) document.getElementsByClassName("action-links hide-sm")[0].style.display = display;
    if (document.getElementById("msg errornote error")) document.getElementsByClassName("msg errornote error")[0].style.display = display;
    for (let m of document.getElementsByClassName("msg info"))
        m.style.display = display;
}

function imprimir() {
    changeDisplay("none");
    for (let t of document.getElementsByTagName("table"))
        t.setAttribute("border", 1);
    print(document.querySelector("#content"));
    changeDisplay("block");
}

function abrirFolhasPonto(dados) {
    for (let prof of dados.professores.split(" ")) {
        let url = getFolhaPonto(prof, dados.dataInicio, dados.dataFim);
        window.open(url.href, '_blank');
    }
}

function getFolhaPonto(professor, dataInicio, dataFim) {
    let myUrlWithParams = new URL("https://suap.ifms.edu.br/ponto/frequencia_funcionario/");

    dataInicio = dataInicio.substring(8, 10) + "/" + dataInicio.substring(5, 7) + "/" + dataInicio.substring(0, 4);
    dataFim = dataFim.substring(8, 10) + "/" + dataFim.substring(5, 7) + "/" + dataFim.substring(0, 4);

    myUrlWithParams.searchParams.append("funcionario", professor);
    myUrlWithParams.searchParams.append("faixa_0", dataInicio);
    myUrlWithParams.searchParams.append("faixa_1", dataFim);

    return myUrlWithParams;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.func) {
        this[request.func](request.dados);
    }
    sendResponse({ url: window.location.href });
});