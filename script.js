import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Conectar ao Supabase
const SUPABASE_URL = 'https://SEU_PROJECT_URL.supabase.co';  
const SUPABASE_KEY = 'SEU_ANON_PUBLIC_KEY';  

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para carregar os animais cadastrados e exibir no site
async function carregarAnimais() {
    let { data: animais, error } = await supabase.from('animais_perdidos').select('*');

    if (error) {
        console.error("Erro ao buscar animais:", error);
        return;
    }

    let listaAnimais = document.querySelector("#listaAnimais");
    listaAnimais.innerHTML = ""; // Limpa a lista antes de atualizar

    if (animais.length === 0) {
        listaAnimais.innerHTML = "<p>Nenhum animal perdido cadastrado ainda.</p>";
        return;
    }

    animais.forEach(animal => exibirAnimalNaPagina(animal));
}

// Função para exibir um animal na página após cadastro ou carregamento
function exibirAnimalNaPagina(animal) {
    let listaAnimais = document.querySelector("#listaAnimais");

    let div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
        <img src="${animal.imagem_url || 'https://via.placeholder.com/150'}" alt="${animal.nome}">
        <div class="card-content">
            <h3>${animal.nome}</h3>
            <p><strong>Local:</strong> ${animal.local}</p>
            <p><strong>Contato:</strong> ${animal.contato}</p>
            <button class="encontrado" onclick="marcarEncontrado(${animal.id})">✔ Encontrado</button>
            <button class="remover" onclick="removerAnimal(${animal.id}, this)">❌ Remover</button>
        </div>
    `;
    listaAnimais.appendChild(div);
}

// Função para remover um animal do banco de dados e da página
async function removerAnimal(id, elemento) {
    let { error } = await supabase.from('animais_perdidos').delete().match({ id: id });

    if (error) {
        alert("Erro ao remover o animal.");
    } else {
        alert("Animal removido com sucesso!");
        elemento.parentElement.parentElement.remove(); // Remove o card do animal da página
    }
}

// Função para marcar um animal como encontrado
async function marcarEncontrado(id) {
    let { error } = await supabase.from('animais_perdidos').update({ local: "🐾 ENCONTRADO!" }).match({ id: id });

    if (error) {
        alert("Erro ao marcar como encontrado.");
    } else {
        alert("Animal marcado como encontrado!");
        carregarAnimais(); // Atualiza a lista automaticamente
    }
}

// Função para fazer upload de imagem para o Supabase Storage
async function uploadImagem(file) {
    const fileName = `${Date.now()}_${file.name}`; // Nome único para evitar sobrescritas
    const { data, error } = await supabase.storage.from('animais_perdidos').upload(`public/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
    });

    if (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        alert("Erro ao enviar a imagem.");
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/animais_perdidos/public/${fileName}`;
}

// Função para cadastrar um animal no banco de dados e exibi-lo na página
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.querySelector("#nome").value.trim();
    let local = document.querySelector("#local").value.trim();
    let contato = document.querySelector("#contato").value.trim();
    let imagemInput = document.querySelector("#imagem").files[0];

    // Verificar se os campos estão preenchidos corretamente
    if (!nome || !local || !contato) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    let imagem = "https://via.placeholder.com/200"; // Imagem padrão caso não seja enviada

    if (imagemInput) {
        imagem = await uploadImagem(imagemInput);
        if (!imagem) {
            alert("Erro ao enviar a imagem. Tente novamente.");
            return;
        }
    }

    let { data, error } = await supabase.from('animais_perdidos').insert([
        { nome: nome, local: local, contato: contato, imagem_url: imagem }
    ]).select('*');

    if (error) {
        alert("Erro ao cadastrar.");
    } else {
        alert("Animal cadastrado com sucesso!");
        document.querySelector("#formAnimal").reset();
        exibirAnimalNaPagina(data[0]); // Exibe o animal na página imediatamente
    }
}

// Adiciona eventos ao carregar a página
document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
document.addEventListener("DOMContentLoaded", carregarAnimais);
