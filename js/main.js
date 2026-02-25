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
// BUSCA
// =============================
inputBusca?.addEventListener("input", e => {
    termoBusca = e.target.value.toLowerCase();
    renderizar();
});

// =============================
// ABAS
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
// FORM
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
        tarefas.push({
            id: Date.now(),
            titulo: inputTitulo.value,
            descricao: inputDescricao.value,
            data: inputData.value,
            hora: inputHora.value,
            concluida: false
        });
    }

    salvarNoStorage(tarefas);
    renderizar();
    limparFormulario();
    telaFormulario.classList.add("oculto");
    telaPrincipal.classList.remove("oculto");
});

// =============================
function renderizar() {
    const lista = document.getElementById("lista-tarefas");
    lista.innerHTML = "";

    let tarefasFiltradas = filtrarTarefas(tarefas, secaoAtual);

    if (termoBusca) {
        tarefasFiltradas = tarefasFiltradas.filter(t =>
            t.titulo.toLowerCase().includes(termoBusca)
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

function limparFormulario() {
    inputTitulo.value = "";
    inputDescricao.value = "";
    inputData.value = "";
    inputHora.value = "";
}

// =============================
// SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}

// =============================
// SPLASH (CORRIGIDA)
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const splash = document.querySelector(".splash-screen");
        if (splash) {
            splash.classList.add("hide");
            setTimeout(() => splash.style.display = "none", 600);
        }
    }, 1000);
});

// =============================
renderizar();