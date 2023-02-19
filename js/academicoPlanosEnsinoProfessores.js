init()

function abrirPlanosProfessores() {
	Array.from(document.querySelectorAll("a")).filter(el => el.textContent.toLowerCase() == "ver plano").forEach((el) => {
		url = el.href.substring(0, el.href.indexOf('?'))
		window.open(url, '_blank')
	})

}

function init() {
	let btnAbrirPlanosProfessores = htmlToElement('<a href="#" title="Abrir planos dos professores" class="btn btn-primary">Abrir planos dos professores</a>');
	document.getElementById("datatable_length").insertAdjacentElement("beforeend", btnAbrirPlanosProfessores);
	btnAbrirPlanosProfessores.onclick = abrirPlanosProfessores;
}