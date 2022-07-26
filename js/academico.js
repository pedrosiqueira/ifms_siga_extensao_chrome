let contador; // variável que conta quantas requisições ajax foram feitas

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

function sendMessage(funcao, dados, callback) {
    chrome.runtime.sendMessage({ funcao: funcao, dados: dados }, callback);
}

function indexOfFirstDigit(input) {
    let i = 0;
    while (input[i] < '0' || input[i] > '9') i++;
    return i >= input.length ? -1 : i;
}

function indexOfLastDigit(input) {
    let i = input.length - 1;
    while (input[i] < '0' || input[i] > '9') i--;
    return i < 0 ? -1 : i;
}

function stringParaDate(str) {
    str = str.substring(indexOfFirstDigit(str), indexOfLastDigit(str) + 1); // faz o trim de qualquer coisa que nao seja número
    str = str.split("/");
    if (str.length < 3) str[2] = new Date().getFullYear(); // se não informou o ano (18/05)
    else if (str[2].length == 2) str[2] = "20" + str[2]; // se não informou o ano completo (18/05/22)
    return new Date(str[2], str[1] - 1, str[0]);
}

async function carregarDias() {
    let href = '' + location;
    href = href.replace(/(\d+).*/, "$1/conteudo");

    let response = await fetch(href);
    let html = await response.text();
    let dias = [];
    for (const match of html.matchAll(/<td>\d\d\/\d\d\/\d\d\d\d<\/td>/g)) {
        dias.push(match[0].substring(indexOfFirstDigit(match[0]), indexOfLastDigit(match[0]) + 1)); // faz o trim de qualquer coisa que nao seja número
    }
    return dias;
}

function openModalAlert() {
    contador = 0;
    document.getElementById('modalAlert').style.display = 'block';
    setTimeout(() => { // se depois de 1 segundo, o contador permanecer no zero, então pode desativar o modal
        if (contador == 0)
            document.getElementById('modalAlert').style.display = 'none';
    }, "1000");
}

function customFetch(url, data) {
    contador++
    fetch(url, data).then(() => {
        document.getElementById("modalAlert").innerHTML = "Aguarde... " + contador;
        if (--contador <= 0) window.location.reload(false);
    })
}

function navigateCell(e) {
    var code = e.which || e.keyCode;
    if (code == '38' && window.getSelection().anchorOffset == 0 && e.target.parentElement.previousElementSibling) { // Up
        e.target.parentElement.previousElementSibling.cells[e.target.cellIndex].focus()
    }
    else if (code == '40' && window.getSelection().anchorOffset == window.getSelection().anchorNode.textContent.length && e.target.parentElement.nextElementSibling) { // Down
        e.target.parentElement.nextElementSibling.cells[e.target.cellIndex].focus()

    }
    else if (code == '37' && window.getSelection().anchorOffset == 0 && e.target.previousElementSibling) { // Left
        e.target.previousElementSibling.focus()
    }
    else if (code == '39' && window.getSelection().anchorOffset == window.getSelection().anchorNode.textContent.length && e.target.nextElementSibling) { // Right
        e.target.nextElementSibling.focus()
    }
}

// cola de editores de planilha
function pasteCell(event) {
    event.preventDefault();
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    let col = event.target;
    while (col && col.tagName != 'TD') col = col.parentElement;
    let row = col;
    while (row && row.tagName != 'TR') row = row.parentElement;
    let tab = row;
    while (tab && tab.tagName != 'TABLE') tab = tab.parentElement;
    let rows = paste.replace(/(\r\n)|\r|\n/g, '\n').split("\n");
    for (let i = 0, r = row.rowIndex; i < rows.length && r < tab.rows.length; i++, r++) {
        let cells = rows[i].split("\t");
        for (let j = 0, c = col.cellIndex; j < cells.length && c < tab.rows[r].cells.length; j++, c++) {
            if (tab.rows[r].cells[c].getAttribute("contenteditable") == "true")
                tab.rows[r].cells[c].innerHTML = cells[j].trim();
        }
    }
}

function makeeditable(table, ignoreFirstRow = false, ignoreFirstColumn = false) {
    table.addEventListener('keydown', navigateCell);
    table.addEventListener('paste', pasteCell);

    let firstRow = ignoreFirstRow ? 1 : 0;
    let firstCol = ignoreFirstColumn ? 1 : 0;

    for (let i = firstRow; i < table.rows.length; i++) {
        for (let j = firstCol; j < table.rows[i].cells.length; j++) {
            // with contenteditable in each cell, it is possible to navigate through them with tab key
            table.rows[i].cells[j].setAttribute("contenteditable", "true");
        }
    }
}

/** https://stackoverflow.com/a/67398903/4072641 */
function querySelectorIncludesText(selector, text) {
    return Array.from(document.querySelectorAll(selector))
        .find(el => el.textContent.includes(text));
}