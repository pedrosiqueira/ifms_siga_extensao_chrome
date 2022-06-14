function btnModalAbrirFolhasPonto() {
    let professores = $("#professores").val();
    let dataInicio = $("#dataInicio").val();
    let dataFim = $("#dataFim").val();

    chrome.storage.sync.set({ professores: professores });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { func: "abrirFolhasPonto", dados: { professores: professores, dataInicio: dataInicio, dataFim: dataFim } });
    });

}

function btnImprimirFolhaPonto() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { func: "imprimir" });
    });
}

function btnAddPresenca() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { func: "addPresenca" });
    });
}

function btnModalConteudo() {
    var linhas = $("#textareaConteudo").val().split('\n');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            func: "preencherConteudo",
            dados: linhas
        });
    });
}

function btnModalReposicao() {
    var linhas = $("#textareaReposicao").val().split('\n');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            func: "preencherReposicao",
            dados: linhas
        });
    });
}

function btnModalProposta() {
    var linhas = $("#textareaProposta").val().split('\n');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            func: "preencherProposta",
            dados: linhas
        });
    });
}

async function startPopup() {

    [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(currentTab.id, {}, (response) => {
        document.getElementById("suap").style.display = "none";
        document.getElementById("suap-folha-ponto").style.display = "none";
        document.getElementById("academico-frequencia").style.display = "none";
        document.getElementById("academico-conteudo").style.display = "none";
        document.getElementById("academico-proposta-trabalho").style.display = "none";

        if (response == undefined) {
        } else if (response.url.includes("academico.ifms.edu.br")) {
            if (response.url.includes("frequencia")) {
                document.getElementById("academico-frequencia").style.display = "block";
                $("#btnAddPresenca").click(btnAddPresenca);
            } else if (response.url.includes("conteudo")) {
                document.getElementById("academico-conteudo").style.display = "block";
                $("#btnModalConteudo").click(btnModalConteudo);
                $("#btnModalReposicao").click(btnModalReposicao);
            } else if (response.url.includes("plano_ensino/editar")) {
                document.getElementById("academico-proposta-trabalho").style.display = "block";
                $("#btnModalProposta").click(btnModalProposta);
            }
        } else if (response.url.includes("suap.ifms.edu.br")) {
            document.getElementById("suap").style.display = "block";

            chrome.storage.sync.get("professores", ({ professores }) => { // para obter o valor de uma variável armazenada no chrome
                if (professores)
                    $("#professores").val(professores);
            });

            let data = new Date();
            let dataInicio = new Date(data.getFullYear(), data.getMonth() - 1, 1).toISOString().substring(0, 10);
            let dataFim = new Date(data.getFullYear(), data.getMonth(), 0).toISOString().substring(0, 10);

            $("#dataInicio").val(dataInicio);
            $("#dataFim").val(dataFim);

            $("#btnModalAbrirFolhasPonto").click(btnModalAbrirFolhasPonto);
            $("#btnImprimirFolhaPonto").click(btnImprimirFolhaPonto);

            if (response.url.includes("faixa_0")) {
                document.getElementById("suap-folha-ponto").style.display = "block";
            }
        }
    });
}

startPopup();