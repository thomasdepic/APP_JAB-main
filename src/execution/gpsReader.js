import { map, marker } from "../map.js";

const timeDisplay = document.getElementById("timeDisplay");

export let lat = null;
export let lng = null;

let onPositionUpdate = null;
let gpsReady         = false;

/* === API ====================================================== */

export function setOnPositionUpdate(cb) {
  console.log("[gpsReader] 🛰️ Callback de position GPS enregistré");
  onPositionUpdate = cb;
}

/** WebSerial или ожидание строк */
export function initGpsReader() {
  window.receiveSerialLine = line => processLine(line);

  if ("serial" in navigator) {
    connectSerial();
  } else {
    console.log("[gpsReader] Mode Android — ожидаем данные из window.receiveSerialLine");
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
    await port.open({ baudRate: 9600 });

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
    console.error("[gpsReader] Erreur connexion série", err);
  }
}

/* ======================================== */

function processLine(rawLine) {
  let line = rawLine.trim();
  if (!line.length) return;

  console.log(`[gpsReader] 🔎 Traitement : [${line}]`);

  if (line.startsWith("+RCV=")) {
    const firstComma = line.indexOf(",");
    if (firstComma !== -1) {
      line = line.slice(firstComma + 1).trim();
    }
  }

  const commaIdx = line.indexOf(",");
  if (commaIdx === -1) {
    console.log("[gpsReader] ❌ Ligne ignorée (pas de virgule)");
    return;
  }

  const timePart = line.slice(0, commaIdx).trim();
  const dataPart = line.slice(commaIdx + 1).trim();
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

function parseDataPart(part) {
  if (part.startsWith("{") && part.endsWith("}")) {
    try {
      const obj = JSON.parse(part);
      if (obj.lat && obj.lon) return obj;
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
