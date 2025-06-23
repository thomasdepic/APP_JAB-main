import { map, marker } from "../map.js";

const timeDisplay = document.getElementById("timeDisplay");

export let lat = null;
export let lng = null;

let onPositionUpdate = null;
let gpsReady = false;

/* === API ====================================================== */

export function setOnPositionUpdate(cb) {
  console.log("[gpsReader] 🛰️ Callback de position GPS enregistré");
  onPositionUpdate = cb;
}

export function initGpsReader() {
  window.receiveSerialLine = line => processLine(line);

  if ("serial" in navigator) {
    connectSerial();
  } else {
    console.log("[gpsReader] Mode Android — en attente de données via window.receiveSerialLine");
  }
}

/* === Web Serial =============================================== */

export async function connectSerial() {
  if (!("serial" in navigator)) {
    console.warn("[gpsReader] Web Serial API non disponible");
    return;
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const decoder = new TextDecoderStream();
    const reader = decoder.readable.getReader();
    port.readable.pipeTo(decoder.writable);

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      const lines = buffer.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        processLine(lines[i]);
      }
      buffer = lines.at(-1);
    }
  } catch (err) {
    console.error("[gpsReader] ❌ Erreur connexion série", err);
  }
}

/* === Traitement de chaque ligne série ========================= */

function processLine(rawLine) {
  const line = rawLine.trim();
  console.log(line);
  if (!line.startsWith("GPS:")) return;

  console.log(`[gpsReader] 🔎 Traitement : [${line}]`);

  const jsonPart = line.slice(4).trim();

  // Vérifie que la chaîne JSON est complète (évite les erreurs de parsing)
  if (!jsonPart.startsWith("{") || !jsonPart.endsWith("}")) {
    console.warn("[gpsReader] ❌ Trame tronquée ou corrompue :", jsonPart);
    return;
  }

  try {
    const data = JSON.parse(jsonPart);

    // Accepte même les coordonnées (0.0, 0.0)
    if (typeof data.lat !== "number" || typeof data.lon !== "number") {
      console.warn("[gpsReader] ❌ Données GPS invalides :", jsonPart);
      return;
    }

    lat = parseFloat(data.lat);
    lng = parseFloat(data.lon);

    if (!gpsReady) {
      gpsReady = true;
      const gpsStatus = document.getElementById("gpsStatus");
      gpsStatus?.classList.add("ok");
      if (gpsStatus) gpsStatus.textContent = "✅ Signal GPS détecté";
      console.log("✅ Premier signal GPS reçu");
    }

    marker.setLatLng([lat, lng]);
    onPositionUpdate?.({ lat, lng });

  } catch (e) {
    console.error("[gpsReader] ❌ JSON invalide :", jsonPart, e);
  }
}
