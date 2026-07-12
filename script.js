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

// --- Navegação Mobile ---
function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

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
    } catch (err) { alert("Erro: " + err.message); loginBtn.innerText = "Entrar"; loginBtn.disabled = false; }
}
loginBtn.addEventListener('click', processarLogin);

// --- Gestão de Conteúdo (Renderização e Ordenação) ---
function renderizarPortal() {
    db.ref('conteudo').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // Render Cabeçalho
        const nav = document.getElementById('menu-items');
        const listMenu = document.getElementById('lista-menu-admin');
        nav.innerHTML = ''; listMenu.innerHTML = '';
        
        const menuArray = Object.entries(data.menu || {}).sort((a,b) => (a[1].ordem || 0) - (b[1].ordem || 0));
        menuArray.forEach(([id, item]) => {
            nav.innerHTML += `<li><a onclick="abrirMenu('${item.nome}', '${item.valor}', '${item.tipo}')">${item.nome}</a></li>`;
            listMenu.innerHTML += `<li>${item.nome} (${item.ordem}) <button onclick="editar('menu', '${id}')" class="btn-subtle">Edit</button> <button onclick="deletar('menu/${id}')" class="btn-subtle">X</button></li>`;
        });

        // Render Cards
        const grid = document.getElementById('servicos');
        const listCards = document.getElementById('lista-cards-admin');
        grid.innerHTML = ''; listCards.innerHTML = '';
        
        const cardsArray = Object.entries(data.cards || {}).sort((a,b) => (a[1].ordem || 0) - (b[1].ordem || 0));
        cardsArray.forEach(([id, c]) => {
            grid.innerHTML += `
                <div class="card" onclick="abrirModalServico('${c.titulo}', '${c.desc}', '${c.logo}', '${c.link}')">
                    <img src="${c.logo}" style="width:40px; margin-bottom:10px;">
                    <h3>${c.titulo}</h3>
                </div>`;
            listCards.innerHTML += `<li>${c.titulo} (${c.ordem}) <button onclick="editar('cards', '${id}')" class="btn-subtle">Edit</button> <button onclick="deletar('cards/${id}')" class="btn-subtle">X</button></li>`;
        });
    });
}

// --- Funções Administrativas ---
let editId = null;
function salvarMenu() {
    const data = { nome: document.getElementById('menu-nome').value, valor: document.getElementById('menu-valor').value, ordem: parseInt(document.getElementById('menu-ordem').value), tipo: document.querySelector('input[name="tipo"]:checked').value };
    if(editId) { db.ref('conteudo/menu/' + editId).set(data); editId = null; }
    else db.ref('conteudo/menu').push(data);
}

function salvarCard() {
    const data = { titulo: document.getElementById('card-titulo').value, logo: document.getElementById('card-logo').value, ordem: parseInt(document.getElementById('card-ordem').value), desc: document.getElementById('card-desc').value, link: document.getElementById('card-link').value };
    if(editId) { db.ref('conteudo/cards/' + editId).set(data); editId = null; }
    else db.ref('conteudo/cards').push(data);
}

function editar(tipo, id) {
    editId = id;
    db.ref('conteudo/' + tipo + '/' + id).once('value', snap => {
        const item = snap.val();
        if(tipo === 'menu') { document.getElementById('menu-nome').value = item.nome; document.getElementById('menu-valor').value = item.valor; document.getElementById('menu-ordem').value = item.ordem; }
        else { document.getElementById('card-titulo').value = item.titulo; document.getElementById('card-logo').value = item.logo; document.getElementById('card-ordem').value = item.ordem; document.getElementById('card-desc').value = item.desc; document.getElementById('card-link').value = item.link; }
    });
}

function deletar(path) { if(confirm("Confirmar exclusão?")) db.ref('conteudo/' + path).remove(); }

// --- Modais ---
function abrirMenu(nome, valor, tipo) {
    if (tipo === 'link') window.open(valor, '_blank');
    else { document.getElementById('modal-body').innerHTML = `<h2>${nome}</h2><p>${valor}</p>`; document.getElementById('modal-generic').style.display = 'flex'; }
}

function abrirModalServico(titulo, desc, logo, link) {
    document.getElementById('modal-body').innerHTML = `<img src="${logo}" style="width:60px;"><h2>${titulo}</h2><p>${desc}</p><button onclick="window.open('${link}', '_blank')" class="btn-neon">Acessar</button>`;
    document.getElementById('modal-generic').style.display = 'flex';
}

auth.onAuthStateChanged(user => {
    if (user) { document.getElementById('admin-panel').classList.remove('hidden'); document.getElementById('btn-admin').innerText = "Logout"; document.getElementById('btn-admin').onclick = () => auth.signOut().then(() => location.reload()); }
    else document.getElementById('btn-admin').onclick = () => loginModal.style.display = 'flex';
});

renderizarPortal();
