// CONFIGURAÇÃO FIREBASE - PREENCHA COM SEUS DADOS
const firebaseConfig = {
  apiKey: "AIzaSyDiAP2IvsfPac29qzFA71sbLYuizVxZ9HQ",
  authDomain: "portal-workin-store.firebaseapp.com",
  databaseURL: "https://portal-workin-store-default-rtdb.firebaseio.com",
  projectId: "portal-workin-store",
  storageBucket: "portal-workin-store.firebasestorage.app",
  messagingSenderId: "803334158041",
  appId: "1:803334158041:web:5ef4069e7ec3a5973970c8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- Lógica de Login ---
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('modal-admin');

async function processarLogin() {
    const email = document.getElementById('email-admin').value;
    const pass = document.getElementById('password-admin').value;
    
    loginBtn.innerText = "Logando...";
    loginBtn.disabled = true;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        location.reload();
    } catch (err) {
        alert("Erro: " + err.message);
        loginBtn.innerText = "Entrar";
        loginBtn.disabled = false;
    }
}

loginBtn.addEventListener('click', processarLogin);
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && loginModal.style.display === 'flex') processarLogin();
});

// --- Gestão de Conteúdo ---
function renderizarPortal() {
    db.ref('conteudo').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // Render Cabeçalho
        const nav = document.getElementById('menu-items');
        const listMenu = document.getElementById('lista-menu-admin');
        nav.innerHTML = ''; listMenu.innerHTML = '';
        
        Object.entries(data.menu || {}).forEach(([id, item]) => {
            nav.innerHTML += `<li><a onclick="abrirMenu('${item.nome}', '${item.valor}', '${item.tipo}')">${item.nome}</a></li>`;
            listMenu.innerHTML += `<li>${item.nome} <button onclick="deletar('menu/${id}')" class="btn-subtle" style="padding: 2px 5px;">X</button></li>`;
        });

        // Render Cards
        const grid = document.getElementById('servicos');
        const listCards = document.getElementById('lista-cards-admin');
        grid.innerHTML = ''; listCards.innerHTML = '';
        
        Object.entries(data.cards || {}).forEach(([id, c]) => {
            grid.innerHTML += `
                <div class="card" onclick="abrirModalServico('${c.titulo}', '${c.desc}', '${c.logo}', '${c.link}')">
                    <img src="${c.logo}" style="width:40px; margin-bottom:10px;">
                    <h3>${c.titulo}</h3>
                </div>`;
            listCards.innerHTML += `<li>${c.titulo} <button onclick="deletar('cards/${id}')" class="btn-subtle" style="padding: 2px 5px;">X</button></li>`;
        });
    });
}

// --- Funções Administrativas ---
function salvarMenu() {
    const nome = document.getElementById('menu-nome').value;
    const valor = document.getElementById('menu-valor').value;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    if(nome && valor) db.ref('conteudo/menu').push({ nome, valor, tipo }).then(() => alert("Link salvo!"));
}

function salvarCard() {
    const titulo = document.getElementById('card-titulo').value;
    const logo = document.getElementById('card-logo').value;
    const desc = document.getElementById('card-desc').value;
    const link = document.getElementById('card-link').value;
    if(titulo) db.ref('conteudo/cards').push({ titulo, logo, desc, link }).then(() => alert("Card salvo!"));
}

function deletar(path) {
    if(confirm("Confirmar exclusão deste item?")) db.ref('conteudo/' + path).remove();
}

// --- Modais ---
function abrirMenu(nome, valor, tipo) {
    if (tipo === 'link') window.open(valor, '_blank');
    else {
        document.getElementById('modal-body').innerHTML = `<h2>${nome}</h2><p style="margin-top:20px;">${valor}</p>`;
        document.getElementById('modal-generic').style.display = 'flex';
    }
}

function abrirModalServico(titulo, desc, logo, link) {
    document.getElementById('modal-body').innerHTML = `
        <img src="${logo}" style="width:60px; margin-bottom:15px;">
        <h2>${titulo}</h2>
        <p style="margin: 20px 0; word-wrap: break-word;">${desc}</p>
        <button class="btn-neon" onclick="window.open('${link}', '_blank')">Acessar</button>
    `;
    document.getElementById('modal-generic').style.display = 'flex';
}

// --- Autenticação e Sistema ---
auth.onAuthStateChanged(user => {
    const panel = document.getElementById('admin-panel');
    const btn = document.getElementById('btn-admin');
    if (user && user.email === "admin@admin.com") {
        panel.classList.remove('hidden');
        btn.innerText = "Logout";
        btn.onclick = () => auth.signOut().then(() => location.reload());
    } else {
        btn.innerText = "Acesso Restrito";
        btn.onclick = () => loginModal.style.display = 'flex';
    }
});

function exportarDados() {
    db.ref('conteudo').once('value').then(snap => {
        const blob = new Blob([JSON.stringify(snap.val())], {type: "application/json"});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "backup.json"; a.click();
    });
}

function importarDados() {
    const input = prompt("Cole o JSON da estrutura:");
    if(input) db.ref('conteudo').set(JSON.parse(input)).then(() => alert("Dados importados!"));
}

renderizarPortal();
