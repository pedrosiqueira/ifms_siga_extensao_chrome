let notSaved = "backgroundcoloryellow"

function alterarBackground(e) {
    if (e.target.nodeName == "#text")
        e.target.parentElement.classList.add(notSaved)
    else if (e.target.nodeName == "TD")
        e.target.classList.add(notSaved)
}

function salvarAlteracao(e) {
    let el = e.target ?? e // e pode ser um event que possui um element, ou o próprio element
    if (el.classList.contains(notSaved)) {
        let id = el.getAttribute("id")
        let body = id.substring(0, indexOfFirstDigit(id) - 1)
        let Body = body.charAt(0).toUpperCase() + body.slice(1); // capitalize first letter
        id = id.substring(indexOfFirstDigit(id))
        fetch(`https://academico.ifms.edu.br/administrativo/professores/salvar${Body}/${id}`, {
            "headers": { "Content-Type": "application/x-www-form-urlencoded" },
            "body": `${body}=${encodeURIComponent(el.innerHTML)}`,
            "method": "POST",
        }).then((response) => {
            el.classList.remove(notSaved)
            el.classList.toggle('backgroundcolorgreen')
        });
    }
}

function salvarAlteracoes() {
    Array.from(document.querySelectorAll("td[id^=conteudo_].backgroundcoloryellow, td[id^=obs_].backgroundcoloryellow")).forEach(e => {
        salvarAlteracao(e)
    })
}

function limparConteudoObservacoes() {
    Array.from(document.querySelectorAll("td[id^=conteudo_], td[id^=obs_]")).forEach(e => {
        e.innerHTML = ""
    })
}

async function init() {
    let btnSalvarAlteracoes = htmlToElement('<a id="salvarAlteracoes" class="btn btn-small btn-primary no-print" title="Salvar alterações pendentes (em amarelo)" style="margin-left: 10px"><i class="icon-upload icon-white"></i> Salvar alterações</a>');
    querySelectorIncludesText("a", "Adicionar Aula").insertAdjacentElement("afterend", btnSalvarAlteracoes);
    btnSalvarAlteracoes.onclick = salvarAlteracoes;

    let btnLimpar = htmlToElement('<a id="limparConteudoObservacoes" class="btn btn-small btn-danger no-print" title="Limpar todos os conteúdos e observações" style="margin-left: 10px"><i class="icon-trash icon-white"></i> Limpar conteúdos e observações</a>');
    document.getElementById("salvarAlteracoes").insertAdjacentElement("afterend", btnLimpar);
    btnLimpar.onclick = limparConteudoObservacoes;

    let info = htmlToElement('<div> <br>Informações: <ul> <li>Você pode colar dados de um editor de planilhas.</li> <li>Para salvar, basta trocar de célula ou apertar o botão "salvar alterações".</li> <li>Para trocar de célula, tecle [tab] ou as setas direcionais.</li> </ul> </div>')
    document.getElementById("limparConteudoObservacoes").insertAdjacentElement("afterend", info);

    Array.from(document.querySelectorAll("td[id^=conteudo_], td[id^=obs_]")).forEach(e => {
        e.innerHTML = e.innerHTML.substring(0, e.innerHTML.indexOf("<a href=")).trim()
        e.setAttribute("contenteditable", "true")
        e.addEventListener('paste', pasteCell);
        e.addEventListener('keydown', navigateCell);
        e.addEventListener('input', alterarBackground);
        e.addEventListener('paste', alterarBackground);
        e.addEventListener("focusout", salvarAlteracao)
    })
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada