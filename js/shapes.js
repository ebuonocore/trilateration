import { createStationPopupContent } from './popups.js';

const activeShapes = {};
let shapeCounter = 0;

export function addCircle(map, circlesLayerGroup, allStations, isPinMode) {
  const stationId = document.getElementById('station-id').value.trim();
  const radius = parseFloat(document.getElementById('circle-radius').value);

  const station = allStations.find(s => s.ID === stationId);
  if (!station) {
    alert(`Station avec l'ID "${stationId}" introuvable.`);
    return;
  }

  const center = [station.parsedLat, station.parsedLon];
  const shapeId = 'shape_' + (shapeCounter++);

  const circle = L.circle(center, {
    color: '#0284c7',
    fillColor: '#38bdf8',
    fillOpacity: 0.25,
    radius: radius,
    interactive: !isPinMode 
  });

  activeShapes[shapeId] = { layer: circle, group: circlesLayerGroup };

  circle.on('click', (e) => {
    if (isPinMode) return;
    const popupContent = `
      ${createStationPopupContent(station)}
      <div class="mt-3 text-right border-t pt-2">
        <button onclick="removeShape('${shapeId}')" class="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded transition shadow-sm">
          <i class="fa-solid fa-trash mr-1"></i> Supprimer la zone
        </button>
      </div>
    `;
    L.popup().setLatLng(e.latlng).setContent(popupContent).openOn(map);
  });

  /// On ajoute le cercle à la carte
  circlesLayerGroup.addLayer(circle);

  // Ajuste la vue pour faire rentrer le cercle dans l'écran (seulement si nécessaire)
  const circleBounds = circle.getBounds();
  if (!map.getBounds().contains(circleBounds)) {
    map.fitBounds(circleBounds, { padding: [50, 50], maxZoom: map.getZoom() });
  }
}

export function addPin(e, map, pinsLayerGroup, togglePinModeCallback) {
  const lat = e.latlng.lat.toFixed(6);
  const lon = e.latlng.lng.toFixed(6);
  const shapeId = 'shape_' + (shapeCounter++);

  const pinIcon = L.divIcon({
    html: '<i class="fa-solid fa-location-dot text-red-600 text-3xl -translate-x-1/2 -translate-y-full drop-shadow"></i>',
    className: 'custom-pin-icon',
    iconSize: [0, 0]
  });

  const pinMarker = L.marker([lat, lon], { icon: pinIcon });
  activeShapes[shapeId] = { layer: pinMarker, group: pinsLayerGroup };

  const popupContent = `
    <div class="text-sm font-sans p-1">
      <h4 class="font-bold text-red-600 mb-1">Épingle repère</h4>
      <div class="flex items-center justify-between gap-4 mb-2">
        <span><b>LAT, LON:</b> ${lat}, ${lon}</span>
        <button onclick="copyToClipboard('${lat}, ${lon}')" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded">Copier</button>
      </div>
      <div class="mt-2 text-right border-t pt-2">
        <button onclick="removeShape('${shapeId}')" class="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded transition shadow-sm">
          <i class="fa-solid fa-trash mr-1"></i> Supprimer l'épingle
        </button>
      </div>
    </div>
  `;
  pinMarker.bindPopup(popupContent);
  pinsLayerGroup.addLayer(pinMarker);

  togglePinModeCallback();
}

window.removeShape = function(shapeId) {
  const shapeData = activeShapes[shapeId];
  if (shapeData) {
    shapeData.group.removeLayer(shapeData.layer);
    delete activeShapes[shapeId];
  }
};