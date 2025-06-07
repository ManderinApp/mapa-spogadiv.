import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhyucLkaEKzzFirNoYuNHAMnbiDd8_vHg",
  authDomain: "spogady-map.firebaseapp.com",
  projectId: "spogady-map",
  storageBucket: "spogady-map.firebasestorage.app",
  messagingSenderId: "772600864295",
  appId: "1:772600864295:web:371f05287be64c04867802",
  measurementId: "G-TJC2YH0JVF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Persistence error:", err.code);
});

const map = L.map('map').setView([48.3794, 31.1656], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const statusDiv = document.getElementById('status');

function updateOnlineStatus() {
  if (navigator.onLine) {
    statusDiv.style.display = "none";
  } else {
    statusDiv.textContent = "🔌 Ви офлайн. Спогад буде збережено, коли зʼявиться інтернет.";
    statusDiv.style.display = "block";
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

map.on('click', async (e) => {
  const name = prompt("Введіть ваше ім’я:");
  const text = prompt("Поділіться своїм спогадом:");
  const timestamp = new Date().toISOString();

  if (name && text) {
    try {
      await addDoc(collection(db, "spogady"), {
        name,
        text,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        timestamp
      });
    } catch (error) {
      console.error("Помилка збереження:", error);
    }
  }
});

onSnapshot(collection(db, "spogady"), (snapshot) => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      const data = change.doc.data();
      const date = new Date(data.timestamp).toLocaleString("uk-UA");
      const popup = `<b>${data.name}</b><br>${data.text}<br><small>${date}</small>`;
      L.marker([data.lat, data.lng]).addTo(map).bindPopup(popup);
    }
  });
});
