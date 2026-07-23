import { TOUR_EIFFEL_COORDS, MAX_VISIBLE_STATIONS } from './config.js';
import { loadAllStations } from './dataLoader.js';
import { createStationPopupContent } from './popups.js';
import { addCircle, addPin } from './shapes.js';

let map;
let markersClusterGroup;
let circlesLayerGroup;
let pinsLayerGroup;
let allStations = [];
let isPinMode = false;

async function initMap() {
  map = L.map('map').setView(TOUR_EIFFEL_COORDS, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Optimisation et déploiement en araignée pour antennes superposées
  markersClusterGroup = L.markerClusterGroup({ 
    maxClusterRadius: 90,
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false
  });

  circlesLayerGroup = L.layerGroup().addTo(map);
  pinsLayerGroup = L.layerGroup().addTo(map);
  map.addLayer(markersClusterGroup);

  map.on('moveend zoomend', updateVisibleStations);
  map.on('click', (e) => {
    if (isPinMode) addPin(e, map, pinsLayerGroup, togglePinMode);
  });

  document.getElementById('btn-add-circle').addEventListener('click', () => {
    addCircle(map, circlesLayerGroup, allStations, isPinMode);
  });
  document.getElementById('btn-pin').addEventListener('click', togglePinMode);

  // Chargement des données CSV
  allStations = await loadAllStations();
  updateVisibleStations();
}

function updateVisibleStations() {
  if (allStations.length === 0) return;

  const bounds = map.getBounds();
  const visibleStations = allStations.filter(st => bounds.contains([st.parsedLat, st.parsedLon]));
  const counterElem = document.getElementById('status-counter');

  let stationsToRender = visibleStations;

  if (visibleStations.length > MAX_VISIBLE_STATIONS) {
    const step = Math.ceil(visibleStations.length / MAX_VISIBLE_STATIONS);
    stationsToRender = visibleStations.filter((_, index) => index % step === 0);

    counterElem.innerText = `${visibleStations.length.toLocaleString('fr-FR')} antennes dans la zone (affichage fluide de ${stationsToRender.length.toLocaleString('fr-FR')} points - Zoomez pour tout voir)`;
    counterElem.className = "text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-400 font-semibold";
  } else {
    counterElem.className = "text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300";
    counterElem.innerText = `Nombre de stations affichées : ${visibleStations.length.toLocaleString('fr-FR')} / ${allStations.length.toLocaleString('fr-FR')}`;
  }

  markersClusterGroup.clearLayers();
  const markers = stationsToRender.map(st => {
    const marker = L.marker([st.parsedLat, st.parsedLon]);
    marker.bindPopup(createStationPopupContent(st));
    return marker;
  });
  markersClusterGroup.addLayers(markers);
}

function togglePinMode() {
  isPinMode = !isPinMode;
  const btn = document.getElementById('btn-pin');

  if (isPinMode) {
    btn.classList.replace('bg-red-600', 'bg-gray-500');
    btn.classList.replace('hover:bg-red-500', 'hover:bg-gray-400');
    document.body.classList.add('pin-mode');
  } else {
    btn.classList.replace('bg-gray-500', 'bg-red-600');
    btn.classList.replace('hover:bg-gray-400', 'hover:bg-red-500');
    document.body.classList.remove('pin-mode');
  }
}

window.onload = initMap;