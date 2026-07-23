import { DATA_FILES } from './config.js';

export async function loadAllStations() {
  const fetchPromises = DATA_FILES.map(file => 
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        download: true,       // Téléchargement direct streaming via PapaParse
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        transformHeader: h => h.trim().replace(/^["']|["']$/g, ''),
        complete: results => resolve(results.data),
        error: err => reject(err)
      });
    })
  );

  const resultsArray = await Promise.all(fetchPromises);
  const rawStations = resultsArray.flat();

  return rawStations.map(st => {
    let rawLat = st.LAT ? parseFloat(st.LAT.toString().replace(',', '.')) : NaN;
    let rawLon = st.LON ? parseFloat(st.LON.toString().replace(',', '.')) : NaN;

    if (Math.abs(rawLat) > 180) rawLat /= 1000000;
    if (Math.abs(rawLon) > 180) rawLon /= 1000000;

    let lat = rawLat, lon = rawLon;
    if (rawLat >= -5 && rawLat <= 10 && rawLon >= 41 && rawLon <= 51) {
      lat = rawLon; lon = rawLat;
    }

    return { ...st, parsedLat: lat, parsedLon: lon };
  }).filter(st => !isNaN(st.parsedLat) && !isNaN(st.parsedLon));
}