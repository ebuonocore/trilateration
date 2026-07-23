export function createStationPopupContent(st) {
  return `
    <div class="text-sm font-sans p-1 min-w-[200px]">
      <h3 class="font-bold text-sky-700 text-base mb-2 border-b pb-1">Antenne Télécom</h3>
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-4">
          <span><b>ID:</b> ${st.ID || ''}</span>
          <button onclick="copyToClipboard('${st.ID || ''}')" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded">Copier</button>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span><b>GPS:</b> ${st.parsedLat}, ${st.parsedLon}</span>
          <button onclick="copyToClipboard('${st.parsedLat}, ${st.parsedLon}')" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded">Copier</button>
        </div>
        <div><b>Opérateur:</b> <span class="font-medium text-slate-800">${st.OPR || 'N/C'}</span></div>
        <div><b>Technologie:</b> <span class="inline-block bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded font-bold">${st.SYST || 'N/C'}</span></div>
        <div class="text-xs text-gray-600 mt-1"><b>Adresse:</b> ${st.ADR || 'Non renseignée'}</div>
      </div>
    </div>
  `;
}

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg z-50';
    toast.innerText = `Copié : ${text}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  });
};