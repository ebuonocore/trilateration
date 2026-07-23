# 📡 Trilatération - Illustration du programme de SNT

Ce projet est une **illustration interactive** du principe de **trilatération**, abordé dans le **chapitre "Localisation et cartographie"** du programme de **Sciences Numériques et Technologie (SNT)** en classe de Seconde.

L'objectif est de visualiser comment la **localisation par distance** (mesure des rayons autour de points connus) permet de déterminer une position sur une carte.

```mermaid
graph TD
    A["Station 1 (Lat: 48.8584, Lon: 2.2945)"] --> Rayon: 10 km| B(Cercle 1)
    C["Station 2 (Lat: 48.8601, Lon: 2.3012)"] -->|Rayon: 8 km| D(Cercle 2)
    E["Station 3 (Lat: 48.8550, Lon: 2.2890)"] -->|Rayon: 12 km| F(Cercle 3)

    B & D & F --> G["Zone d'intersection (Position estimée)"]

    style A fill:#f9f,stroke:#333
    style C fill:#f9f,stroke:#333
    style E fill:#f9f,stroke:#333
    style G fill:#bbf,stroke:#333,stroke-width:2px
```
---
## 🌍 **Fonctionnalités**

### ✅ **Création et gestion des périmètres de détection**
- **Ajouter un cercle** :
  - Saisis l'**identifiant d'une station** (ex: `1525818`) et un **rayon en mètres** dans le formulaire en haut à droite.
  - Clique sur **"Ajouter"** ou **"Valider"** pour dessiner un cercle bleu autour de la station.
- **Supprimer un cercle** :
  - Clique sur un cercle bleu pour ouvrir son popup.
  - Clique sur **"🗑️ Supprimer"** pour le retirer de la carte.

### ✅ **Création et gestion des emplacements personnalisés**
- **Poser une épingle** :
  - Clique sur le bouton **📌** (il se grise pour indiquer que le mode est activé).
  - Clique **n'importe où sur la carte** pour poser une épingle rouge.
- **Supprimer une épingle** :
  - Clique sur l'épingle pour ouvrir son popup.
  - Clique sur **"🗑️ Supprimer"** pour la retirer.

![](/assets/illustration_01.png)
---
## 🛠 **Technologies utilisées**
- **Frontend** :
  - HTML5 / CSS3 (avec Tailwind CSS pour le style)
  - JavaScript (ES6+) pour la logique interactive
  - [Leaflet.js](https://leafletjs.com/) : Bibliothèque de cartes interactives
  - [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) : Regroupement des marqueurs

- **Hébergement** :
  - GitHub Pages

---
## 🚀 **Comment l'utiliser ?**
1. **Ouvrir le site** :
   - Accède à l'URL du projet [`https://ebuonocore.github.io/trilateration/`](https://ebuonocore.github.io/trilateration/)
2. **Explorer les stations** :
   - Zoome/dézoome pour voir les stations dans la zone affichée.
   - Rafraîchissement des antennes toutes les trois secondes (🔥Evite d'afficher plus de 3000 antennes en dézoomant🔥)
   - Clique sur un marqueur pour voir ses détails.
3. **Créer des cercles** :
   - Utilise le formulaire pour ajouter des périmètres de détection.
4. **Ajouter des épingles** :
   - Active le mode épingle (📌) et clique sur la carte.

---
## 📚 **Sources des données**

### 🗺️ **Carte**
- **OpenStreetMap** : [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
  - Tuiles utilisées via Leaflet pour l'affichage cartographique.

### 📊 **Données des stations**
- **Jeu de données** : *"Données sur les installations radioélectriques de plus de 5 watts"*
  - **Source** : Agence Nationale des Fréquences (ANFR)
  - **Date de mise à jour** : 3 juillet 2026
  - **Format** : Fichier CSV `stations.csv`
  - **Contenu** :
    - Coordonnées GPS (latitude/longitude en degrés décimaux).
    - Identifiants des stations (SUP_ID, STA_NM_ANFR).
    - Informations complémentaires (adresse, type d'installation, etc.).

---
## 📜 **Licence**  

- Ce projet est **open source** et peut être librement utilisé à des fins pédagogiques.
- **Code** : Licence MIT (utilisation libre, modification autorisée).
Données : Les données des stations proviennent de l'ANFR (Agence Nationale des Fréquences) et sont publiquement accessibles.

---
## 📝 **Remarques pédagogiques**
- **Illustration concrète** de la trilatération :
  - Superpose plusieurs cercles pour localiser un point par intersection.
  - Expérimente avec des rayons différents pour comprendre l'impact des erreurs de mesure.
- **Cas d'usage** :
  - Localisation d'un appareil connaissant la distance à trois antennes (et les positions de ces antennes)
  - Principe utilisé par le GPS (avec au moins 3 satellites).

---
*Projet réalisé dans le cadre du programme de **SNT (Sciences Numériques et Technologie)**.*

```mermaid
flowchart TD
    subgraph "Données"
        A[Fichier CSV<br>stations.csv] -->|Contient| B[Liste des stations<br>+ Coordonnées GPS]
    end

    subgraph "Interface Utilisateur"
        C[Formulaire] -->|ID Station + Rayon| D[Créer un cercle]
        E[Bouton 📌] -->|Mode épingle| F[Poser une épingle]
        G[Carte OpenStreetMap] -->|Affichage| H[Stations + Cercles + Épingles]
    end

    subgraph "Fonctionnalités"
        D -->|Ajoute| I[Cercle bleu<br>Rayon personnalisable]
        F -->|Ajoute| J[Épingle rouge<br>Position GPS]
        I -->|Suppression| K[🗑️ Bouton dans le popup]
        J -->|Suppression| L[🗑️ Bouton dans le popup]
    end

    B -->|Chargement| G
    H -->|Visualisation| M[Trilatération:<br>Intersection des cercles]

    style A fill:#f96,stroke:#333
    style B fill:#f96,stroke:#333
    style C fill:#9f9,stroke:#333
    style D fill:#9f9,stroke:#333
    style E fill:#9f9,stroke:#333
    style F fill:#9f9,stroke:#333
    style G fill:#9cf,stroke:#333
    style H fill:#9cf,stroke:#333
    style M fill:#bbf,stroke:#333,stroke-width:2px
```
