import { pegarDataHoje } from "./tarefas.js";

export function criarCard(tarefa, callbacks) {
    const card = document.createElement("div");
    card.classList.add("card");

    if (tarefa.concluida) {
        card.classList.add("concluida");
    }

    const agora = new Date();
    const tarefaDataHora = new Date(`${tarefa.data}T${tarefa.hora || "00:00"}`);

    if (!tarefa.concluida) {
        if (tarefaDataHora.getTime() + 60_000 < agora.getTime()) {
            card.classList.add("status-atrasada");
        }

        const hoje = pegarDataHoje();

        if (
            tarefa.data === hoje &&
            tarefaDataHora.getTime() + 60_000 >= agora.getTime()
        ) {
            card.classList.add("status-hoje");
        }

        if (tarefa.data > hoje) {
            card.classList.add("status-proxima");
        }
    }

    card.innerHTML = `
        <div class="card-info">
            <div class="card-titulo">${tarefa.titulo}</div>
            <div class="card-descricao">${tarefa.descricao || ""}</div>
            <div class="card-data">
                ${tarefa.data}${tarefa.hora ? " • " + tarefa.hora : ""}
            </div>
        </div>

        <div class="card-actions">
            <button class="btn-ok">
                <img src="assets/ok.png" alt="Concluir">
            </button>

            <button class="delete-btn">
                <img src="assets/lixo.png" alt="Excluir">
            </button>
        </div>
    `;

    const btnOk = card.querySelector(".btn-ok");
    const btnDeletar = card.querySelector(".delete-btn");

    btnOk.addEventListener("click", (e) => {
        e.stopPropagation();
        callbacks.onToggle(tarefa.id);
    });

    btnDeletar.addEventListener("click", (e) => {
        e.stopPropagation();
        callbacks.onDelete(tarefa.id);
    });

    card.addEventListener("click", () => {
        callbacks.onEdit(tarefa);
    });

    return card;
}

export function atualizarContadores(tarefas) {
    const agora = new Date();
    const hoje = pegarDataHoje();

    const qtdHoje = tarefas.filter(
        t => t.data === hoje && !t.concluida
    ).length;

    const qtdAtrasadas = tarefas.filter(t => {
        if (t.concluida) return false;
        const tarefaDataHora = new Date(`${t.data}T${t.hora || "00:00"}`);
        return tarefaDataHora.getTime() + 60_000 < agora.getTime();
    }).length;

    const qtdProximas = tarefas.filter(
        t => t.data > hoje && !t.concluida
    ).length;

    const qtdConcluidas = tarefas.filter(
        t => t.concluida
    ).length;

    document.querySelector('[data-secao="hoje"]').textContent =
        `Hoje (${qtdHoje})`;

    document.querySelector('[data-secao="atrasadas"]').textContent =
        `Atrasadas (${qtdAtrasadas})`;

    document.querySelector('[data-secao="proximas"]').textContent =
        `Próximas (${qtdProximas})`;

    document.querySelector('[data-secao="concluidas"]').textContent =
        `Concluídas (${qtdConcluidas})`;
}