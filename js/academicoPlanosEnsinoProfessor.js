init()


function baixarPlano(doc) {
	let element = doc.getElementById("PlanoEnsinoDiarioForm")
	element.querySelector("#modal_editar_proposta").remove()
	element.querySelector("#modal_devolver").remove()
	element.querySelector("#modal_encaminhar_aprovacao").remove()
	element.querySelector("#modal_copiar_plano").remove()
	element.querySelector("#modal_adicionar_comentario_pegagogico").remove()

	let filecontent = element.outerHTML
	let filename = doc.querySelectorAll("td")[4].innerText + "," + doc.querySelectorAll("td")[3].innerText + "," + doc.querySelectorAll("td")[0].innerText
	download(filecontent, "text/html", filename)
}

function download(content, mimeType, filename) {
	const a = document.createElement('a') // Create "a" element
	const blob = new Blob([content], { type: mimeType }) // Create a blob (file-like object)
	const url = URL.createObjectURL(blob) // Create an object URL from blob
	a.setAttribute('href', url) // Set "a" element link
	a.setAttribute('download', filename) // Set download filename
	a.click() // Start downloading
}

function baixarPlanos() {
	qtdRegistros = document.querySelector("select")
	qtdRegistros.addEventListener("change", (e) => {
		Array.from(document.querySelectorAll("a")).filter(el => el.textContent == "Ver").forEach((el) => {
			fetch(el.href)
				.then((response) => response.text())
				.then((data) => {
					const parser = new DOMParser();
					const html = parser.parseFromString(data, 'text/html');
					if (html.querySelector("legend").innerText.toLowerCase().search("em cadastro") == -1)
						baixarPlano(html) // se estiver em cadastro, não baixo
				});
		})

	}, false)
	qtdRegistros.value = "-1"
	qtdRegistros.dispatchEvent(new Event('change'))

}

function init() {
	let btnBaixarPlanos = htmlToElement('<a class="dt-button buttons-pdf buttons-html5" tabindex="0" aria-controls="lista_planos_ensino" href="#"><span>Baixar planos</span></a>');
	document.querySelectorAll("div.dt-buttons")[0].insertAdjacentElement("beforeend", btnBaixarPlanos);
	btnBaixarPlanos.onclick = baixarPlanos;
}