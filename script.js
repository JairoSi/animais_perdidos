import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Testar Conexão com o Supabase
async function testarConexao() {
    try {
        const { data, error } = await supabase.from('usuarios').select('*');
        if (error) {
            console.error("❌ Erro ao conectar ao Supabase:", error);
        } else {
            console.log("✅ Conexão bem-sucedida! Dados obtidos:", data);
        }
    } catch (err) {
        console.error("⚠️ Erro inesperado ao conectar ao Supabase:", err);
    }
}

// ✅ Função de conexão inicial
document.addEventListener("DOMContentLoaded", () => {
    console.log("🔍 DOM carregado, iniciando funções...");

    testarConexao();
    
    // Selecionando os botões e formulários
    const botaoCadastrar = document.getElementById("btn-cadastrar");
    const formularioCadastro = document.getElementById("cadastroForm");
    const botaoFecharCadastro = document.getElementById("btn-fechar");

    const botaoLogin = document.getElementById("btn-login");
    const formularioLogin = document.getElementById("loginForm");
    const botaoFecharLogin = document.getElementById("btn-fechar-login");

    const botaoAbrirCadastro = document.getElementById("btn-abrir-cadastro");
    const formularioCadastroUsuario = document.getElementById("cadastroUsuarioForm");
    const botaoFecharCadastroUsuario = document.getElementById("btn-fechar-cadastro");

    if (botaoAbrirCadastro && formularioCadastroUsuario) {
        botaoAbrirCadastro.addEventListener("click", () => {
            formularioCadastroUsuario.style.display = "block";
        });

        botaoFecharCadastroUsuario.addEventListener("click", () => {
            formularioCadastroUsuario.style.display = "none";
        });
    }

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
    document.querySelector("#formCadastro").addEventListener("submit", cadastrarUsuario);
    document.querySelector("#formLogin").addEventListener("submit", loginUsuario);
    document.querySelector("#esqueci-senha").addEventListener("click", recuperarSenha);
});

// ✅ Função para fazer upload da foto de perfil no Supabase Storage
async function uploadFoto(file) {
    if (!file) return null;

    const fileName = `usuarios/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('usuarios').upload(fileName, file);

    if (error) {
        console.error("❌ Erro ao fazer upload da foto:", error);
        alert("Erro ao enviar a foto.");
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/usuarios/${fileName}`;
}

// ✅ Função para cadastrar um usuário no Supabase
async function cadastrarUsuario(event) {
    event.preventDefault();

    let nome = document.getElementById("cadastro-nome").value.trim();
    let email = document.getElementById("cadastro-email").value.trim();
    let senha = document.getElementById("cadastro-senha").value.trim();
    let fotoInput = document.getElementById("cadastro-foto").files[0];

    if (!nome || !email || !senha) {
        alert("⚠️ Preencha todos os campos obrigatórios.");
        return;
    }

    let fotoUrl = "https://placehold.co/150"; // Imagem padrão caso o usuário não envie uma foto

    if (fotoInput) {
        fotoUrl = await uploadFoto(fotoInput);
        if (!fotoUrl) {
            alert("Erro ao enviar a foto. Tente novamente.");
            return;
        }
    }

    let { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha
    });

    if (error) {
        alert("❌ Erro ao cadastrar: " + error.message);
        return;
    }

    // Após o cadastro bem-sucedido, salvar o usuário na tabela personalizada
    let { data: userData, error: userError } = await supabase.from('usuarios').insert([
        { id: data.user.id, nome, email, foto_url: fotoUrl, role: "tutor", status: "pendente" }
    ]);

    if (!userError) {
        alert("✅ Cadastro realizado com sucesso! Aguarde a aprovação de um administrador.");
        document.getElementById("cadastroUsuarioForm").style.display = "none";
        document.querySelector("#formCadastro").reset();
    } else {
        console.error("❌ Erro ao cadastrar no Supabase:", userError);
        alert("Erro ao cadastrar.");
    }
}

// ✅ Função para autenticar usuário
async function loginUsuario(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let senha = document.getElementById("senha").value.trim();

    console.log(`📩 Tentando login com e-mail: ${email}`);

    let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

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
