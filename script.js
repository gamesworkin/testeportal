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

// Lógica de Login
document.getElementById('login-btn').addEventListener('click', () => {
    const btn = document.getElementById('login-btn');
    btn.innerText = "Logando...";
    btn.disabled = true;
    
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => alert("Bem-vindo Admin"))
        .catch(err => { alert(err.message); btn.innerText = "Entrar"; btn.disabled = false; });
});

// Exemplo de busca de dados no Realtime Database
function carregarCards() {
    db.ref('servicos').on('value', (snapshot) => {
        const servicos = snapshot.val();
        const container = document.getElementById('servicos');
        container.innerHTML = '';
        Object.values(servicos).forEach(s => {
            container.innerHTML += `<div class="card" onclick="abrirModal('${s.titulo}')"><h3>${s.titulo}</h3></div>`;
        });
    });
}

// Inicializar vitrine e cards
window.onload = carregarCards;

function abrirModal(titulo) {
    const modal = document.getElementById('modal-generic');
    modal.style.display = 'flex';
    document.getElementById('modal-body').innerHTML = `<h2>${titulo}</h2><button>Acessar</button>`;
}
