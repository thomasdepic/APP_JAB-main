# APP_JAB

Application web de suivi et de configuration de missions pour drones, conçue pour la société Drone Des Champs.  
L'application permet de visualiser et configurer un vol de collect de données au dessus d'un étang, puis de suivre les interventions en temps réel avec affichage cartographique (Leaflet) et intégration drone/GPS.

---

## 🌐 Structure du répertoire `/main`

### 📄 Fichiers principaux

---

### 🎨 `/styles` – Feuilles de style CSS

---

### 🧠 `/src` – Scripts JavaScript principaux

---

### 🧩 `/src/config` – Scripts liés à la configuration des sites

---

### 🚁 `/src/execution` – Modules liés au suivi en temps réel

---

### 🧰 `/src/utils` – Fonctions utilitaires

---

### 🖼 `/assets` - Icones pour l'interface graphique

---

## 🚧 Fonctions principales

- 📍 **Cartographie dynamique Leaflet** avec polygone éditable
- 📐 **Configuration interactive** (grille, buffers, pente, rotation, profondeur, etc.)
- 💾 **Sauvegarde/chargement automatique via JSON** intégré dans formulaire Flask
- 🚁 **Suivi temps réel drone** permet d'update l'état de la mission

---

## 🧱 Dépendances techniques

- Leaflet.js
- Bootstrap (pour styliser les formulaires)
- Turf.js (géotraitement en JS)

---

## 📌 À venir

- Amélioration interface mobile/tablette
- Export des plans de vol pour drones


/main  
│── /index.html  
│── /styles
│   │── main.css               # Style principal  
│   │── config.css             # Styles spécifiques au mode configuration  
│   │── execution.css          # Styles spécifiques au mode exécution  
│── /src
│   │── display.js             # Gestion du display des layers de popup  
│   │── main.js                # Point d'entrée principal  
│   │── map.js                 # Initialisation de la carte Leaflet  
│   │── storage.js             # Sauvegarde et chargement des fichiers GeoJSON  
|   |── toolbar.js             # Gestion de la barre d'outils  
│   │── /config                # Scripts spécifiques au mode configuration  
│   │   │── polygon.js         # Gestion du polygone éditable  
│   │   │── bufferDemi.js      # Calcul des buffers demi  
│   │   │── bufferPente.js     # Calcul des buffers en pente  
│   │   │── intersections.js   # Calcul des intersections  
│   │── /execution             # Scripts spécifiques au mode exécution  
│   │   │── droneTracker.js    # Suivi en temps réel du drone  
│   │   │── gpsReader.js       # Lecture des données GPS via le port série  
│   │── /utils                 # Fonctions utilitaires réutilisables  
│   │   │── point.js           # Classe ou fonctions pour la gestion des points géographiques  
│   │   │── geoUtils.js        # Fonctions de manipulation des coordonnées GPS  
│   │   |── sliders.js         # Gestion des sliders personnalisés  
│── /assets  
│   │── /icons                 # Icônes pour l'interface utilisateur  
|── /.vscode  
|   |── settings.json  
|── package.json  
|── README.md 
