import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Função de conexão inicial
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔍 DOM carregado, iniciando funções...");

    testarConexao();
    carregarAnimais();

    // Selecionando os botões e formulários
    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");
    const botaoFecharCadastro = document.getElementById("btn-fechar");

    const botaoLogin = document.getElementById("btn-login");
    const formularioLogin = document.getElementById("loginForm");
    const botaoFecharLogin = document.getElementById("btn-fechar-login");

    console.log("🔍 Botão de login encontrado:", botaoLogin);
    console.log("🔍 Formulário de login encontrado:", formularioLogin);

    if (botaoCadastrar && formularioCadastro) {
        botaoCadastrar.addEventListener("click", () => {
            console.log("🐶 Botão de cadastro clicado!");
            formularioCadastro.style.display = "block";
        });

        botaoFecharCadastro.addEventListener("click", () => {
            console.log("❌ Fechando formulário de cadastro.");
            formularioCadastro.style.display = "none";
        });
    }

    if (botaoLogin && formularioLogin) {
        botaoLogin.addEventListener("click", () => {
            console.log("🔑 Botão de login clicado!");
            formularioLogin.style.display = "block";
        });

        botaoFecharLogin.addEventListener("click", () => {
            console.log("❌ Fechando formulário de login.");
            formularioLogin.style.display = "none";
        });
    }

    // Garantir que os eventos estão sendo registrados corretamente
    document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
    document.querySelector("#formLogin").addEventListener("submit", loginUsuario);
    document.querySelector("#esqueci-senha").addEventListener("click", recuperarSenha);
});

// ✅ Testar Conexão com o Supabase
async function testarConexao() {
    try {
        const { data, error } = await supabase.from('animais_perdidos').select('*');
        if (error) {
            console.error("❌ Erro ao conectar ao Supabase:", error);
        } else {
            console.log("✅ Conexão bem-sucedida! Dados obtidos:", data);
        }
    } catch (err) {
        console.error("⚠️ Erro inesperado ao conectar ao Supabase:", err);
    }
}

// ✅ Função para carregar animais
async function carregarAnimais() {
    let { data: animais, error } = await supabase.from('animais_perdidos').select('*').eq('exibir', true);

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

// ✅ Função para cadastrar um animal no Supabase
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

// ✅ Função para autenticar usuário
async function loginUsuario(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let senha = document.getElementById("senha").value.trim();

    console.log(`📩 Tentando login com e-mail: ${email}`);

    let { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
        console.error("❌ Erro no login:", error);
        alert(`❌ Erro no login: ${error.message}`);
    } else {
        console.log("✅ Login realizado com sucesso!", data);
        alert("✅ Login realizado com sucesso!");
        document.getElementById("loginForm").style.display = "none";
    }
}

// ✅ Função para redefinir a senha
async function recuperarSenha() {
    let email = prompt("Digite seu e-mail para redefinir a senha:");

    if (email) {
        let { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            alert("❌ Erro ao solicitar redefinição de senha.");
            console.error(error);
        } else {
            alert("📩 E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        }
    }
}
