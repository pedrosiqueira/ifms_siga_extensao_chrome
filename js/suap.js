function getFolhaPonto(professor, dataInicio, dataFim) {
    let myUrlWithParams = new URL("https://suap.ifms.edu.br/ponto/frequencia_funcionario/");

    dataInicio = dataInicio.substring(8, 10) + "/" + dataInicio.substring(5, 7) + "/" + dataInicio.substring(0, 4);
    dataFim = dataFim.substring(8, 10) + "/" + dataFim.substring(5, 7) + "/" + dataFim.substring(0, 4);

    myUrlWithParams.searchParams.append("funcionario", professor);
    myUrlWithParams.searchParams.append("faixa_0", dataInicio);
    myUrlWithParams.searchParams.append("faixa_1", dataFim);

    return myUrlWithParams;
}

function abrirFolhas(e) {
    if (e.target.returnValue == "cancel") return;
    let professores = document.getElementById("modalProfessores").value.trim()
    if (professores) chrome.storage.sync.set({ professores: professores });
    let dataIni = document.getElementById("modalDataInicio").value
    let dataFim = document.getElementById("modalDataFim").value

    for (let prof of professores.split(" ")) {
        let url = getFolhaPonto(prof, dataIni, dataFim);
        window.open(url.href, '_blank');
    }
}

function loadModalFrequencias() {
    chrome.storage.sync.get("professores", ({ professores }) => {
        if (professores) document.getElementById("modalProfessores").value = professores;
    });

    let data = new Date();
    let dataInicio = new Date(data.getFullYear(), data.getMonth() - 1, 1).toISOString().substring(0, 10);
    let dataFim = new Date(data.getFullYear(), data.getMonth(), 0).toISOString().substring(0, 10);

    document.getElementById("modalDataInicio").value = dataInicio;
    document.getElementById("modalDataFim").value = dataFim;
}

async function init() {
    await fetchHTML("suap/frequencias");

    let modalFrequencias = document.getElementById("modalFrequencias");
    modalFrequencias.addEventListener('close', abrirFolhas);
    loadModalFrequencias()

    let btnFrequencias = htmlToElement('<a class="btn success" style="margin-left: 10px"><i class="fas fa-users"></i> Chefiados</a>');
    document.querySelector("a[href='/ponto/frequencia_funcionario/']").insertAdjacentElement("afterend", btnFrequencias);
    btnFrequencias.onclick = () => { modalFrequencias.showModal(); };

}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada
