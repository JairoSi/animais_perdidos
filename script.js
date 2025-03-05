import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔗 Conectar ao Supabase
const SUPABASE_URL = 'https://itzfzcnpesebessjigkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZ6Y25wZXNlYmVzc2ppZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTk4MjQsImV4cCI6MjA1NjU5NTgyNH0.MO7A54uxXHKcwCvEmsunTofle7EHQ0Ln25vAH2i9vIc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Função para testar a conexão com o Supabase
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

// ✅ Função para fazer upload de imagem para o Supabase
async function uploadImagem(file) {
    const fileName = `animais/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('animais').upload(fileName, file);

    if (error) {
        console.error("❌ Erro ao fazer upload da imagem:", error);
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/animais/${fileName}`;
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

    let { error } = await supabase.from('animais_perdidos').insert([
        { nome, local, contato, imagem_url: imagemUrl, encontrado: false, exibir: true, status: 'pendente' }
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

// ✅ Função para carregar os animais com borda de cor dependendo do status
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

        // Definir a cor da borda dependendo do status
        let bordaCor = "";
        if (animal.status === "pendente") {
            bordaCor = "border: 5px solid orange;";
        } else if (animal.status === "aprovado") {
            bordaCor = "border: 5px solid green;";
        } else if (animal.status === "reprovado") {
            bordaCor = "border: 5px solid red;";
        }

        // Se o animal foi encontrado, move para a lista de "animais encontrados"
        if (animal.encontrado) {
            div.classList.add("encontrado");
            listaEncontrados.appendChild(div);
        } else {
            listaPerdidos.appendChild(div);
        }

        div.innerHTML = `
            <div class="animal-img" style="${bordaCor}">
                <img src="${animal.imagem_url || 'https://placehold.co/150'}" alt="${animal.nome}">
            </div>
            <h3>${animal.nome}</h3>
            <p><strong>Local:</strong> ${animal.local}</p>
            <p><strong>Contato:</strong> ${animal.contato}</p>
            <p><strong>Status:</strong> ${animal.status}</p>
            <button class="btn-encontrado" data-id="${animal.id}">✔ Marcar como Encontrado</button>
        `;

        div.querySelector(".btn-encontrado").addEventListener("click", function () {
            marcarEncontrado(this.dataset.id);
        });
    });
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
        fotoUrl = await uploadImagem(fotoInput);
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
        console.error("❌ Erro ao cadastrar no Supabase Auth:", error);
        alert("Erro ao cadastrar: " + error.message);
        return;
    }

    let { error: userError } = await supabase.from('usuarios').insert([
        { id: data.user.id, nome, email, foto_url: fotoUrl, role: "tutor", status: "pendente" }
    ]);

    if (userError) {
        console.error("❌ Erro ao salvar usuário na tabela `usuarios`:", userError);
        alert("Erro ao cadastrar. Entre em contato com o suporte.");
    } else {
        alert("✅ Cadastro realizado com sucesso! Aguarde a aprovação de um administrador.");
        document.getElementById("cadastroUsuarioForm").style.display = "none";
        document.querySelector("#formCadastro").reset();
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

// ✅ Expondo funções globalmente para evitar `ReferenceError`
window.enviarParaSupabase = enviarParaSupabase;
window.testarConexao = testarConexao;
window.cadastrarUsuario = cadastrarUsuario;
window.marcarEncontrado = marcarEncontrado;
