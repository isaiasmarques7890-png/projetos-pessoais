// tarefas.js
export function ordenarPorDataHora(tarefas) {
    return tarefas.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.hora || "00:00"}`);
        const dataB = new Date(`${b.data}T${b.hora || "00:00"}`);
        return dataA - dataB;
    });
}

export function pegarDataHoje() {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
}

export function filtrarTarefas(tarefas, secaoAtual) {
    const hoje = pegarDataHoje();

    if (secaoAtual === "hoje") {
        return tarefas.filter(t => t.data === hoje && !t.concluida);
    }

    if (secaoAtual === "atrasadas") {
    const agora = new Date();

    return tarefas.filter(t => {
        if (t.concluida) return false;

        // cria Date completo da tarefa
        const tarefaDataHora = new Date(`${t.data}T${t.hora || "00:00"}`);

        // entra em atrasadas se já passou do horário + 1 minuto
        return tarefaDataHora.getTime() + 60_000 < agora.getTime();
    });
}

    if (secaoAtual === "proximas") {
        return tarefas.filter(t => t.data > hoje && !t.concluida);
    }

    if (secaoAtual === "concluidas") {
        return tarefas.filter(t => t.concluida);
    }

    return [];
}