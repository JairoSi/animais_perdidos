import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Conectar ao Supabase
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
    listaAnimais.innerHTML = "";

    animais.forEach(animal => exibirAnimalNaPagina(animal));
}

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
        </div>
    `;
    listaAnimais.appendChild(div);
}

document.addEventListener("DOMContentLoaded", carregarAnimais);
