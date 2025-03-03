import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL = 'https://ckiqaoymvxdulduuqubn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraXFhb3ltdnhkdWxkdXVxdWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzAwNjMsImV4cCI6MjA1NjU0NjA2M30.O7XoRVuZJLvzTtzzjANHQLzlDFSpobCSEvRMwRsjN0M';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para cadastrar um animal
async function enviarParaSupabase(event) {
    event.preventDefault();

    let nome = document.querySelector("#nome").value;
    let local = document.querySelector("#local").value;
    let contato = document.querySelector("#contato").value;
    let imagem = document.querySelector("#imagem").value || "https://via.placeholder.com/200"; // Imagem padrão

    let { data, error } = await supabase.from('animais_perdidos').insert([
        { nome: nome, local: local, contato: contato, imagem_url: imagem }
    ]);

    if (error) {
        alert("Erro ao cadastrar.");
    } else {
        alert("Animal cadastrado com sucesso!");
        document.querySelector("#formAnimal").reset();
        carregarAnimais(); // Atualizar a lista automaticamente
    }
}

// Função para carregar animais do banco de dados
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
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px; display: inline-block; width: 200px;">
                <img src="${animal.imagem_url}" alt="${animal.nome}" style="width: 100%; border-radius: 5px;">
                <h3>${animal.nome}</h3>
                <p><strong>Local:</strong> ${animal.local}</p>
                <p><strong>Contato:</strong> ${animal.contato}</p>
            </div>
        `;
        listaAnimais.appendChild(div);
    });
}

// Adiciona eventos
document.querySelector("#formAnimal").addEventListener("submit", enviarParaSupabase);
document.addEventListener("DOMContentLoaded", carregarAnimais);
