// --- DATI DI INIZIALIZZAZIONE ---

// I 9 nomi del gruppo (Puoi modificarli qui)
const nomiDefault = [
  "Marco", "Luca", "Giulia", "Sofia", "Andrea", 
  "Matteo", "Elena", "Francesca", "Alessandro"
];

// Lista dei Bonus (+ punti)
const bonusList = [
  { testo: "Offre da bere a tutti", punti: 15 },
  { testo: "Trova il locale perfetto", punti: 10 },
  { testo: "Primo ad alzarsi la mattina", punti: 5 },
  { testo: "Parla spagnolo con i locali", punti: 10 }
];

// Lista dei Malus (- punti)
const malusList = [
  { testo: "Perde le chiavi / oggetti", punti: -15 },
  { testo: "In ritardo alla partenza", punti: -10 },
  { testo: "Si lamenta del caldo", punti: -5 },
  { testo: "Lamentela durante la camminata", punti: -5 }
];

// --- CARICAMENTO O INIZIALIZZAZIONE SCORE ---
let punteggi = JSON.parse(localStorage.getItem('fanta_punteggi')) || {};

if (Object.keys(punteggi).length === 0) {
  nomiDefault.forEach(nome => { punteggi[nome] = 0; });
  salvaPunteggi();
}

let azioneSelezionata = null;
let personaSelezionata = null;

// --- NAVIGAZIONE PAGINE ---
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// --- RENDERING BONUS E MALUS ---
function initBonusMalus() {
  const bContainer = document.getElementById('bonus-list');
  const mContainer = document.getElementById('malus-list');
  
  bContainer.innerHTML = '';
  mContainer.innerHTML = '';

  bonusList.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerText = `${item.testo} (+${item.punti})`;
    btn.onclick = () => selezionaAzione(item);
    bContainer.appendChild(btn);
  });

  malusList.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerText = `${item.testo} (${item.punti})`;
    btn.onclick = () => selezionaAzione(item);
    mContainer.appendChild(btn);
  });
}

function selezionaAzione(item) {
  azioneSelezionata = item;
  renderPersone();
  showPage('page-persone');
}

// --- RENDERING PERSONE ---
function renderPersone() {
  const pContainer = document.getElementById('persone-list');
  pContainer.innerHTML = '';

  Object.keys(punteggi).forEach(nome => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerText = nome;
    btn.onclick = () => preparaConferma(nome);
    pContainer.appendChild(btn);
  });
}

function preparaConferma(nome) {
  personaSelezionata = nome;
  document.getElementById('persona-selezionata-title').innerText = nome.toUpperCase();
  
  const tipo = azioneSelezionata.punti > 0 ? 'aggiungere' : 'togliere';
  const valoreAssoluto = Math.abs(azioneSelezionata.punti);
  
  document.getElementById('testo-conferma').innerHTML = 
    `Confermi di <b>${tipo} ${valoreAssoluto} punti</b> a <span>${nome}</span> per "<I>${azioneSelezionata.testo}</I>"?`;

  showPage('page-conferma');
}

// --- SALVATAGGIO E CONFERMA ---
function confermaAssegnazione() {
  if (personaSelezionata && azioneSelezionata) {
    punteggi[personaSelezionata] += azioneSelezionata.punti;
    salvaPunteggi();
    alert(`Punti aggiornati per ${personaSelezionata}!`);
    showPage('page-home');
  }
}

function salvaPunteggi() {
  localStorage.setItem('fanta_punteggi', JSON.stringify(punteggi));
}

// --- CLASSIFICA ---
function openClassifica() {
  const tbody = document.getElementById('classifica-body');
  tbody.innerHTML = '';

  const ordinate = Object.keys(punteggi).map(nome => ({
    nome: nome,
    punteggio: punteggi[nome]
  })).sort((a, b) => b.punteggio - a.punteggio);

  ordinate.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.nome}</td><td>${p.punteggio} pts</td>`;
    tbody.appendChild(tr);
  });

  showPage('page-classifica');
}

// Inizializzazione al caricamento
initBonusMalus();
