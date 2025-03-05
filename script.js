import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// ✅ Função para cadastrar um animal no Supabase
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.getElementById("nome").value.trim();
    let local = document.getElementById("local").value.trim();
    let contato = document.getElementById("contato").value.trim();
    let imagemInput = document.getElementById("imagem").files[0];

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
    } else {
        console.error("❌ Erro ao cadastrar no Supabase:", error);
        alert("Erro ao cadastrar.");
    }
}

// ✅ Função para fazer upload de imagem no Supabase
async function uploadImagem(file) {
    const fileName = `animais_perdidos/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('animais').upload(fileName, file);

    if (error) {
        console.error("❌ Erro ao fazer upload da imagem:", error);
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/animais/${fileName}`;
}

// ✅ Função de conexão inicial
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔍 DOM carregado, iniciando funções...");

    testarConexao(); // ✅ Agora a função está declarada antes de ser chamada
    
    // Selecionando os botões e formulários
    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");
    const botaoFecharCadastro = document.getElementById("btn-fechar");

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

    // Garantir que os eventos estão sendo registrados corretamente
    document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
});
