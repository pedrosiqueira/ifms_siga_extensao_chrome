function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addPresenca() {
    $as = $("a:contains('?')");
    //$as.removeAttr("onclick");
    // $as.each(function () {
    //     $(this).removeAttr("onclick");
    // });
    let myMap = new Map();
    $as.each(function (i, e) {//varios links sao os mesmos, entao eu tiro os repetidos
        myMap.set($(this).attr("href"), $as[i]);
    });
    console.log(myMap.size);
    for (var value of myMap.values()) {
        // value.removeAttr("onclick");
        value.click();
        await sleep(400);//cada clique eh uma requisicao. eu tenho q esperar um tempo antes de realizar outra requisicao, senao ela nao eh feita
    }
}

function darFalta($nome, $data) {
    alterar($nome, $data, '•');
}

function darPresenca($nome, $data) {
    alterar($nome, $data, 'F');
}

function alterar($nome, $data, $situacao) {
    $es = $("a[title^='" + $nome + "']");
    if ($data != null && $data != "") {
        // $es = $es.filter("[id*='"+$aula+"']");
        $es = $es.filter(function () {
            return menor($data, extrairData($(this).attr("title")));
        });
    }
    $es.each(function (i, e) {
        if ($(this).html() == $situacao) {
            this.click();
        }
    });
}

function menor($d1, $d2) {
    $d1 = Date.parse($d1);
    $d2 = Date.parse($d2);
    return $d1 <= $d2;
}

function extrairData(myString) {
    let myRegexp = /\d{2}[-.\/]\d{2}(?:[-.\/]\d{2}(\d{2})?)?/g; //Check pattern only
    let dataBR = myRegexp.exec(myString)[0];
    if (dataBR.length === 10) {// 06/12/2018 converte para 2018-12-06
        return dataBR.substring(6, 10) + "-" + dataBR.substring(3, 5) + "-" + dataBR.substring(0, 2);
    } else if (dataBR.length === 10) {// 06/12/18 converte para 18-12-06
        return dataBR.substring(6, 8) + "-" + dataBR.substring(3, 5) + "-" + dataBR.substring(0, 2);
    }
}

function preencherAula(id, conteudo) {
    var href = "/administrativo/professores/salvarConteudo/" + id;
    var td = $("td#conteudo_" + id);
    $('body').css({cursor: 'wait'});

    $.ajax({
        url: href,
        type: "POST",
        data: {conteudo: conteudo}
    }).done(function (html) {
        td.html(html);
        $('#conteudo_' + id).append('<a href="" id="' + id + '" class="edit_conteudo" title="Editar conteúdo"> <i class="icon-edit"></i></a>');
        $('body').css({cursor: 'default'});
    });
}

function getAllIds() {
    let $tds = $("td[id^=conteudo_");
    let $ids = [];
    $tds.each(function () {//varios links sao os mesmos, entao eu tiro os repetidos
        $ids.push($(this).attr("id").substring(9));
    });
    return $ids;
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.funcao === 'btnFalta') {
        let nomes = $(".foto_estudante").map(function () {
            return $(this).html();
        });
        sendResponse(nomes);
    } else if (msg.funcao === 'darFalta') {
        darFalta(msg.nome, msg.data);
    } else if (msg.funcao === 'darPresenca') {
        darPresenca(msg.nome, msg.data);
    } else if (msg.funcao === 'preencherConteudo') {
        $ids = getAllIds();
        for (let i = 0; i < $ids.length; i++) {
            preencherAula($ids[i], msg.conteudo[i]);
        }
    } else if(msg.funcao === 'addPresenca') {
      addPresenca();
    }
});
