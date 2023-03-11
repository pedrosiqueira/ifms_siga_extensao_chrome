function diffTime(t1, t2) {
    t1 = t1.split(":").map(str => parseInt(str))
    t2 = t2.split(":").map(str => parseInt(str))
    return (t2[0] - t1[0]).toString().padStart(2, "0") + ":" + (t2[1] - t1[1]).toString().padStart(2, "0") + ":" + (t2[2] - t1[2]).toString().padStart(2, "0")
}

function logSaidas() {
    table = document.querySelector('#tabela-frequencias tbody')
    saidas = ""
    for (let i = 0; i < table.rows.length; i++) {
        spans = table.rows[i].cells[2].querySelectorAll('span');
        saida = spans[spans.length - 1].innerText
        horas = parseInt(saida.substring(0, 2))
        if (horas >= 0 && horas <= 1) saida = (horas + 24) + saida.substring(2) // adicional noturno é para horário de 22:00:00 pra cima
        if (horas < 22 || isNaN(horas)) continue
        data = table.rows[i].cells[1].querySelector('strong').innerText
        dia = table.rows[i].cells[1].querySelectorAll('p')[1].innerText
        tempo = diffTime("22:00:00", saida)
        saidas += data + "\t" + dia + "\t" + saida + "\t" + tempo + "\n"
    }
    console.log(saidas)
}

function changeDisplay(display) {
    if (document.getElementById("breadcrumbs")) document.getElementById("breadcrumbs").style.display = display;
    document.querySelectorAll("h3").forEach(el => { if (el.textContent.includes('Filtros')) { el.parentElement.style.display = display; } });
    // document.querySelectorAll("h3").forEach(el => { if (el.textContent.includes('Detalhamento das Horas')) { el.parentElement.style.display = display; } });
    document.querySelectorAll(".page-break").forEach(el => el.style.display = display);
    document.querySelectorAll(".action-links.hide-sm").forEach(el => el.style.display = display);
    document.querySelectorAll(".msg").forEach(el => el.style.display = display);
}

function imprimir() {
    changeDisplay("none");
    for (let t of document.getElementsByTagName("table"))
        t.setAttribute("border", 1);
}


function imprimido() {
    changeDisplay("block");
}

async function init() {
    window.onbeforeprint = imprimir;
    window.onafterprint = imprimido;

    let btnLogSaidas = htmlToElement('<button class="btn" style="margin-left: 10px" ><span class="fas fa-terminal" aria-hidden="true"></span> Log saídas noturnas</button>');
    document.querySelector(".mostrarTodasObservacoes").insertAdjacentElement("afterend", btnLogSaidas);
    btnLogSaidas.onclick = logSaidas;
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada
