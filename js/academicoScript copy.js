
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