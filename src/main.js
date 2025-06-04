import { initMap } from "./map.js";
import { initSliderWithButtons } from "./utils/sliders.js";
import {
  saveData as saveToFile,
  loadData as loadFromFile,
  initStorage,
} from "./storage.js";
import { centerOnDrone } from "./execution/droneTracker.js";
import { initToolbar } from "./toolbar.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Application démarrée");

  /* 1. */
  initMap();

  /* 2. */
  initSliderWithButtons("profondeurInput", "profondeurValue", "profondeurMinus", "profondeurPlus");
  initSliderWithButtons("penteInput",     "penteValue",      "penteMinus",      "pentePlus");
  initSliderWithButtons("cellSizeInput",  "cellSizeValue",   "cellSizeMinus",   "cellSizePlus");
  initSliderWithButtons("rotationInput",  "rotationValue",   "rotationMinus",   "rotationPlus");
  initSliderWithButtons("circleRadiusInput","circleRadiusValue","circleRadiusMinus","circleRadiusPlus");

  /* 3. */
  const settingsBtn      = document.getElementById("btn-settings");
  const slidersContainer = document.getElementById("slidersContainer");

  settingsBtn?.addEventListener("click", e => {
    e.stopPropagation();
    slidersContainer.style.display =
      slidersContainer.style.display === "flex" ? "none" : "flex";
  });
  document.addEventListener("click", e => {
    if (!slidersContainer.contains(e.target) && !settingsBtn.contains(e.target)) {
      slidersContainer.style.display = "none";
    }
  });

  /* 4. */
  initToolbar();
  console.log("🧭 initToolbar() appelée");

  /* 5. */
  initStorage();

  /* 6. */
  import("./config/polygon.js");
  import("./config/bufferFond.js").then(m  => m.initBufferFond());
  import("./config/bufferDemi.js").then(m => m.initBufferDemi());
  import("./config/intersections.js").then(m => m.initIntersections());

  /* 7. GPS-Reader */
  import("./execution/gpsReader.js").then(m => m.initGpsReader());

  /* 8. */
  import("./execution/droneTracker.js").then(m => {
    m.initExecutionModeLive();
    window.cleanupExecution = m.cleanupExecutionModeLive;
  });

  console.log("✅ Tous les modules sont chargés");
});
