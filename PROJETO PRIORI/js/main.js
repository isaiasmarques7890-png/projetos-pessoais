import { salvarNoStorage, carregarDoStorage } from "./storage.js";
import { filtrarTarefas } from "./tarefas.js";
import { criarCard, atualizarContadores } from "./ui.js";

// =============================
// ESTADO
// =============================
let tarefas = carregarDoStorage();
let secaoAtual = "hoje";
let modoEdicao = false;
let tarefaEditandoId = null;
let termoBusca = "";

// =============================
// ELEMENTOS
// =============================
const abas = document.querySelectorAll(".aba");
const btnAbrirForm = document.getElementById("btn-abrir-form");
const btnVoltar = document.getElementById("btn-voltar");
const telaPrincipal = document.getElementById("tela-principal");
const telaFormulario = document.getElementById("tela-formulario");
const btnSalvar = document.getElementById("btn-salvar");
const inputTitulo = document.getElementById("titulo");
const inputDescricao = document.getElementById("descricao");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");
const inputBusca = document.getElementById("input-busca");

// =============================
// BUSCA EM TEMPO REAL
// =============================
inputBusca?.addEventListener("input", e => {
    termoBusca = e.target.value.toLowerCase();
    renderizar();
});

// =============================
// CONTROLE DAS ABAS
// =============================
abas.forEach(aba => {
    aba.addEventListener("click", function () {
        abas.forEach(item => item.classList.remove("ativa"));
        this.classList.add("ativa");
        secaoAtual = this.dataset.secao;
        renderizar();
    });
});

// =============================
// FORMULÁRIO
// =============================
btnAbrirForm.addEventListener("click", () => {
    telaPrincipal.classList.add("oculto");
    telaFormulario.classList.remove("oculto");
    inputTitulo.focus();
});

btnVoltar.addEventListener("click", () => {
    limparFormulario();
    telaFormulario.classList.add("oculto");
    telaPrincipal.classList.remove("oculto");
});

// =============================
// SALVAR (CRIAR OU EDITAR)
btnSalvar.addEventListener("click", () => {
    if (!inputTitulo.value || !inputData.value) {
        alert("Preencha o título e a data.");
        return;
    }

    if (modoEdicao) {
        tarefas = tarefas.map(t =>
            t.id === tarefaEditandoId
                ? { ...t, titulo: inputTitulo.value, descricao: inputDescricao.value, data: inputData.value, hora: inputHora.value }
                : t
        );
        modoEdicao = false;
        tarefaEditandoId = null;
    } else {
        const novaTarefa = {
            id: Date.now(),
            titulo: inputTitulo.value,
            descricao: inputDescricao.value,
            data: inputData.value,
            hora: inputHora.value,
            concluida: false
        };
        tarefas.push(novaTarefa);
    }

    salvarNoStorage(tarefas);
    renderizar();
    limparFormulario();
    telaFormulario.classList.add("oculto");
    telaPrincipal.classList.remove("oculto");
});

// =============================
// RENDERIZAR
function renderizar() {
    const lista = document.getElementById("lista-tarefas");
    lista.innerHTML = "";

    let tarefasFiltradas = filtrarTarefas(tarefas, secaoAtual);

    if (termoBusca) {
        tarefasFiltradas = tarefasFiltradas.filter(t =>
            t.titulo.toLowerCase().includes(termoBusca) ||
            (t.descricao && t.descricao.toLowerCase().includes(termoBusca)) ||
            t.data.includes(termoBusca) ||
            (t.hora && t.hora.includes(termoBusca))
        );
    }

    tarefasFiltradas.forEach(tarefa => {
        const card = criarCard(tarefa, {
            onToggle: toggleTarefa,
            onDelete: deletarTarefa,
            onEdit: editarTarefa
        });
        lista.appendChild(card);
    });

    atualizarContadores(tarefas);
}

// =============================
// AÇÕES DAS TAREFAS
function toggleTarefa(id) {
    tarefas = tarefas.map(t =>
        t.id === id ? { ...t, concluida: !t.concluida } : t
    );
    salvarNoStorage(tarefas);
    renderizar();
}

function deletarTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id);
    salvarNoStorage(tarefas);
    renderizar();
}

function editarTarefa(tarefa) {
    modoEdicao = true;
    tarefaEditandoId = tarefa.id;
    inputTitulo.value = tarefa.titulo;
    inputDescricao.value = tarefa.descricao;
    inputData.value = tarefa.data;
    inputHora.value = tarefa.hora || "";

    telaPrincipal.classList.add("oculto");
    telaFormulario.classList.remove("oculto");
}

// =============================
// UTIL
function limparFormulario() {
    inputTitulo.value = "";
    inputDescricao.value = "";
    inputData.value = "";
    inputHora.value = "";
}

// =============================
// INICIAR
renderizar();

// =============================
// TIME PICKER CUSTOM
const timePicker = document.getElementById("time-picker");
const tpHour = document.getElementById("tp-hour");
const tpMin = document.getElementById("tp-min");
const tpBtns = timePicker.querySelectorAll(".tp-btn");
const tpSet = document.getElementById("tp-set");

// Permitir digitar no picker
tpHour.removeAttribute("readonly");
tpMin.removeAttribute("readonly");

tpHour.addEventListener("input", () => {
    let val = parseInt(tpHour.value) || 0;
    if (val < 0) val = 0;
    if (val > 23) val = 23;
    tpHour.value = val.toString().padStart(2, "0");
});

tpMin.addEventListener("input", () => {
    let val = parseInt(tpMin.value) || 0;
    if (val < 0) val = 0;
    if (val > 59) val = 59;
    tpMin.value = val.toString().padStart(2, "0");
});

// Abrir time picker ao clicar no input
inputHora.addEventListener("click", () => {
    timePicker.classList.remove("oculto");
});

// Incremento/decremento com botões (menos sensível)
tpBtns.forEach(btn => {
    let interval;
    btn.addEventListener("mousedown", () => {
        const input = btn.parentElement.querySelector("input");
        const inc = parseInt(btn.dataset.inc);

        // Função de incremento
        const changeValue = () => {
            let val = parseInt(input.value) || 0;
            if (input.id === "tp-hour") {
                val = (val + inc + 24) % 24;
            } else {
                val = (val + inc + 60) % 60;
            }
            input.value = val.toString().padStart(2, "0");
        };

        changeValue();
        interval = setInterval(changeValue, 300); // mais lento
    });

    btn.addEventListener("mouseup", () => clearInterval(interval));
    btn.addEventListener("mouseleave", () => clearInterval(interval));
});

// Definir hora no input principal
tpSet.addEventListener("click", () => {
    inputHora.value = `${tpHour.value}:${tpMin.value}`;
    timePicker.classList.add("oculto");
});

// Fechar picker clicando fora
document.addEventListener("click", (e) => {
    if (!timePicker.contains(e.target) && e.target !== inputHora) {
        timePicker.classList.add("oculto");
    }
});

// =============================
// SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(() => console.log("Service Worker registrado"))
            .catch((error) => console.log("Erro ao registrar:", error));
    });
}

// =============================
// ATUALIZAÇÃO AUTOMÁTICA
setInterval(() => {
    if (secaoAtual === "atrasadas") {
        renderizar();
    } else {
        atualizarContadores(tarefas);
    }
}, 30_000);

window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.querySelector(".splash-screen");
        if (splash) {
            splash.classList.add("hide");
        }
    }, 900);
});

document.body.classList.add("loading");

window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.querySelector(".splash-screen");
        splash.classList.add("hide");
        document.body.classList.remove("loading");
    }, 1100);
});