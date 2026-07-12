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

// --- Lógica de Login e Estado Admin ---
const loginBtn = document.getElementById('login-btn');
const btnAdmin = document.getElementById('btn-admin');

// Botão de Login (com evento de enter)
const loginModal = document.getElementById('modal-admin');
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && loginModal.style.display === 'flex') {
        processarLogin();
    }
});

loginBtn.addEventListener('click', processarLogin);

async function processarLogin() {
    const email = document.getElementById('email-admin').value;
    const pass = document.getElementById('password-admin').value;
    
    loginBtn.innerText = "Logando...";
    loginBtn.disabled = true;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        alert("Bem-vindo, Administrador!");
        location.reload();
    } catch (err) {
        alert("Erro: " + err.message);
        loginBtn.innerText = "Entrar";
        loginBtn.disabled = false;
    }
}

// Controle do Botão (Acesso Restrito / Logout)
auth.onAuthStateChanged(user => {
    if (user && user.email === "admin@admin.com") {
        document.getElementById('admin-panel').classList.remove('hidden');
        btnAdmin.innerText = "Logout";
        btnAdmin.onclick = () => auth.signOut().then(() => location.reload());
    } else {
        btnAdmin.innerText = "Acesso Restrito";
        btnAdmin.onclick = () => loginModal.style.display = 'flex';
    }
});

// --- Gestão de Dados (CRUD) ---
function carregarConteudo() {
    db.ref('conteudo/servicos').on('value', (snapshot) => {
        const data = snapshot.val();
        const grid = document.getElementById('servicos');
        grid.innerHTML = '';
        if (data) {
            Object.entries(data).forEach(([id, s]) => {
                grid.innerHTML += `
                    <div class="card" onclick="abrirModalServico('${s.titulo}', '${s.desc}')">
                        <h3>${s.titulo}</h3>
                    </div>`;
            });
        }
    });
}

function adicionarCard() {
    const titulo = document.getElementById('add-titulo').value;
    const desc = document.getElementById('add-desc').value;
    
    if(titulo && desc) {
        db.ref('conteudo/servicos').push({ titulo, desc })
            .then(() => {
                alert("Card adicionado com sucesso!");
                document.getElementById('add-titulo').value = '';
                document.getElementById('add-desc').value = '';
            });
    } else {
        alert("Preencha todos os campos!");
    }
}

// Funções de Importação/Exportação JSON
function exportarDados() {
    db.ref('conteudo').once('value').then(snap => {
        const data = JSON.stringify(snap.val(), null, 2);
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = "backup_portal.json"; a.click();
    });
}

function importarDados() {
    const input = prompt("Cole o JSON da estrutura:");
    if (input) {
        try {
            db.ref('conteudo').set(JSON.parse(input))
                .then(() => alert("Dados atualizados com sucesso!"));
        } catch (e) { alert("JSON inválido!"); }
    }
}

// --- Modais ---
function abrirModalServico(titulo, desc) {
    const modal = document.getElementById('modal-generic');
    document.getElementById('modal-body').innerHTML = `
        <h2>${titulo}</h2>
        <p style="margin: 20px 0;">${desc}</p>
        <button class="btn-neon" onclick="alert('Redirecionando...')">Acessar</button>
    `;
    modal.style.display = 'flex';
}

window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};

// Inicialização
carregarConteudo();
