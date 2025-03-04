import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Garantir que os botões funcionam corretamente
document.addEventListener("DOMContentLoaded", () => {
    testarConexao();
    carregarAnimais();

    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");
    const botaoFechar = document.getElementById("btn-fechar"); // Novo botão de fechar

    if (botaoCadastrar && formularioCadastro) {
        botaoCadastrar.addEventListener("click", () => {
            console.log("🐶 Botão do doguinho clicado!");
            formularioCadastro.style.display = "block";
        });

        botaoFechar.addEventListener("click", () => {
            console.log("❌ Fechando formulário.");
            formularioCadastro.style.display = "none";
        });
    } else {
        console.error("❌ Erro: Elementos do formulário não encontrados.");
    }

    document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
});

// ✅ Testar Conexão com o Supabase
async function testarConexao() {
    const { data, error } = await supabase.from('animais_perdidos').select('*');
    if (error) {
        console.error("❌ Erro ao conectar ao Supabase:", error);
    } else {
        console.log("✅ Conexão bem-sucedida! Dados obtidos:", data);
    }
}

// ✅ Função para carregar apenas os animais com `exibir = true`
async function carregarAnimais() {
    let { data: animais, error } = await supabase
        .from('animais_perdidos')
        .select('*')
        .eq('exibir', true); // Exibe apenas registros com exibir = true

    if (error) {
        console.error("❌ Erro ao buscar animais:", error);
        return;
    }

    let listaPerdidos = document.querySelector("#listaPerdidos");
    let listaEncontrados = document.querySelector("#listaEncontrados");

    listaPerdidos.innerHTML = "";
    listaEncontrados.innerHTML = "";

    animais.forEach(animal => {
        let div = document.createElement("div");
        div.classList.add("card");

        if (animal.encontrado) {
            div.classList.add("encontrado");
            listaEncontrados.appendChild(div);
        } else {
            listaPerdidos.appendChild(div);
        }

        div.innerHTML = `
            <img src="${animal.imagem_url || 'https://placehold.co/150'}" alt="${animal.nome}">
            <h3>${animal.nome}</h3>
            <p><strong>Local:</strong> ${animal.local}</p>
            <p><strong>Contato:</strong> ${animal.contato}</p>
            <button class="btn-encontrado" data-id="${animal.id}">✔ Marcar como Encontrado</button>
        `;

        div.querySelector(".btn-encontrado").addEventListener("click", function () {
            marcarEncontrado(this.dataset.id);
        });
    });
}

// ✅ Função para fazer upload da imagem no Supabase
async function uploadImagem(file) {
    const fileName = `animais_perdidos/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('animais').upload(fileName, file);

    if (error) {
        console.error("❌ Erro ao fazer upload da imagem:", error);
        alert("Erro ao enviar a imagem.");
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/animais/${fileName}`;
}

// ✅ Função para cadastrar um novo animal no Supabase
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.querySelector("#nome").value.trim();
    let local = document.querySelector("#local").value.trim();
    let contato = document.querySelector("#contato").value.trim();
    let imagemInput = document.querySelector("#imagem").files[0];

    if (!nome || !local || !contato) {
        alert("⚠️ Preencha todos os campos obrigatórios.");
        return;
    }

    let imagemUrl = "https://placehold.co/150"; // Imagem padrão caso não seja enviada

    if (imagemInput) {
        imagemUrl = await uploadImagem(imagemInput);
        if (!imagemUrl) {
            alert("Erro ao enviar a imagem. Tente novamente.");
            return;
        }
    }

    let { data, error } = await supabase.from('animais_perdidos').insert([
        { nome, local, contato, imagem_url: imagemUrl, encontrado: false, exibir: true }
    ]);

    if (!error) {
        alert("✅ Animal cadastrado com sucesso!");
        document.getElementById("cadastroForm").style.display = "none";
        document.querySelector("#formAnimal").reset();
        carregarAnimais();
    } else {
        console.error("❌ Erro ao cadastrar no Supabase:", error);
        alert("Erro ao cadastrar.");
    }
}

// ✅ Função para marcar animal como encontrado
async function marcarEncontrado(id) {
    let { error } = await supabase.from('animais_perdidos').update({ encontrado: true }).match({ id });

    if (error) {
        console.error("❌ Erro ao marcar como encontrado:", error);
        alert("Erro ao marcar como encontrado.");
    } else {
        console.log(`✅ Animal com ID ${id} foi marcado como encontrado!`);
        alert("Animal marcado como encontrado!");
        carregarAnimais();
    }
}

// ✅ Tornar a função marcarEncontrado acessível globalmente
window.marcarEncontrado = marcarEncontrado;
