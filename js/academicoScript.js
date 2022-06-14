let contador; // variável que conta quantas requisições ajax foram feitas
let url;
let planoId;

function createAttribute(key, value) {
    let att = document.createAttribute(key);
    att.value = value;
    return att;
}

function createModalEspera(text, closeButton) {
    let modal = document.createElement("div");
    modal.setAttributeNode(createAttribute("id", "modalEspera"));
    modal.setAttributeNode(createAttribute("class", "modal-temp"));
    document.body.appendChild(modal);

    let modalContent = document.createElement("div");
    modalContent.setAttributeNode(createAttribute("class", "modal-content-temp"));
    modal.appendChild(modalContent);

    if (closeButton) {
        let modalClose = document.createElement("span");
        modalClose.setAttributeNode(createAttribute("class", "close-temp"));
        modalClose.innerHTML = "&times;";
        modalContent.appendChild(modalClose);

        modalClose.onclick = function () {
            modal.parentNode.removeChild(modal);
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.parentNode.removeChild(modal);
            }
        }
    }

    let modalBody = document.createElement("p");
    modalBody.innerHTML = text;
    modalContent.appendChild(modalBody);

    var myModal = document.getElementById('modalEspera');
    myModal.style.display = "block";
}

async function addPresenca() {
    $as = $('a[href*="presencaTodos"]');
    $as.removeAttr("onclick");
    let myMap = new Map();
    $as.each(function (i, e) {//varios links sao os mesmos, entao eu tiro os repetidos
        myMap.set($(this).attr("href"), $(this).attr("href"));
    });

    createModalEspera("Aguarde a colocação das aulas");

    for (var value of myMap.values()) {
        await fetch(value);
    }

    window.location.reload(false);
}

function getAllIds() {
    let $tds = $("td[id^=conteudo_");
    let $ids = [];
    $tds.each(function () {//varios links sao os mesmos, entao eu tiro os repetidos
        $ids.push($(this).attr("id").substring(9));
    });
    return $ids;
}

function preencherConteudo(linhas) {
    $ids = getAllIds();

    contador = 0;

    createModalEspera("Aguarde o preenchimento dos conteúdos");

    for (let i = 0; i < $ids.length; i++) {
        preencherAula($ids[i], linhas[i]);
    }

}

function preencherAula(id, conteudo) {
    var href = "/administrativo/professores/salvarConteudo/" + id;
    var td = $("td#conteudo_" + id);

    contador++;
    $.post(href, { conteudo: conteudo }
    ).done(function () { if (--contador <= 0) window.location.reload(false); });
}

function preencherReposicao(reposicoes) {
    contador = 0;

    createModalEspera("Aguarde o preenchimento das reposições");

    for (let repo of reposicoes) {
        fields = repo.split('\t');
        var td = $('td:contains(' + fields[0] + ')'); // se este elemento contem a string em seu innerHTML
        td = td.siblings(':contains(' + fields[1] + ')');
        td = td.siblings('[id^="conteudo_"]'); // filtra os irmaos cujo atributo id comece com 'conteudo_'
        if (td.length > 0) { // se achou
            preencherReposicao2(td.attr("id").substring(9), fields);
        }
    }
}

function preencherReposicao2(id, fields) {
    contador++;
    $.post(window.location.href,
        {
            'data[antecipacao_reposicao][aula_id]': id,
            'data[antecipacao_reposicao][data]': fields[4],
            'data[antecipacao_reposicao][hora_inicio]': fields[5],
            'data[antecipacao_reposicao][hora_fim]': fields[6],
            'data[antecipacao_reposicao][conteudo]': fields[2],
            'data[antecipacao_reposicao][observacao]': fields[3],
            'data[antecipacao_reposicao][justificativa]': fields[7]
        }
    ).done(function () { if (--contador <= 0) window.location.reload(false); });
}

function preencherProposta(proposta) {
    contador = 0;

    createModalEspera("Aguarde o preenchimento da proposta");

    let href = '' + location;
    href = href.replace(/(\d+).*/, "$1/conteudo");

    $.post(href).done(function (data) {
        let $doc = $.parseHTML(data);
        let datas = $("tbody:eq(1) tr td:nth-child(2)", $doc).map(function () {
            return stringParaDate($(this).text());
        });

        url = '' + location;
        planoId = url.match(/\d+/g)[1];
        url = url.replace(/plano_ensino.*/, "plano_ensino/");

        for (let conteudo of proposta) {
            fields = conteudo.split('\t');
            if (!fields[0]) continue;
            preencherProposta2(fields, datas);
        }
    });
}

function preencherProposta2(fields, datas) {
    let i = 0;
    let dataIni = stringParaDate(fields[i++].trim());
    let dataFim;
    if (/^[\d\/]+$/.test(fields[i].trim())) { // fields[1] é uma data
        dataFim = stringParaDate(fields[i++]);
    } else {
        dataFim = dataIni; // fields[1] não é uma data
        if (!fields[i].trim()) i++; // fields[1] está vazio
    }
    let conteudo = fields[i++].trim();
    let tecnicas = fields[i++].trim();
    let recursos = fields[i++].trim();
    let observacoes = fields[i] ? fields[i].trim() : "";

    if (dataIni > dataFim) { let tmp = dataIni; dataIni = dataFim; dataFim = temp; }

    // como o plano de ensino só aceita períodos no mesmo mes, se forem meses diferentes, precisamos criar dois períodos, um para cada mês. se for um período maior q 2 meses já não funciona.
    if (dataIni.getMonth() != dataFim.getMonth()) {
        let dataIni2 = new Date(dataFim.getFullYear(), dataFim.getMonth(), 1); // primeiro dia do mes
        let dataFim2 = dataFim;
        dataFim = new Date(dataIni.getFullYear(), dataIni.getMonth() + 1, 0); // ultimo dia do mes

        let numAulas2 = 0;
        for (let data of datas) if (data >= dataIni2 && data <= dataFim2) numAulas2++;

        salvarConteudo(mesParaString(dataIni2.getMonth()), dataIni2.getDate(), dataFim2.getDate(), numAulas2, observacoes, conteudo, tecnicas, recursos);
    }

    let numAulas = 0;
    for (let data of datas) if (data >= dataIni && data <= dataFim) numAulas++;

    salvarConteudo(mesParaString(dataIni.getMonth()), dataIni.getDate(), dataFim.getDate(), numAulas, observacoes, conteudo, tecnicas, recursos);
}

function stringParaDate(str) {
    str = str.split("/");
    if (str.length < 3) str[2] = new Date().getFullYear(); // se não informou o ano (18/05)
    else if (str[2].length == 2) str[2] = "20" + str[2]; // se não informou o ano completo (18/05/22)
    return new Date(str[2], str[1] - 1, str[0]);
}

function mesParaString(mes) {
    if (mes == 0) return "1 - Janeiro";
    if (mes == 1) return "2 - Fevereiro";
    if (mes == 2) return "3 - Março";
    if (mes == 3) return "4 - Abril";
    if (mes == 4) return "5 - Maio";
    if (mes == 5) return "6 - Junho";
    if (mes == 6) return "7 - Julho";
    if (mes == 7) return "8 - Agosto";
    if (mes == 8) return "9 - Setembro";
    if (mes == 9) return "10 - Outubro";
    if (mes == 10) return "11 - Novembro";
    return "12 - Dezembro";
}

function salvarConteudo(mes, inicio, fim, qtd, observacoes, conteudo, tecnicas, recursos) {
    if (qtd < 1) return; // valor inválido, não faz o fetch

    contador++;
    fetch(url + "salvar_form_proposta_trabalho", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,es;q=0.7,pt;q=0.6",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Linux\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": url + "editar/" + planoId,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `_method=PUT&data[PlanoEnsino][id]=${planoId}&_method=POST&data[PlanoEnsinoPropostaTrabalho][id]=&data[PlanoEnsinoPropostaTrabalho][plano_ensino_id]=${planoId}&data[PlanoEnsinoPropostaTrabalho][mes]=${mes}&data[PlanoEnsinoPropostaTrabalho][inicio]=${inicio}&data[PlanoEnsinoPropostaTrabalho][fim]=${fim}&data[PlanoEnsinoPropostaTrabalho][qt_aulas]=${qtd}&data[PlanoEnsinoPropostaTrabalho][observacoes]=${observacoes}&data[PlanoEnsinoPropostaTrabalho][conteudo]=${conteudo}&data[PlanoEnsinoPropostaTrabalho][tecnicas_ensino][]=${tecnicas}&data[PlanoEnsinoPropostaTrabalho][recursos_ensino][]=${recursos}`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(() => { if (--contador <= 0) window.location.reload(false); });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.func) {
        this[request.func](request.dados);
    }
    sendResponse({ url: window.location.href });
});
