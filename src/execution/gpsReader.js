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

/** WebSerial ou Android */
export function initGpsReader() {
  window.receiveSerialLine = line => processLine(line);

  if ("serial" in navigator) {
    connectSerial();
  } else {
    console.log("[gpsReader] Mode Android — en attente de données via window.receiveSerialLine");
  }
}

/* === Web Serial ======================================== */

export async function connectSerial() {
  if (!("serial" in navigator)) {
    console.warn("[gpsReader] Web Serial API non disponible");
    return;
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 }); // ✅ corrigé

    const decoder = new TextDecoderStream();
    const reader  = decoder.readable.getReader();
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

/* === Traitement d’une ligne série ====================== */

function processLine(rawLine) {
  const line = rawLine.trim();
  if (!line.startsWith("GPS:")) return;

  console.log(`[gpsReader] 🔎 Traitement : [${line}]`);

  const commaIdx = line.indexOf(",");
  if (commaIdx === -1) {
    console.log("[gpsReader] ❌ Ligne ignorée (pas de virgule)");
    return;
  }

  // Partie "GPS:{...}" → extraire la partie JSON
  const timePart = new Date().toLocaleTimeString();
  const dataPart = line.slice(4).trim(); // après "GPS:"

  if (timeDisplay) timeDisplay.textContent = `Heure : ${timePart}`;

  const data = parseDataPart(dataPart);
  if (!data) return;

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
}

/* === Extraction JSON ou CSV ============================= */

function parseDataPart(part) {
  if (part.startsWith("{") && part.endsWith("}")) {
    try {
      const obj = JSON.parse(part);
      if ("lat" in obj && "lon" in obj) return obj;
    } catch (e) {
      console.log("[gpsReader] ❌ JSON invalide", e);
    }
    return null;
  }

  const pieces = part.split(",");
  if (pieces.length >= 2) {
    return { lat: pieces[0], lon: pieces[1] };
  }

  console.log("[gpsReader] ⚠️ Données GPS non reconnues :", part);
  return null;
}
