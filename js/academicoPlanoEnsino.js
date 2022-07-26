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

function getWeek(date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    var millisecsInDay = 86400000;
    return Math.ceil((((date - onejan) / millisecsInDay) + onejan.getDay() + 1) / 7);
}

function salvarConteudo(mes, inicio, fim, qtd, observacoes, conteudo, tecnicas, recursos, url, planoId) {
    if (qtd < 1) return; // valor inválido

    customFetch(url + "salvar_form_proposta_trabalho", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        },
        "body": `_method=PUT&data[PlanoEnsino][id]=${planoId}&_method=POST&data[PlanoEnsinoPropostaTrabalho][id]=&data[PlanoEnsinoPropostaTrabalho][plano_ensino_id]=${planoId}&data[PlanoEnsinoPropostaTrabalho][mes]=${mes}&data[PlanoEnsinoPropostaTrabalho][inicio]=${inicio}&data[PlanoEnsinoPropostaTrabalho][fim]=${fim}&data[PlanoEnsinoPropostaTrabalho][qt_aulas]=${qtd}&data[PlanoEnsinoPropostaTrabalho][observacoes]=${observacoes}&data[PlanoEnsinoPropostaTrabalho][conteudo]=${conteudo}&data[PlanoEnsinoPropostaTrabalho][tecnicas_ensino][]=${tecnicas}&data[PlanoEnsinoPropostaTrabalho][recursos_ensino][]=${recursos}`,
        "method": "POST"
    });
}

function salvarProposta(proposta, dias) {

    let url = '' + location;
    let planoId = url.match(/\d+/g)[1];
    url = url.replace(/plano_ensino.*/, "plano_ensino/");

    openModalAlert();

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

            salvarConteudo(mesParaString(dataIni2.getMonth()), dataIni2.getDate(), dataFim2.getDate(), numAulas2, proposta[i].observacoes, proposta[i].conteudo, proposta[i].tecnicas, proposta[i].recursos, url, planoId);
        }

        let numAulas = 0;
        if (i + 1 < proposta.length && +proposta[i].dataIni == +proposta[i + 1].dataIni ||
            i - 1 >= 0 && +proposta[i].dataIni == +proposta[i - 1].dataIni) { // se houver dois conteúdos com a mesma data, então cada conteúdo é uma aula
            // o '+' na frente da data é para converter a data para milissegundos e comparar datas https://stackoverflow.com/a/16713809/4072641
            numAulas = 1;
        } else { // se um conteúdo estiver em apenas uma data, então todas as aulas daquela data é daquele conteúdo
            for (let dia of dias) if (stringParaDate(dia) >= proposta[i].dataIni && stringParaDate(dia) <= proposta[i].dataFim) numAulas++;
        }
        salvarConteudo(mesParaString(proposta[i].dataIni.getMonth()), proposta[i].dataIni.getDate(), proposta[i].dataFim.getDate(), numAulas, proposta[i].observacoes, proposta[i].conteudo, proposta[i].tecnicas, proposta[i].recursos, url, planoId);
    }
}

function apagarProposta() {
    let apagar = confirm("Tem certeza que deseja apagar toda a proposta?");
    if (!apagar) return;

    openModalAlert();

    let url = '' + location;
    url = url.replace(/editar.*/, "excluir_proposta_trabalho/");

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
    await fetchHTML("academico/propostaplano");

    let btnGerar = htmlToElement('<a id="modalPropostaBtn" class="btn btn-mini btn-success no-print" title="Gera proposta a partir do calendário" style="margin-left: 10px" href="#modalProposta" role="button"  data-toggle="modal"><i class="icon-list icon-white"></i> Gerar proposta completa</a>');
    let btnApagar = htmlToElement('<a id="apagar_proposta" class="btn btn-mini btn-danger no-print" title="Apaga toda a proposta de trabalho" style="margin-left: 10px"><i class="icon-remove icon-white"></i> Apagar proposta completa</a>');
    document.getElementsByClassName("adicionar_proposta")[0].appendChild(btnGerar);
    document.getElementsByClassName("adicionar_proposta")[0].appendChild(btnApagar);
    document.getElementById("apagar_proposta").onclick = (e) => apagarProposta();

    let tab = document.getElementById("proposta");
    let dias = await carregarDias();
    for (let i = 0; i < dias.length; i++) {
        let tr = htmlToElement('<tr> <td></td> <td></td> <td></td> <td></td> <td></td> </tr>');
        tab.appendChild(tr);
    }
    makeeditable(tab);

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
}

async function init() {
    fetchHTML("modal_alert");

    carregarPlanoEnsino();
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada