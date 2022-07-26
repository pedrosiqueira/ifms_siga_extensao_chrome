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
