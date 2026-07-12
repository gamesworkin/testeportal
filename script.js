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

// --- Carregamento e Renderização ---
function renderizarPortal() {
    db.ref('conteudo').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // Render Cabeçalho
        const nav = document.getElementById('menu-items');
        nav.innerHTML = '';
        Object.values(data.menu || {}).forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerText = item.nome;
            a.onclick = () => {
                if (item.tipo === 'link') window.open(item.valor, '_blank');
                else abrirModalGenerico(item.nome, item.valor);
            };
            li.appendChild(a);
            nav.appendChild(li);
        });

        // Render Cards
        const grid = document.getElementById('servicos');
        grid.innerHTML = '';
        Object.values(data.cards || {}).forEach(c => {
            grid.innerHTML += `
                <div class="card" onclick="abrirModalServico('${c.titulo}', '${c.desc}', '${c.logo}', '${c.link}')">
                    <img src="${c.logo}" alt="logo">
                    <h3>${c.titulo}</h3>
                </div>`;
        });
    });
}

// --- Funções Administrativas ---
function salvarMenu() {
    const nome = document.getElementById('menu-nome').value;
    const valor = document.getElementById('menu-valor').value;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    db.ref('conteudo/menu').push({ nome, valor, tipo }).then(() => alert("Menu salvo!"));
}

function salvarCard() {
    const titulo = document.getElementById('card-titulo').value;
    const logo = document.getElementById('card-logo').value;
    const desc = document.getElementById('card-desc').value;
    const link = document.getElementById('card-link').value;
    db.ref('conteudo/cards').push({ titulo, logo, desc, link }).then(() => alert("Card salvo!"));
}

// --- Modais ---
function abrirModalGenerico(titulo, texto) {
    document.getElementById('modal-body').innerHTML = `<h2>${titulo}</h2><p>${texto}</p>`;
    document.getElementById('modal-generic').style.display = 'flex';
}

function abrirModalServico(titulo, desc, logo, link) {
    document.getElementById('modal-body').innerHTML = `
        <img src="${logo}" style="width:50px">
        <h2>${titulo}</h2>
        <p>${desc}</p>
        <button class="btn-neon" onclick="window.open('${link}', '_blank')">Acessar</button>
    `;
    document.getElementById('modal-generic').style.display = 'flex';
}

// --- Autenticação ---
auth.onAuthStateChanged(user => {
    const panel = document.getElementById('admin-panel');
    const btn = document.getElementById('btn-admin');
    if (user && user.email === "admin@admin.com") {
        panel.classList.remove('hidden');
        btn.innerText = "Logout";
        btn.onclick = () => auth.signOut().then(() => location.reload());
    } else {
        btn.innerText = "Acesso Restrito";
        btn.onclick = () => document.getElementById('modal-admin').style.display = 'flex';
    }
});

document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('email-admin').value;
    const pass = document.getElementById('password-admin').value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        location.reload();
    } catch (e) { alert(e.message); }
};

// Import/Export
function exportarDados() {
    db.ref('conteudo').once('value').then(snap => {
        const blob = new Blob([JSON.stringify(snap.val())], {type: "application/json"});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "backup.json"; a.click();
    });
}

function importarDados() {
    const input = prompt("Cole o JSON:");
    if(input) db.ref('conteudo').set(JSON.parse(input)).then(() => alert("Atualizado!"));
}

renderizarPortal();

