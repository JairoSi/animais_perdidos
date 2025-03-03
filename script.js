import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Conectando ao Supabase
const SUPABASE_URL = 'https://ckiqaoymvxdulduuqubn.supabase.co';  
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraXFhb3ltdnhkdWxkdXVxdWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzAwNjMsImV4cCI6MjA1NjU0NjA2M30.O7XoRVuZJLvzTtzzjANHQLzlDFSpobCSEvRMwRsjN0M';  

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para carregar os animais cadastrados
async function carregarAnimais() {
    let { data: animais, error } = await supabase.from('animais_perdidos').select('*');

    if (error) {
        console.error("Erro ao buscar animais:", error);
        return;
    }

    let listaAnimais = document.querySelector("#listaAnimais");
    listaAnimais.innerHTML = ""; // Limpa a lista antes de atualizar

    animais.forEach(animal => {
        let div = document.createElement("div");
        div.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px; display: inline-block; width: 250px;">
                <img src="${animal.imagem_url}" alt="${animal.nome}" style="width: 100%; border-radius: 5px;">
                <h3>${animal.nome}</h3>
                <p><strong>Local:</strong> ${animal.local}</p>
                <p><strong>Contato:</strong> ${animal.contato}</p>
                <button onclick="marcarEncontrado(${animal.id})">✔ Encontrado</button>
                <button onclick="removerAnimal(${animal.id})">❌ Remover</button>
            </div>
        `;
        listaAnimais.appendChild(div);
    });
}

// Função para remover um animal do banco de dados
async function removerAnimal(id) {
    let { error } = await supabase.from('animais_perdidos').delete().match({ id: id });

    if (error) {
        alert("Erro ao remover o animal.");
    } else {
        alert("Animal removido com sucesso!");
        carregarAnimais(); // Atualiza a lista automaticamente
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

// Função para cadastrar um animal no banco de dados
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
    ]);

    if (error) {
        alert("Erro ao cadastrar.");
    } else {
        alert("Animal cadastrado com sucesso!");
        document.querySelector("#formAnimal").reset();
        carregarAnimais();
    }
}

// Adiciona eventos ao carregar a página
document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
document.addEventListener("DOMContentLoaded", carregarAnimais);
