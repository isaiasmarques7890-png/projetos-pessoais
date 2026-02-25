export function salvarNoStorage(tarefas) {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

export function carregarDoStorage() {
    const dados = localStorage.getItem("tarefas");
    return dados ? JSON.parse(dados) : [];
}