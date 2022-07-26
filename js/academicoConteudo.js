let notSaved = "alert-warning"

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
        }).then((response) => el.classList.remove(notSaved));
    }
}

function salvarAlteracoes() {
    Array.from(document.querySelectorAll("td[id^=conteudo_].alert-warning, td[id^=obs_].alert-warning")).forEach(e => {
        salvarAlteracao(e)
    })
}

async function init() {
    let btnSalvarAlteracoes = htmlToElement('<a id="salvarAlteracoes" class="btn btn-small btn-primary no-print" title="Salvar alterações pendentes (em amarelo)" style="margin-left: 10px"><i class="icon-upload icon-white"></i> Salvar alterações</a>');
    querySelectorIncludesText("a", "Adicionar Aula").insertAdjacentElement("afterend", btnSalvarAlteracoes);
    btnSalvarAlteracoes.onclick = salvarAlteracoes;

    Array.from(document.querySelectorAll("td[id^=conteudo_], td[id^=obs_]")).forEach(e => {
        e.innerHTML = e.innerHTML.substring(0, e.innerHTML.indexOf("<a href=")).trim()
        e.setAttribute("contenteditable", "true")
        e.addEventListener('paste', pasteCell);
        e.addEventListener('keydown', navigateCell);
        e.addEventListener('DOMSubtreeModified', alterarBackground); // evento 'change' nao captura quando innerHTML é alterado
        e.addEventListener("focusout", salvarAlteracao)
    })
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada