function changeDisplay(display) {
    if (document.getElementById("breadcrumbs")) document.getElementById("breadcrumbs").style.display = display;
    document.querySelectorAll("h3").forEach(el => { if (el.textContent.includes('Filtros')) { el.parentElement.style.display = display; } });
    // document.querySelectorAll("h3").forEach(el => { if (el.textContent.includes('Detalhamento das Horas')) { el.parentElement.style.display = display; } });
    document.querySelectorAll(".page-break").forEach(el => el.style.display = display);
    document.querySelectorAll(".action-links.hide-sm").forEach(el => el.style.display = display);
    document.querySelectorAll(".msg").forEach(el => el.style.display = display);
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