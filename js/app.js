// CONFIGURAZIONE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBbCvJu1gVl9DjU3cozvsRpqCXI1JsIsH0",
  authDomain: "fantabarcellona.firebaseapp.com",
  databaseURL: "https://fantabarcellona-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fantabarcellona",
  storageBucket: "fantabarcellona.firebasestorage.app",
  messagingSenderId: "867257608994",
  appId: "1:867257608994:web:f5cb258f858b938073537b"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

// MIGRAZIONE AUTOMATICA DEI VECCHI PUNTI SALVATI SUL TELEFONO
function migraPuntiLocali() {
  let salvataggio = localStorage.getItem("fanta_classifica");
  if (salvataggio) {
    try {
      let vecchiPunti = JSON.parse(salvataggio);
      database.ref('classifica').once('value', (snapshot) => {
        let datiServer = snapshot.val() || {};
        nomi.forEach(nome => {
          if (vecchiPunti[nome] !== undefined && vecchiPunti[nome] !== 0) {
            if (!datiServer[nome] || datiServer[nome] === 0) {
              database.ref('classifica/' + nome).set(vecchiPunti[nome]);
            }
          }
        });
      });
    } catch (e) {
      console.log("Errore migrazione:", e);
    }
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

// ASSEGNAZIONE PUNTI CON TRANSAZIONE SICURA CLOUD
function confermaAssegnazione() {
  const refPersona = database.ref('classifica/' + selezioni.persona);
  refPersona.transaction((currentPoints) => {
    return (currentPoints || 0) + selezioni.punti;
  }, (error, committed) => {
    if (committed) {
      selezioni = { azione: null, punti: 0, persona: null };
      showPage('page-home');
    }
  });
}

// OPEN CLASSIFICA DA FIREBASE
function openClassifica() {
  database.ref('classifica').once('value', (snapshot) => {
    let classifica = snapshot.val() || {};

    // Assicura che tutti i 9 nomi siano visibili in tabella
    nomi.forEach(nome => {
      if (classifica[nome] === undefined) {
        classifica[nome] = 0;
      }
    });

    let classificaOrdinata = Object.keys(classifica).map(nome => {
      return { nome: nome, punti: classifica[nome] };
    }).sort((a, b) => {
      if (b.punti !== a.punti) {
        return b.punti - a.punti;
      }
      return a.nome.localeCompare(b.nome);
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
  });
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
  database.ref('classifica').once('value', (snapshot) => {
    let classifica = snapshot.val() || {};
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
  });
}

// MODIFICA MANUALE DEI PUNTI SU FIREBASE (+5 / -5)
function modificaPuntiManuale(nome, delta) {
  const refPersona = database.ref('classifica/' + nome);
  refPersona.transaction((currentPoints) => {
    return (currentPoints || 0) + delta;
  }, (error, committed, snapshot) => {
    if (committed) {
      document.getElementById(`punti-${nome}`).innerText = snapshot.val();
    }
  });
}

// AVVIO APPLICAZIONE
window.onload = () => {
  migraPuntiLocali();
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

// GESTIONE ZOOM FOTO PROFILE & PROTEZIONE TRASCINAMENTO
document.addEventListener('DOMContentLoaded', () => {
  const profileImg = document.querySelector('.home-photo');
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');

  if (profileImg && modal && modalImg) {
    profileImg.addEventListener('click', (e) => {
      e.stopPropagation();
      modalImg.src = profileImg.src;
      modal.classList.add('active');
    });

    profileImg.addEventListener('contextmenu', (e) => e.preventDefault());
    profileImg.addEventListener('dragstart', (e) => e.preventDefault());
  }

  if (modal) {
    modal.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    if (modalImg) {
      modalImg.addEventListener('contextmenu', (e) => e.preventDefault());
      modalImg.addEventListener('dragstart', (e) => e.preventDefault());
    }
  }
});
