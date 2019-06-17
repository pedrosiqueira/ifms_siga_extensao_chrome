let opcao;
function btnFalta(event) {
    opcao = event.data.opc;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {funcao: 'btnFalta'}, function (nomes) {
            for (let i = 0; i < nomes.length; i++) {
                $("#selectNomes").append('<option value="' + i + '">' + nomes[i] + '</option>');
            }
            $('#modalFaltas').modal('show');
        });
    });
}

function btnFalta2() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            funcao: opcao,
            nome: $("select option:selected").html(),
            data: $("#inputData").val()
        });
    });
}

function btnConteudo() {
    $('#modalConteudo').modal('show');
}

function btnConteudo2() {
    var linhas = $("#textareaConteudo").val().split('\n');
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            funcao: "preencherConteudo",
            conteudo: linhas
        });
    });
}

function btnAddPresenca(){
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {funcao: "addPresenca"});
  });
}

function startPopup() {
    $("#btnFalta").click({opc: "darFalta"}, btnFalta);
    $("#btnPresenca").click({opc: "darPresenca"}, btnFalta);
    $("#btnModalFaltas").click(btnFalta2);
    $("#btnConteudo").click(btnConteudo);
    $("#btnModalConteudo").click(btnConteudo2);
    $("#btnAddPresenca").click(btnAddPresenca);

}

startPopup();
