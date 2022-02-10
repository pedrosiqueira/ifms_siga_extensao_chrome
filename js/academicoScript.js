var contador;
//
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
        contador++;
        preencherAula($ids[i], linhas[i]);
    }

}

function preencherAula(id, conteudo) {
    var href = "/administrativo/professores/salvarConteudo/" + id;
    var td = $("td#conteudo_" + id);

    $.post(href, {conteudo: conteudo}
    ).done(function () {
        contador--;
        if (contador <= 0)
            window.location.reload(false);
    });
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
            contador++;
            preencherReposicao2(td.attr("id").substring(9), fields);
        }
    }
}

function preencherReposicao2(id, fields) {
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
    ).done(function () {
        contador--;
        if (contador <= 0)
            window.location.reload(false);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.func) {
        this[request.func](request.dados);
    }
    sendResponse({url: window.location.href});
});
