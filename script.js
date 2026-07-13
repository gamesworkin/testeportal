/* =========================================================
   WORKIN'STORE - script.js
   ---------------------------------------------------------
   PREENCHA AQUI SUAS CONFIGURAÇÕES DO FIREBASE:
   (Console Firebase → Project Settings → Config)
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyDiAP2IvsfPac29qzFA71sbLYuizVxZ9HQ",
  authDomain: "portal-workin-store.firebaseapp.com",
  databaseURL: "https://portal-workin-store-default-rtdb.firebaseio.com",
  projectId: "portal-workin-store",
  storageBucket: "portal-workin-store.firebasestorage.app",
  messagingSenderId: "803334158041",
  appId: "1:803334158041:web:5ef4069e7ec3a5973970c8"
};

/* =========================================================
   VITRINE - imagens hospedadas no seu GitHub
   Substitua pelos links RAW dos seus produtos.
   Ex: https://raw.githubusercontent.com/USUARIO/REPO/main/img/produto1.png
========================================================= */
const showcaseImages = [
  "https://raw.githubusercontent.com/USUARIO/REPO/main/produtos/kit-opl.png",
  "https://raw.githubusercontent.com/USUARIO/REPO/main/produtos/memory-card.png",
  "https://raw.githubusercontent.com/USUARIO/REPO/main/produtos/controle-ps2.png",
  "https://raw.githubusercontent.com/USUARIO/REPO/main/produtos/pendrive.png"
];

/* =========================================================
   E-MAIL DO ADMIN
========================================================= */
const ADMIN_EMAIL = "admin@admin.com";

/* ========================================================= */
/* INIT FIREBASE                                              */
/* ========================================================= */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.database();

/* ========================================================= */
/* HELPERS                                                    */
/* ========================================================= */
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

function openModal(id){ $('#'+id).classList.add('active'); }
function closeModal(id){ $('#'+id).classList.remove('active'); }

/* ---------- fechar modais (X e clique fora) ---------- */
document.addEventListener('click', e => {
  if (e.target.hasAttribute('data-close')){
    e.target.closest('.modal').classList.remove('active');
  }
  if (e.target.classList.contains('modal')){
    e.target.classList.remove('active');
  }
  if (e.target.hasAttribute('data-close-admin')){
    $('#adminPanel').classList.remove('active');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal.active').forEach(m => m.classList.remove('active'));
});

/* ========================================================= */
/* VITRINE ROTATIVA                                           */
/* ========================================================= */
(function initShowcase(){
  const box = $('#showcase');
  showcaseImages.forEach((src,i) => {
    const img = document.createElement('img');
    img.src = src; img.alt = 'Produto '+(i+1);
    if (i===0) img.classList.add('active');
    box.appendChild(img);
  });
  let idx = 0;
  const imgs = $$('#showcase img');
  if (imgs.length < 2) return;
  setInterval(()=>{
    imgs[idx].classList.remove('active');
    idx = (idx+1) % imgs.length;
    imgs[idx].classList.add('active');
  }, 3500);
})();

/* ========================================================= */
/* MENU MOBILE                                                */
/* ========================================================= */
$('#menuToggle').addEventListener('click', ()=> {
  $('#mainNav').classList.toggle('open');
});

/* ========================================================= */
/* ANO NO RODAPÉ                                              */
/* ========================================================= */
$('#year').textContent = new Date().getFullYear();

/* ========================================================= */
/* RENDER: LINKS DO CABEÇALHO                                 */
/* ========================================================= */
let headerLinksData = {};
let cardsData = {};

db.ref('headerLinks').on('value', snap => {
  headerLinksData = snap.val() || {};
  renderHeaderLinks();
  renderAdminHeaderList();
});
db.ref('cards').on('value', snap => {
  cardsData = snap.val() || {};
  renderCards();
  renderAdminCardList();
});

function renderHeaderLinks(){
  const ul = $('#navLinks'); ul.innerHTML = '';
  Object.entries(headerLinksData).forEach(([id, item]) => {
    const li = document.createElement('li');
    if (item.type === 'modal'){
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.addEventListener('click', ()=>{
        $('#linkModalTitle').textContent = item.title || item.label;
        $('#linkModalBody').textContent  = item.body  || '';
        const a = $('#linkModalBtn');
        if (item.url){ a.href = item.url; a.style.display='inline-block'; }
        else a.style.display='none';
        openModal('linkModal');
        $('#mainNav').classList.remove('open');
      });
      li.appendChild(btn);
    } else {
      const a = document.createElement('a');
      a.href = item.url || '#'; a.textContent = item.label;
      li.appendChild(a);
    }
    ul.appendChild(li);
  });
}

/* ========================================================= */
/* RENDER: CARDS DE SERVIÇO                                   */
/* ========================================================= */
function renderCards(){
  const grid = $('#cardsGrid'); grid.innerHTML = '';
  const entries = Object.entries(cardsData);
  if (entries.length === 0){
    grid.innerHTML = '<p style="opacity:.6;text-align:center;grid-column:1/-1">Nenhum serviço cadastrado ainda.</p>';
    return;
  }
  entries.forEach(([id, c])=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${c.logo}" alt="${c.title}" onerror="this.style.display='none'">
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
    `;
    card.addEventListener('click', ()=>{
      $('#cardModalLogo').src = c.logo;
      $('#cardModalTitle').textContent = c.title;
      $('#cardModalDesc').textContent  = c.desc;
      $('#cardModalLink').href = c.link;
      openModal('cardModal');
    });
    grid.appendChild(card);
  });
}

/* ========================================================= */
/* LOGIN ADMIN                                                */
/* ========================================================= */
$('#adminBtn').addEventListener('click', ()=> openModal('loginModal'));

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('#loginSubmit');
  const err = $('#loginError'); err.textContent = '';
  const email = $('#loginEmail').value.trim();
  const pass  = $('#loginPassword').value;

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Logando...';

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // sucesso: onAuthStateChanged trata o resto
  } catch (ex){
    err.textContent = 'Falha no login: ' + (ex.message || ex.code);
    btn.disabled = false;
    btn.textContent = originalText;
  }
});

auth.onAuthStateChanged(user => {
  if (user && user.email === ADMIN_EMAIL){
    closeModal('loginModal');
    $('#adminPanel').classList.add('active');
    // reset botão login
    const btn = $('#loginSubmit');
    btn.disabled = false; btn.textContent = 'Entrar';
    $('#loginForm').reset();
  } else if (user && user.email !== ADMIN_EMAIL){
    auth.signOut();
    $('#loginError').textContent = 'Usuário sem permissão de administrador.';
    const btn = $('#loginSubmit');
    btn.disabled = false; btn.textContent = 'Entrar';
  } else {
    $('#adminPanel').classList.remove('active');
  }
});

$('#logoutBtn').addEventListener('click', ()=> auth.signOut());

/* ========================================================= */
/* ADMIN - TABS                                               */
/* ========================================================= */
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', ()=>{
    $$('.tab-btn').forEach(b=>b.classList.remove('active'));
    $$('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    $('#'+btn.dataset.tab).classList.add('active');
  });
});

/* ========================================================= */
/* ADMIN - LINKS DO CABEÇALHO                                 */
/* ========================================================= */
const headerForm = $('#headerForm');
headerForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = $('#headerId').value || db.ref('headerLinks').push().key;
  const data = {
    label: $('#headerLabel').value.trim(),
    type:  $('#headerType').value,
    url:   $('#headerUrl').value.trim(),
    title: $('#headerTitle').value.trim(),
    body:  $('#headerBody').value.trim()
  };
  db.ref('headerLinks/'+id).set(data).then(()=>{
    headerForm.reset(); $('#headerId').value='';
  });
});
$('#headerCancel').addEventListener('click', ()=>{
  headerForm.reset(); $('#headerId').value='';
});

function renderAdminHeaderList(){
  const ul = $('#headerList'); ul.innerHTML = '';
  Object.entries(headerLinksData).forEach(([id,item])=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item-info">
        <strong>${item.label}</strong>
        <small>${item.type === 'modal' ? 'Modal' : 'Link'} · ${item.url || item.title || ''}</small>
      </div>
      <div class="item-actions">
        <button data-edit="${id}">Editar</button>
        <button class="del" data-del="${id}">Excluir</button>
      </div>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', ()=>{
    const id = b.dataset.edit; const it = headerLinksData[id];
    $('#headerId').value = id;
    $('#headerLabel').value = it.label || '';
    $('#headerType').value  = it.type  || 'link';
    $('#headerUrl').value   = it.url   || '';
    $('#headerTitle').value = it.title || '';
    $('#headerBody').value  = it.body  || '';
  }));
  ul.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', ()=>{
    if (confirm('Excluir este link?')) db.ref('headerLinks/'+b.dataset.del).remove();
  }));
}

/* ========================================================= */
/* ADMIN - CARDS                                              */
/* ========================================================= */
const cardForm = $('#cardForm');
cardForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = $('#cardId').value || db.ref('cards').push().key;
  const data = {
    title: $('#cardTitle').value.trim(),
    desc:  $('#cardDesc').value.trim(),
    logo:  $('#cardLogo').value.trim(),
    link:  $('#cardLink').value.trim()
  };
  db.ref('cards/'+id).set(data).then(()=>{
    cardForm.reset(); $('#cardId').value='';
  });
});
$('#cardCancel').addEventListener('click', ()=>{
  cardForm.reset(); $('#cardId').value='';
});

function renderAdminCardList(){
  const ul = $('#cardList'); ul.innerHTML = '';
  Object.entries(cardsData).forEach(([id,c])=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="item-info">
        <strong>${c.title}</strong>
        <small>${c.link || ''}</small>
      </div>
      <div class="item-actions">
        <button data-edit="${id}">Editar</button>
        <button class="del" data-del="${id}">Excluir</button>
      </div>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', ()=>{
    const id = b.dataset.edit; const c = cardsData[id];
    $('#cardId').value = id;
    $('#cardTitle').value = c.title || '';
    $('#cardDesc').value  = c.desc  || '';
    $('#cardLogo').value  = c.logo  || '';
    $('#cardLink').value  = c.link  || '';
  }));
  ul.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', ()=>{
    if (confirm('Excluir este card?')) db.ref('cards/'+b.dataset.del).remove();
  }));
}

/* ========================================================= */
/* ADMIN - IMPORT / EXPORT JSON                               */
/* ========================================================= */
$('#exportBtn').addEventListener('click', ()=>{
  const payload = { headerLinks: headerLinksData, cards: cardsData };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'workin-store-backup.json'; a.click();
  URL.revokeObjectURL(url);
});

$('#importFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!confirm('Importar substituirá os dados atuais. Continuar?')) return;
      const updates = {};
      if (data.headerLinks) updates.headerLinks = data.headerLinks;
      if (data.cards)       updates.cards       = data.cards;
      db.ref().update(updates).then(()=> alert('Importação concluída!'));
    } catch (err){
      alert('Arquivo JSON inválido: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});
