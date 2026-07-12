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
const btnAdmin = document.getElementById('btn-admin');

btnAdmin.addEventListener('click', () => {
    document.getElementById('modal-admin').style.display = 'flex';
});

loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email-admin').value;
    const pass = document.getElementById('password-admin').value;
    
    loginBtn.innerText = "Logando...";
    loginBtn.disabled = true;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        alert("Login efetuado com sucesso!");
        document.getElementById('modal-admin').style.display = 'none';
        location.reload(); 
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

// --- Funções de Dados ---
function carregarConteudo() {
    db.ref('conteudo').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Renderizar Cards
        const grid = document.getElementById('servicos');
        grid.innerHTML = '';
        if (data.servicos) {
            Object.entries(data.servicos).forEach(([id, s]) => {
                grid.innerHTML += `
                    <div class="card" onclick="abrirModalServico('${s.titulo}', '${s.desc}')">
                        <h3>${s.titulo}</h3>
                    </div>`;
            });
        }
    });
}

// Funções de Admin (JSON)
function exportarDados() {
    db.ref('conteudo').once('value').then(snap => {
        const data = snap.val();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = "backup_portal.json"; a.click();
    });
}

function importarDados() {
    const input = prompt("Cole o JSON da estrutura do portal aqui:");
    if (input) {
        try {
            db.ref('conteudo').set(JSON.parse(input))
                .then(() => alert("Dados importados com sucesso!"));
        } catch (e) {
            alert("Erro no formato JSON!");
        }
    }
}

// --- Modais ---
function abrirModalServico(titulo, desc) {
    const modal = document.getElementById('modal-generic');
    document.getElementById('modal-body').innerHTML = `
        <h2>${titulo}</h2>
        <p style="margin: 20px 0;">${desc}</p>
        <button class="btn-neon" onclick="window.location.href='#'">Acessar</button>
    `;
    modal.style.display = 'flex';
}

// Fechamento de modais
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
});

// Inicialização
carregarConteudo();
