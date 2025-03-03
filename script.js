import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Teste inicial para ver se a conexão funciona
async function testarConexao() {
    const { data, error } = await supabase.from('animais_perdidos').select('*');
    if (error) {
        console.error("❌ Erro ao conectar ao Supabase:", error);
    } else {
        console.log("✅ Conexão bem-sucedida! Dados obtidos:", data);
    }
}

document.addEventListener("DOMContentLoaded", testarConexao);


// Mostrar/Esconder Formulário
document.addEventListener("DOMContentLoaded", () => {
    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");

    if (botaoCadastrar && formularioCadastro) {
        botaoCadastrar.addEventListener("click", () => {
            formularioCadastro.classList.toggle("oculto"); // Alterna entre mostrar/ocultar
        });
    } else {
        console.error("❌ Erro: Elementos do formulário não encontrados.");
    }
});

// Carregar Animais
async function carregarAnimais() {
    let { data: animais, error } = await supabase.from('animais_perdidos').select('*');

    if (error) {
        console.error("Erro ao buscar animais:", error);
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

// Cadastrar Animal
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.querySelector("#nome").value.trim();
    let local = document.querySelector("#local").value.trim();
    let contato = document.querySelector("#contato").value.trim();

    let { data, error } = await supabase.from('animais_perdidos').insert([
        { nome, local, contato }
    ]);

    if (!error) {
        alert("Animal cadastrado com sucesso!");
        document.querySelector("#formAnimal").reset();
        carregarAnimais();
    }
}

document.addEventListener("DOMContentLoaded", carregarAnimais);
document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
