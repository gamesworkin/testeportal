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

// --- Lógica de Login e Admin ---
const loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email-admin').value;
    const pass = document.getElementById('password-admin').value;
    
    loginBtn.innerText = "Logando...";
    loginBtn.disabled = true;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        alert("Login efetuado com sucesso!");
        document.getElementById('modal-admin').style.display = 'none';
        location.reload(); // Recarrega para liberar painel admin
    } catch (err) {
        alert("Erro: " + err.message);
        loginBtn.innerText = "Entrar";
        loginBtn.disabled = false;
    }
});

// Checagem de Admin
auth.onAuthStateChanged(user => {
    if (user && user.email === "admin@admin.com") {
        document.getElementById('admin-panel').classList.remove('hidden');
    }
});

// --- CRUD e Dados ---
// Função para carregar cards e links (Realtime Database)
function carregarConteudo() {
    db.ref('conteudo').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Renderizar Cards
        const grid = document.getElementById('servicos');
        grid.innerHTML = '';
        Object.entries(data.servicos || {}).forEach(([id, s]) => {
            grid.innerHTML += `
                <div class="card" onclick="abrirModalServico('${s.titulo}', '${s.desc}')">
                    <h3>${s.titulo}</h3>
                </div>`;
        });
    });
}

// Funções de Admin (JSON)
function exportarDados() {
    db.ref('conteudo').once('value').then(snap => {
        const blob = new Blob([JSON.stringify(snap.val())], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = "backup_portal.json"; a.click();
    });
}

function importarDados() {
    const input = prompt("Cole o JSON aqui:");
    if (input) {
        db.ref('conteudo').set(JSON.parse(input))
            .then(() => alert("Dados importados!"));
    }
}

// --- Modais ---
function abrirModalServico(titulo, desc) {
    const modal = document.getElementById('modal-generic');
    document.getElementById('modal-body').innerHTML = `
        <h2>${titulo}</h2>
        <p>${desc}</p>
        <button class="btn-neon" onclick="window.location.href='#'">Acessar</button>
    `;
    modal.style.display = 'flex';
}

// Fechar modal ao clicar fora
window.onclick = (e) => {
    if (e.target.className === 'modal') e.target.style.display = 'none';
};

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
});

// Inicialização
document.getElementById('btn-admin').onclick = () => document.getElementById('modal-admin').style.display = 'flex';
carregarConteudo();
