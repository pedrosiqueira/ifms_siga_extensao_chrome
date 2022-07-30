async function addPresenca() {
    let myMap = new Map(); // como nao tem hashset, vms usar hashmap

    Array.from(document.querySelectorAll('a[href*="presencaTodos"]')).forEach(e => {
        e.removeAttribute("onclick");
        myMap.set(e.getAttribute("href"), null); // varios links sao os mesmos, entao eu tiro os repetidos
    })

    await openModalAlert()

    for (var key of myMap.keys()) {
        customFetch(key, {})
    }
}

async function init() {
    let btnAddPresenca = htmlToElement('<a class="dt-button buttons-html5" tabindex="0" aria-controls="example" href="#"><span>Adicionar presença a todos</span></a>');
    querySelectorIncludesText("a", "PDF Horizontal").insertAdjacentElement("afterend", btnAddPresenca);
    btnAddPresenca.onclick = addPresenca;
}

window.addEventListener('load', (event) => { init(); }); // só executa o script depois q a página terminou de ser carregada
