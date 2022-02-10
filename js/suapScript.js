function changeDisplay(display) {
    document.getElementById("breadcrumbs").style.display = display;
    if (document.getElementById("feedback_message"))
        document.getElementById("feedback_message").style.display = display;
    document.getElementsByClassName("box filters collapsed")[0].style.display = display;
    document.getElementsByClassName("page-break")[0].style.display = display;
    document.getElementsByClassName("action-links hide-sm")[0].style.display = display;
    for (let m of document.getElementsByClassName("msg info"))
        m.style.display = display;
}


function imprimir() {
    changeDisplay("none");
    for (let t of document.getElementsByTagName("table"))
        t.setAttribute("border", 1);
    print(document.querySelector("#content"));
    changeDisplay("block");
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.func) {
        this[request.func]();
    }
    sendResponse({url: window.location.href});
});
