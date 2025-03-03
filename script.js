import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Testar Conexão com o Supabase
async function testarConexao() {
    const { data, error } = await supabase.from('animais_perdidos').select('*');
    if (error) {
        console.error("❌ Erro ao conectar ao Supabase:", error);
    } else {
        console.log("✅ Conexão bem-sucedida! Dados obtidos:", data);
    }
}

// ✅ Garantir que o botão do doguinho funcione corretamente
document.addEventListener("DOMContentLoaded", () => {
    testarConexao();
    carregarAnimais();

    // 🔹 Seletor do botão e do formulário
    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");

    if (botaoCadastrar && formularioCadastro) {
        botaoCadastrar.addEventListener("click", () => {
            console.log("🐶 Botão do doguinho clicado!");
            formularioCadastro.style.display = (formularioCadastro.style.display === "none") ? "block" : "none";
        });
    } else {
        console.error("❌ Erro: Elementos do formulário não encontrados.");
    }

    // ✅ Evento para cadastrar animal
    document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
});

// ✅ Função para carregar animais na página
async function carregarAnimais() {
    let { data: animais, error } = await supabase.from('animais_perdidos').select('*');

    if (error) {
        console.error("❌ Erro ao buscar animais:", error);
        return;
    }

    let listaAnimais = document.querySelector("#listaAnimais");
    listaAnimais.innerHTML = "";

    animais.forEach(animal => {
        let div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <img src="${animal.imagem_url || 'https://via.placeholder.com/150'}" alt="${animal.nome}">
            <h3>${animal.nome}</h3>
            <p><strong>Local:</strong> ${animal.local}</p>
            <p><strong>Contato:</strong> ${animal.contato}</p>
        `;
        listaAnimais.appendChild(div);
    });
}

// ✅ Função para cadastrar um novo animal no Supabase
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.querySelector("#nome").value.trim();
    let local = document.querySelector("#local").value.trim();
    let contato = document.querySelector("#contato").value.trim();

    if (!nome || !local || !contato) {
        alert("⚠️ Preencha todos os campos obrigatórios.");
        return;
    }

    console.log("📡 Enviando para o Supabase:", { nome, local, contato });

    let { data, error } = await supabase.from('animais_perdidos').insert([
        { nome, local, contato }
    ]);

    if (error) {
        console.error("❌ Erro ao cadastrar no Supabase:", error);
        alert("Erro ao cadastrar. Verifique o Console.");
    } else {
        console.log("✅ Cadastro realizado com sucesso!", data);
        alert("Animal cadastrado com sucesso!");
        document.querySelector("#formAnimal").reset();
        carregarAnimais(); // Atualizar a lista automaticamente
    }
}
