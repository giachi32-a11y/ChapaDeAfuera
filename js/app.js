// 1. LISTA PARTECIPANTI
const nomi = [
  "cami",
  "gre",
  "ali",
  "franca",
  "sofi",
  "gaia",
  "vane",
  "sylvie",
  "anna"
];

// 2. LISTA BONUS E MALUS
const azioni = [
  // BONUS
  { testo: "Fare una cosa a tre", punti: 500 },
  { testo: "Portarsi gente in casa", punti: 250 },
  { testo: "Andare oltre al bacio (scopata)", punti: 200 },
  { testo: "Farsi una foto con un nano/a", punti: 100 },
  { testo: "Andare oltre al bacio (preliminari)", punti: 80 },
  { testo: "Torna in hotel con un cono stradale o un oggetto assurdo trovato in giro", punti: 80 },
  { testo: "Fare gli assist", punti: 60 },
  { testo: "Farsi un tipo (solo bacio)", punti: 50 },
  { testo: "Rimorchiare un tipo in spiaggia", punti: 50 },
  { testo: "Chi beve uno shot di vodka liscia", punti: 50 },
  { testo: "Chi lava i piatti", punti: 30 },
  { testo: "Farsi offrire drink", punti: 20 },
  { testo: "Farsi offrire una sigaretta", punti: 20 },
  { testo: "Chi fa una foto con il buttafuori", punti: 15 },
  { testo: "Chi fa tatuaggi o pearcing", punti: 10 },

  // MALUS
  { testo: "Sentire l'ex in vacanza o scopa amici attuali/storici", punti: -200 },
  { testo: "Chi salta una serata perché \"stanca\"", punti: -150 },
  { testo: "Farsi buttare fuori dalla disco", punti: -100 },
  { testo: "Chi rompe qualcosa", punti: -100 },
  { testo: "Rimorchiare una lesbica", punti: -50 },
  { testo: "Perdere oggetti personali", punti: -30 },
  { testo: "Vomitare", punti: -25 },
  { testo: "Presa male per fumo", punti: -25 },
  { testo: "Fare più di 2 cadute da ubriaca", punti: -20 },
  { testo: "Chi cade prima dal jet-ski/bananone", punti: -20 },
  { testo: "Chi piange per qualsiasi motivo da ubriaca", punti: -20 },
  { testo: "Chi fa cadere un drink", punti: -20 },
  { testo: "Non ubriacarsi", punti: -15 },
  { testo: "Perdere il gruppo in una serata", punti: -10 },
  { testo: "Chi prende una multa per la valigia", punti: -10 },
  { testo: "Chi dice “stasera non bevo” e poi è la prima a ubriacarsi", punti: -10 }
];

let selezioni = {
  azione: null,
  punti: 0,
  persona: null
};

// INIZIALIZZAZIONE CLASSIFICA IN LOCALSTORAGE
function inizializzaClassifica() {
  let salvataggio = localStorage.getItem("fanta_classifica");
  if (!salvataggio) {
    let classificaIniziale = {};
    nomi.forEach(nome => {
      classificaIniziale[nome] = 0;
    });
    localStorage.setItem("fanta_classifica", JSON.stringify(classificaIniziale));
  }
}

// CAMBIO PAGINA
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// RENDER BONUS / MALUS
function renderBonusMalus() {
  const bonusList = document.getElementById("bonus-list");
  const malusList = document.getElementById("malus-list");

  bonusList.innerHTML = "";
  malusList.innerHTML = "";

  azioni.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "btn";
    const segno = item.punti > 0 ? `+${item.punti}` : `${item.punti}`;
    btn.innerText = `${item.testo} (${segno})`;
    btn.onclick = () => selezionaAzione(item.testo, item.punti);

    if (item.punti > 0) {
      bonusList.appendChild(btn);
    } else {
      malusList.appendChild(btn);
    }
  });
}

// RENDER PERSONE
function renderPersone() {
  const personeList = document.getElementById("persone-list");
  personeList.innerHTML = "";

  nomi.forEach(nome => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.innerText = nome;
    btn.onclick = () => selezionaPersona(nome);
    personeList.appendChild(btn);
  });
}

function selezionaAzione(testo, punti) {
  selezioni.azione = testo;
  selezioni.punti = punti;
  showPage('page-persone');
}

function selezionaPersona(nome) {
  selezioni.persona = nome;
  document.getElementById("persona-selezionata-title").innerText = nome;
  const segno = selezioni.punti > 0 ? `+${selezioni.punti}` : `${selezioni.punti}`;
  document.getElementById("testo-conferma").innerHTML = 
    `Confermi di voler assegnare a <b>${nome}</b>:<br><br><span>${selezioni.azione} (${segno} Punti)</span>?`;
  showPage('page-conferma');
}

function confermaAssegnazione() {
  let classifica = JSON.parse(localStorage.getItem("fanta_classifica")) || {};
  if (classifica[selezioni.persona] !== undefined) {
    classifica[selezioni.persona] += selezioni.punti;
  } else {
    classifica[selezioni.persona] = selezioni.punti;
  }
  localStorage.setItem("fanta_classifica", JSON.stringify(classifica));
  selezioni = { azione: null, punti: 0, persona: null };
  showPage('page-home');
}

// CLASSIFICA CON ORDINAMENTO AUTOMATICO (Punti desc, Nome asc)
function openClassifica() {
  let classifica = JSON.parse(localStorage.getItem("fanta_classifica")) || {};
  let classificaOrdinata = Object.keys(classifica).map(nome => {
    return { nome: nome, punti: classifica[nome] };
  }).sort((a, b) => {
    if (b.punti !== a.punti) {
      return b.punti - a.punti; // Ordina per punti decrescenti
    }
    return a.nome.localeCompare(b.nome); // In caso di parità, ordina alfabeticamente
  });

  const tbody = document.getElementById("classifica-body");
  tbody.innerHTML = "";

  classificaOrdinata.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.punti}</td>
    `;
    tbody.appendChild(tr);
  });

  showPage('page-classifica');
}

// CONTROLLO PASSWORD PER CORREZIONE
function accediCorrezione() {
  const pw = prompt("Inserisci la password per modificare i punti:");
  if (pw === "GreBarcellona26") {
    renderCorrezione();
    showPage('page-correzione');
  } else if (pw !== null) {
    alert("Password errata!");
  }
}

// RENDER PAGINA CORREZIONE
function renderCorrezione() {
  let classifica = JSON.parse(localStorage.getItem("fanta_classifica")) || {};
  const container = document.getElementById("correzione-list");
  container.innerHTML = "";

  nomi.forEach(nome => {
    const puntiAttuali = classifica[nome] || 0;
    const row = document.createElement("div");
    row.className = "correzione-row";
    row.innerHTML = `
      <span class="correzione-nome">${nome}</span>
      <div class="correzione-controls">
        <button class="btn-mini" onclick="modificaPuntiManuale('${nome}', -5)">-</button>
        <span class="correzione-punti" id="punti-${nome}">${puntiAttuali}</span>
        <button class="btn-mini" onclick="modificaPuntiManuale('${nome}', 5)">+</button>
      </div>
    `;
    container.appendChild(row);
  });
}

// MODIFICA MANUALE DEI PUNTI (+5 / -5 per click)
function modificaPuntiManuale(nome, delta) {
  let classifica = JSON.parse(localStorage.getItem("fanta_classifica")) || {};
  classifica[nome] = (classifica[nome] || 0) + delta;
  localStorage.setItem("fanta_classifica", JSON.stringify(classifica));
  
  // Aggiorna il numero a schermo al volo
  document.getElementById(`punti-${nome}`).innerText = classifica[nome];
}

// AVVIO APPLICAZIONE
window.onload = () => {
  inizializzaClassifica();
  renderBonusMalus();
  renderPersone();

  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
      }, 500);
    }
  }, 2000);
};

// GESTIONE ZOOM FOTO PROFILE & PROTEZIONE SALVATAGGIO
document.addEventListener('DOMContentLoaded', () => {
  const profileImg = document.querySelector('.home-photo');
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');

  if (profileImg && modal && modalImg) {
    // Apri modale al tap / click
    profileImg.addEventListener('click', (e) => {
      e.stopPropagation();
      modalImg.src = profileImg.src;
      modal.classList.add('active');
    });

    // Blocco pressione prolungata / salva immagine
    profileImg.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  if (modal) {
    // Chiudi modale al tap ovunque
    modal.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    if (modalImg) {
      modalImg.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }
});
