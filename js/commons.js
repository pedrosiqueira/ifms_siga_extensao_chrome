let contadorModalAlert; // variável que conta quantas requisições ajax foram feitas

async function fetchHTML(html) {
    html = await fetch(chrome.runtime.getURL("html/" + html + ".html"));
    html = await html.text();
    document.body.insertAdjacentHTML('beforeend', html);
}

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

async function openModalAlert() {
    if (!document.getElementById('modalAlert')) await fetchHTML("modal_alert")
    let modal = document.getElementById('modalAlert')
    contadorModalAlert = 0;
    modal.style.display = 'block';
    setTimeout(() => { // se depois de 1 segundo, o contador permanecer no zero, então pode desativar o modal
        if (contadorModalAlert == 0)
            modal.style.display = 'none';
    }, "1000");
}

function customFetch(url, data) {
    contadorModalAlert++
    fetch(url, data).then(() => {
        document.getElementById("modalAlert").innerHTML = "Aguarde... " + contadorModalAlert;
        if (--contadorModalAlert <= 0) window.location.reload(false);
    })
}

