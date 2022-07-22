let contador; // variável que conta quantas requisições ajax foram feitas
let url;
let planoId;

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function indexOfFirstDigit(input) {
    let i = 0;
    for (; input[i] < '0' || input[i] > '9'; i++);
    return i >= input.length ? -1 : i;
}

function indexOfLastDigit(input) {
    let i = input.length - 1;
    for (; input[i] < '0' || input[i] > '9'; i--);
    return i < 0 ? -1 : i;
}

function stringParaDate(str) {
    str = str.substring(indexOfFirstDigit(str), indexOfLastDigit(str) + 1); // faz o trim de qualquer coisa que nao seja número
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

async function carregarDias() {
    let href = '' + location;
    href = href.replace(/(\d+).*/, "$1/conteudo");

    let response = await fetch(href);
    let html = await response.text();
    let dias = [];
    for (const match of html.matchAll(/<td>\d\d\/\d\d\/\d\d\d\d<\/td>/g)) {
        dias.push(match[0].substring(indexOfFirstDigit(match[0]), indexOfLastDigit(match[0]) + 1)); // faz o trim de qualquer coisa que nao seja número
    }
    return dias;
}

function getWeek(date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    var millisecsInDay = 86400000;
    return Math.ceil((((date - onejan) / millisecsInDay) + onejan.getDay() + 1) / 7);
}

function makeeditable(table) {
    table.addEventListener('keydown', (e) => {
        var code = e.which || e.keyCode;
        if (code == '38' && window.getSelection().anchorOffset == 0 && e.target.parentElement.previousElementSibling) { // Up
            e.target.parentElement.previousElementSibling.cells[e.target.cellIndex].focus()
        }
        else if (code == '40' && window.getSelection().anchorOffset == window.getSelection().anchorNode.textContent.length && e.target.parentElement.nextElementSibling) { // Down
            e.target.parentElement.nextElementSibling.cells[e.target.cellIndex].focus()

        }
        else if (code == '37' && window.getSelection().anchorOffset == 0 && e.target.previousElementSibling) { // Left
            e.target.previousElementSibling.focus()
        }
        else if (code == '39' && window.getSelection().anchorOffset == window.getSelection().anchorNode.textContent.length && e.target.nextElementSibling) { // Right
            e.target.nextElementSibling.focus()
        }
    });
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            // with contenteditable in each cell, it is possible to navigate through them with tab key
            table.rows[i].cells[j].setAttribute("contenteditable", "true");
        }
    }
}

function addpastelistener(table) {
    table.addEventListener('paste', (event) => {
        event.preventDefault();
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        let col = event.target;
        while (col && col.tagName != 'TD') col = col.parentElement;
        let row = col;
        while (row && row.tagName != 'TR') row = row.parentElement;
        let tab = row;
        while (tab && tab.tagName != 'TABLE') tab = tab.parentElement;
        let rows = paste.replace(/(\r\n)|\r|\n/g, '\n').split("\n");
        for (let i = 0, r = row.rowIndex; i < rows.length && r < tab.rows.length; i++) {
            let cells = rows[i].split("\t");
            for (let j = 0, c = col.cellIndex; j < cells.length && c < tab.rows[r].cells.length; j++) {
                tab.rows[r].cells[c].innerHTML = cells[j].trim();
                c++;
            }
            r++;
        }
    });
}

function customFetch(url, data) {
    contador++
    fetch(url, data).then(() => {
        document.getElementById("modalAlert").innerHTML = "Aguarde... " + contador;
        if (--contador <= 0) window.location.reload(false);
    })
}

function salvarConteudo(mes, inicio, fim, qtd, observacoes, conteudo, tecnicas, recursos) {
    if (qtd < 1) return; // valor inválido

    customFetch(url + "salvar_form_proposta_trabalho", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
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
    });
}

function salvarProposta(proposta, dias) {
    document.getElementById('modalAlert').style.display = 'block';

    url = '' + location;
    planoId = url.match(/\d+/g)[1];
    url = url.replace(/plano_ensino.*/, "plano_ensino/");
    contador = 0;

    proposta = Array.prototype.map.call(proposta.rows, (el) => {
        let dataIni = el.cells[0].innerHTML.replaceAll(/\s/g, '').split('-');
        let dataFim = stringParaDate(dataIni.length > 1 ? dataIni[1] : dataIni[0]);
        dataIni = stringParaDate(dataIni[0]);
        if (dataIni > dataFim) { let tmp = dataIni; dataIni = dataFim; dataFim = tmp; }
        return { dataIni: dataIni, dataFim: dataFim, conteudo: el.cells[1].innerHTML.trim(), tecnicas: el.cells[2].innerHTML.trim(), recursos: el.cells[3].innerHTML.trim(), observacoes: el.cells[4].innerHTML.trim() };
    }).filter(el => !isNaN(el.dataIni) && el.conteudo).sort((a, b) => a.dataIni - b.dataIni);

    for (let i = 0; i < proposta.length; i++) {
        // como o plano de ensino só aceita períodos no mesmo mes, se forem meses diferentes, precisamos criar dois períodos, um para cada mês. se for um período maior q 2 meses já não funciona.
        if (proposta[i].dataIni.getMonth() < proposta[i].dataFim.getMonth() - 1) {
            continue;
        }
        else if (proposta[i].dataIni.getMonth() == proposta[i].dataFim.getMonth() - 1) {
            let dataIni2 = new Date(proposta[i].dataFim.getFullYear(), proposta[i].dataFim.getMonth(), 1); // primeiro dia do mes
            let dataFim2 = proposta[i].dataFim;
            proposta[i].dataFim = new Date(proposta[i].dataIni.getFullYear(), proposta[i].dataIni.getMonth() + 1, 0); // ultimo dia do mes

            let numAulas2 = 0;
            for (let dia of dias) if (stringParaDate(dia) >= dataIni2 && stringParaDate(dia) <= dataFim2) numAulas2++;

            salvarConteudo(mesParaString(dataIni2.getMonth()), dataIni2.getDate(), dataFim2.getDate(), numAulas2, proposta[i].observacoes, proposta[i].conteudo, proposta[i].tecnicas, proposta[i].recursos);
        }

        let numAulas = 0;
        if (i + 1 < proposta.length && +proposta[i].dataIni == +proposta[i + 1].dataIni ||
            i - 1 >= 0 && +proposta[i].dataIni == +proposta[i - 1].dataIni) { // se houver dois conteúdos com a mesma data, então cada conteúdo é uma aula
            // o '+' na frente da data é para converter a data para milissegundos e comparar datas https://stackoverflow.com/a/16713809/4072641
            numAulas = 1;
        } else { // se um conteúdo estiver em apenas uma data, então todas as aulas daquela data é daquele conteúdo
            for (let dia of dias) if (stringParaDate(dia) >= proposta[i].dataIni && stringParaDate(dia) <= proposta[i].dataFim) numAulas++;
        }
        salvarConteudo(mesParaString(proposta[i].dataIni.getMonth()), proposta[i].dataIni.getDate(), proposta[i].dataFim.getDate(), numAulas, proposta[i].observacoes, proposta[i].conteudo, proposta[i].tecnicas, proposta[i].recursos);
    }
}

function apagarProposta() {
    let apagar = confirm("Tem certeza que deseja apagar toda a proposta?");
    if (!apagar) return;

    document.getElementById('modalAlert').style.display = 'block';

    url = '' + location;
    planoId = url.match(/\d+/g)[1];
    url = url.replace(/editar.*/, "excluir_proposta_trabalho/");
    contador = 0;

    Array.from(document.getElementsByClassName('excluir_proposta')).forEach(e => {
        customFetch(url + e.getAttribute('proposta-id'), {
            "headers": {
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    });
}

async function carregarPlanoEnsino() {
    let dias = await carregarDias();

    sendMessage("fetchHTML", { html: "modal_alert" }, html => {
        let modalAlert = htmlToElement(html)
        document.getElementsByClassName("meio")[0].appendChild(modalAlert);
    })

    sendMessage("fetchHTML", { html: "academico/propostaplano" }, html => {
        let modal = htmlToElement(html);
        document.getElementsByClassName("meio")[0].appendChild(modal);

        let btnGerar = htmlToElement('<a id="modalPropostaBtn" class="btn btn-mini btn-success no-print" title="Gera proposta a partir do calendário" style="margin-left: 10px" href="#modalProposta" role="button"  data-toggle="modal"><i class="icon-list icon-white"></i> Gerar proposta completa</a>');
        let btnApagar = htmlToElement('<a id="apagar_proposta" class="btn btn-mini btn-danger no-print" title="Apaga toda a proposta de trabalho" style="margin-left: 10px"><i class="icon-remove icon-white"></i> Apagar proposta</a>');
        document.getElementsByClassName("adicionar_proposta")[0].appendChild(btnGerar);
        document.getElementsByClassName("adicionar_proposta")[0].appendChild(btnApagar);
        document.getElementById("apagar_proposta").onclick = (e) => apagarProposta();
        let tab = document.getElementById("proposta");
        for (let i = 0; i < dias.length; i++) {
            let tr = htmlToElement('<tr> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>');
            tab.appendChild(tr);
        }
        makeeditable(tab);
        addpastelistener(tab);

        document.getElementById("salvar_proposta").onclick = (e) => salvarProposta(tab, dias);
        document.getElementById("tipoProposta").onchange = (e) => {
            for (let i = 0; i < dias.length; i++) {
                tab.rows[i].cells[0].innerHTML = "";
            }
            if (e.target.value == "Por aula") {
                for (let i = 0; i < dias.length; i++) {
                    tab.rows[i].cells[0].innerHTML = dias[i];
                }
            } else if (e.target.value == "Por dia") {
                tab.rows[0].cells[0].innerHTML = dias[0];
                for (let i = 1, j = 1; i < dias.length; i++) {
                    if (dias[i] != dias[i - 1])
                        tab.rows[j++].cells[0].innerHTML = dias[i];
                }
            } else if (e.target.value == "Por semana") {
                let semana = getWeek(stringParaDate(dias[0]));
                let ini = dias[0];
                let j = 0;
                for (let i = 0; i < dias.length; i++) {
                    let tmp = getWeek(stringParaDate(dias[i]))
                    if (tmp != semana) {
                        tab.rows[j++].cells[0].innerHTML = ini + "-" + dias[i - 1];
                        semana = tmp;
                        ini = dias[i];
                    }
                }
            }
        }
    });
}

function sendMessage(funcao, dados, callback) {
    chrome.runtime.sendMessage({ funcao: funcao, dados: dados }, callback);
}

function init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.funcao) this[request.funcao](request.dados);
        // sendResponse({ url: window.location.href });
    });

    if (window.location.href.includes("plano_ensino/editar")) carregarPlanoEnsino();

}

window.addEventListener('load', (event) => { init(); });