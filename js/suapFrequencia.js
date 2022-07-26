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
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada
