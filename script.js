// ======================== DATA KELURAHAN ========================
const KELURAHAN_PER_KEC = {
  Cipedes: ["Sukamanah", "Nagarasari", "Cipedes", "Panglayungan"],
  Cihideung: [
    "Yudanagara",
    "Argasari",
    "Cilembang",
    "Nagarawangi",
    "Tuguraja",
    "Tugujaya",
  ],
  Indihiang: [
    "Indihiang",
    "Parakannyasag",
    "Sirnagalih",
    "Sukamajukaler",
    "Sukamajukidul",
    "Panyingkiran",
  ],
  Kawalu: [
    "Karsamenak",
    "Cilamajang",
    "Gunung Tandala",
    "Leuwiliang",
    "Talagasari",
  ],
  Tamansari: ["Tamansari", "Mugarsari", "Sumelap", "Mulyasari", "Setiawargi"],
};
const SEMUA_TITIK = Object.values(KELURAHAN_PER_KEC).flat();

const koordinatKelurahan = {
  Sukamanah: [-7.335, 108.219],
  Nagarasari: [-7.338, 108.224],
  Cipedes: [-7.342, 108.221],
  Panglayungan: [-7.345, 108.228],
  Yudanagara: [-7.328, 108.22],
  Argasari: [-7.332, 108.215],
  Cilembang: [-7.336, 108.211],
  Nagarawangi: [-7.33, 108.218],
  Tuguraja: [-7.334, 108.212],
  Tugujaya: [-7.338, 108.208],
  Indihiang: [-7.318, 108.208],
  Parakannyasag: [-7.321, 108.213],
  Sirnagalih: [-7.315, 108.218],
  Sukamajukaler: [-7.311, 108.205],
  Sukamajukidul: [-7.315, 108.202],
  Panyingkiran: [-7.308, 108.214],
  Karsamenak: [-7.372, 108.198],
  Cilamajang: [-7.381, 108.191],
  "Gunung Tandala": [-7.388, 108.203],
  Leuwiliang: [-7.375, 108.185],
  Talagasari: [-7.378, 108.208],
  Tamansari: [-7.358, 108.188],
  Mugarsari: [-7.354, 108.195],
  Sumelap: [-7.362, 108.192],
  Mulyasari: [-7.348, 108.2],
  Setiawargi: [-7.365, 108.182],
};

// Default berat
const defaultBeratKelurahan = {};
SEMUA_TITIK.forEach((kel, idx) => {
  defaultBeratKelurahan[kel] = {
    organik: 3 + (idx % 5),
    anorganik: 2 + (idx % 3),
  };
});
defaultBeratKelurahan["Nagarasari"] = { organik: 12, anorganik: 5 };
defaultBeratKelurahan["Karsamenak"] = { organik: 8, anorganik: 4 };
defaultBeratKelurahan["Tamansari"] = { organik: 6, anorganik: 3 };

// ==================== FUNGSI GEOSPASIAL ====================
function haversine(coord1, coord2) {
  const R = 6371;
  const [lat1, lng1] = coord1;
  const [lat2, lng2] = coord2;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return parseFloat(
    (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2),
  );
}
function getJarak(a, b) {
  if (a === b) return 0;
  return haversine(koordinatKelurahan[a], koordinatKelurahan[b]);
}
function getKecamatan(kel) {
  for (const [kec, list] of Object.entries(KELURAHAN_PER_KEC)) {
    if (list.includes(kel)) return kec;
  }
  return "";
}

// ==================== ALGORITMA ====================
function greedyOpenPath(start, end, nodes) {
  let midpoints = nodes.filter((n) => n !== start && n !== end);
  let path = [start];
  let current = start;
  while (midpoints.length) {
    let nearest = midpoints.reduce((a, b) =>
      getJarak(current, a) < getJarak(current, b) ? a : b,
    );
    path.push(nearest);
    current = nearest;
    midpoints = midpoints.filter((n) => n !== nearest);
  }
  path.push(end);
  return path;
}
function hitungTotalJarak(rute) {
  let total = 0;
  for (let i = 0; i < rute.length - 1; i++)
    total += getJarak(rute[i], rute[i + 1]);
  return parseFloat(total.toFixed(2));
}

function dpOpenPath(start, end, nodes) {
  const n = nodes.length;
  if (n > 12) return null;
  const other = nodes.filter((p) => p !== start && p !== end);
  const m = other.length;
  const INF = 1e9;
  const dp = Array(1 << m);
  const parent = Array(1 << m);
  for (let i = 0; i < 1 << m; i++) {
    dp[i] = new Array(m).fill(INF);
    parent[i] = new Array(m).fill(-1);
  }
  for (let i = 0; i < m; i++) {
    dp[1 << i][i] = getJarak(start, other[i]);
    parent[1 << i][i] = -1;
  }
  for (let mask = 1; mask < 1 << m; mask++) {
    for (let last = 0; last < m; last++) {
      if (!(mask & (1 << last)) || dp[mask][last] >= INF) continue;
      for (let nxt = 0; nxt < m; nxt++) {
        if (mask & (1 << nxt)) continue;
        const newMask = mask | (1 << nxt);
        const nd = dp[mask][last] + getJarak(other[last], other[nxt]);
        if (nd < dp[newMask][nxt]) {
          dp[newMask][nxt] = nd;
          parent[newMask][nxt] = last;
        }
      }
    }
  }
  let bestDist = INF,
    bestLast = -1;
  const fullMask = (1 << m) - 1;
  for (let last = 0; last < m; last++) {
    if (dp[fullMask][last] >= INF) continue;
    const total = dp[fullMask][last] + getJarak(other[last], end);
    if (total < bestDist) {
      bestDist = total;
      bestLast = last;
    }
  }
  if (bestLast === -1) return null;
  const routeOther = [];
  let mask = fullMask,
    cur = bestLast;
  while (cur !== -1) {
    routeOther.unshift(other[cur]);
    const prev = parent[mask][cur];
    mask = mask ^ (1 << cur);
    cur = prev;
  }
  return [start, ...routeOther, end];
}

// ==================== PEMBAGIAN TRIP ====================
function splitIntoTrips(rute, beratPerKel, kapasitas) {
  if (!kapasitas || kapasitas <= 0) return [rute];

  const asal = rute[0];
  const akhir = rute[rute.length - 1];
  const midpoints = rute.slice(1, rute.length - 1);

  const trips = [];
  let currentTrip = [asal];
  let beratKum = 0;

  for (let i = 0; i < midpoints.length; i++) {
    const kel = midpoints[i];
    const berat =
      (beratPerKel[kel]?.organik || 0) + (beratPerKel[kel]?.anorganik || 0);

    if (berat > kapasitas) {
      console.warn(
        `⚠️ Berat ${kel} (${berat} kg) melebihi kapasitas truk ${kapasitas} kg!`,
      );
      if (currentTrip.length > 1) {
        currentTrip.push(akhir);
        trips.push(currentTrip);
        currentTrip = [asal];
        beratKum = 0;
      }
      currentTrip.push(kel);
      beratKum += berat;
      currentTrip.push(akhir);
      trips.push(currentTrip);
      currentTrip = [asal];
      beratKum = 0;
      continue;
    }

    if (beratKum + berat > kapasitas && currentTrip.length > 1) {
      currentTrip.push(akhir);
      trips.push(currentTrip);
      currentTrip = [asal];
      beratKum = 0;
    }

    currentTrip.push(kel);
    beratKum += berat;
  }

  if (currentTrip.length > 1) {
    currentTrip.push(akhir);
    trips.push(currentTrip);
  } else if (currentTrip.length === 1 && trips.length === 0) {
    currentTrip.push(akhir);
    trips.push(currentTrip);
  }

  return trips;
}

// ==================== RENDER UNTUK BANDING ====================
function renderSteps(containerId, rute, beratPerKel, isDP, kapasitas) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const h4 = container.querySelector("h4");
  container.innerHTML = "";
  if (h4) container.appendChild(h4);

  const kapVal = kapasitas || 1e9;
  const trips = splitIntoTrips(rute, beratPerKel, kapVal);
  const tripColor = isDP ? "#fff3e0" : "#e8f5e9";
  const tripBorderColor = isDP ? "#ff9800" : "#2e7d32";

  trips.forEach((trip, tripIdx) => {
    const tripHeader = document.createElement("div");
    tripHeader.style.cssText = `margin: ${tripIdx === 0 ? "0" : "18px"} 0 8px; padding: 7px 12px; background:${tripBorderColor}; color:white; border-radius:10px; font-size:0.85rem; font-weight:bold;`;
    const asal = trip[0];
    const akhir = trip[trip.length - 1];
    const beratTrip = trip
      .filter((k) => k !== asal && k !== akhir)
      .reduce(
        (s, k) =>
          s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
        0,
      );
    if (trips.length > 1) {
      tripHeader.innerHTML = `🚛 Trip ${tripIdx + 1} dari ${trips.length} &nbsp;|&nbsp; ${trip.length - 2} titik penjemputan &nbsp;|&nbsp; Muatan: ${beratTrip.toFixed(1)} kg`;
    } else {
      tripHeader.innerHTML = `🚛 Rute Penjemputan &nbsp;|&nbsp; ${trip.length - 2} titik &nbsp;|&nbsp; Total: ${beratTrip.toFixed(1)} kg`;
    }
    container.appendChild(tripHeader);

    const stops = trip.slice(1, trip.length - 1);
    let beratKum = 0;
    stops.forEach((kel, idx) => {
      const berat =
        (beratPerKel[kel]?.organik || 0) + (beratPerKel[kel]?.anorganik || 0);
      beratKum += berat;
      const jarakDariPrev =
        idx === 0 ? getJarak(asal, kel) : getJarak(stops[idx - 1], kel);
      const item = document.createElement("div");
      item.className = "step-item";
      item.innerHTML = `
        <span class="step-num">${idx + 1}</span>
        <div style="flex:1">
          <div>
            <strong>${kel}</strong> (${getKecamatan(kel)})
            <span style="float:right; color:#888; font-size:0.8rem;">+${jarakDariPrev} km dari ${idx === 0 ? asal : stops[idx - 1]}</span>
          </div>
          <div style="font-size:0.75rem; color:#666;">
            Jemput ${berat} kg &nbsp;|&nbsp; Kumulatif trip: <strong>${beratKum.toFixed(1)} kg</strong>
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    const tripJarak = hitungTotalJarak(trip);
    const tripWaktu = parseFloat((tripJarak * 3 + beratTrip).toFixed(1));
    const tripSummary = document.createElement("div");
    tripSummary.style.cssText = `margin-top:8px; padding:7px 10px; background:${tripColor}; border-radius:10px; font-size:0.82rem;`;
    tripSummary.innerHTML = `<strong>📊 Ringkasan ${trips.length > 1 ? "Trip " + (tripIdx + 1) : ""}:</strong> Jarak ${tripJarak} km | Tempuh ${(tripJarak * 3).toFixed(0)} mnt | Angkut ${beratTrip} mnt | <strong>Total: ${tripWaktu} mnt</strong>`;
    container.appendChild(tripSummary);
  });

  if (trips.length > 1) {
    const asal0 = rute[0];
    const akhir0 = rute[rute.length - 1];
    const totalBerat = rute
      .filter((k) => k !== asal0 && k !== akhir0)
      .reduce(
        (s, k) =>
          s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
        0,
      );
    const totalJarak = trips.reduce((s, t) => s + hitungTotalJarak(t), 0);
    const totalWaktu = parseFloat((totalJarak * 3 + totalBerat).toFixed(1));
    const grandSummary = document.createElement("div");
    grandSummary.style.cssText = `margin-top:14px; padding:9px 12px; background:${tripBorderColor}; color:white; border-radius:10px; font-size:0.85rem;`;
    grandSummary.innerHTML = `<strong>🏁 Total ${trips.length} Trip:</strong> Total jarak ${totalJarak.toFixed(2)} km | Total angkut ${totalBerat} kg | <strong>Total Waktu Keseluruhan: ${totalWaktu} mnt</strong>`;
    container.appendChild(grandSummary);
  }
}

function renderBeratTable(rute, beratPerKel, kapasitas, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const trips = splitIntoTrips(rute, beratPerKel, kapasitas);
  let html = "";

  trips.forEach((trip, tripIdx) => {
    const asalTrip = trip[0];
    const akhirTrip = trip[trip.length - 1];
    const muatanTrip = trip
      .filter((k) => k !== asalTrip && k !== akhirTrip)
      .reduce(
        (s, k) =>
          s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
        0,
      );
    if (trips.length > 1) {
      html += `<div style="margin:${tripIdx === 0 ? "0" : "16px"} 0 6px; padding:5px 12px; background:#2e7d32; color:white; border-radius:8px; font-size:0.83rem; font-weight:bold;">🚛 Trip ${tripIdx + 1} dari ${trips.length} &nbsp;|&nbsp; Muatan: ${muatanTrip.toFixed(1)} kg / ${kapasitas} kg</div>`;
    }
    html += `<table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:${trips.length > 1 ? "4px" : "0"};"><thead><tr style="background:#2e7d32;color:white;"><th>No</th><th>Kelurahan</th><th>Kec</th><th>Organik</th><th>Anorganik</th><th>Subtotal</th><th>Kumulatif (kg)</th><th>Waktu Angkut (mnt)</th></tr></thead><tbody>`;
    let kum = 0;
    let noUrut = 1;
    trip.forEach((kel, idx) => {
      const isAsalAkhir = idx === 0 || idx === trip.length - 1;
      const b = beratPerKel[kel] || { organik: 0, anorganik: 0 };
      const sub = isAsalAkhir ? 0 : b.organik + b.anorganik;
      if (!isAsalAkhir) kum += sub;
      const rowLabel = isAsalAkhir
        ? `<em style="color:#999">${kel} ${idx === 0 ? "(Asal)" : "(Akhir)"}</em>`
        : kel;
      const bgColor = isAsalAkhir
        ? "#e8f5e9"
        : idx % 2 === 0
          ? "#f9fbe7"
          : "white";
      html += `<tr style="background:${bgColor}"><td>${isAsalAkhir ? "-" : noUrut++}</td><td>${rowLabel}</td><td>${getKecamatan(kel)}</td><td style="text-align:center">${isAsalAkhir ? "-" : b.organik}</td><td style="text-align:center">${isAsalAkhir ? "-" : b.anorganik}</td><td style="text-align:center">${isAsalAkhir ? "-" : sub}</td><td style="text-align:center"><strong>${isAsalAkhir ? "-" : kum.toFixed(1)}</strong></td><td style="text-align:center">${isAsalAkhir ? "-" : kum.toFixed(1)}</td></tr>`;
    });
    html += `</tbody></table>`;
  });

  html += `<div class="section-note">* Waktu angkut = kumulatif berat (kg) karena 1 kg = 1 menit. Titik Asal/Akhir tidak dihitung sebagai penjemputan.</div>`;
  if (trips.length > 1) {
    const asal0 = rute[0];
    const akhir0 = rute[rute.length - 1];
    const totalBerat = rute
      .filter((k) => k !== asal0 && k !== akhir0)
      .reduce(
        (s, k) =>
          s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
        0,
      );
    html += `<div style="margin-top:8px; padding:7px 12px; background:#fff3e0; border-left:4px solid #ff9800; border-radius:0 8px 8px 0; font-size:0.85rem;"><strong>⚠️ Total ${trips.length} trip diperlukan</strong> — Total sampah ${totalBerat.toFixed(1)} kg melebihi kapasitas ${kapasitas} kg per trip.</div>`;
  }
  el.innerHTML = html;
}

function gambarRute(petaId, rute, warna) {
  const mapContainer = document.getElementById(petaId);
  if (!mapContainer) return;

  // Hapus map lama jika ada
  if (mapContainer._leaflet_id) {
    const oldMap = mapContainer._leaflet_id;
    if (window._leaflet_maps && window._leaflet_maps[oldMap]) {
      window._leaflet_maps[oldMap].remove();
    }
  }

  // Tunggu container visible sebelum render peta
  setTimeout(() => {
    if (!mapContainer || mapContainer.offsetWidth === 0) return;

    const map = L.map(petaId).setView(koordinatKelurahan[rute[0]], 13);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OSM & CartoDB" },
    ).addTo(map);
    const latlngs = rute.map((t) => koordinatKelurahan[t]);
    L.polyline(latlngs, { color: warna, weight: 4 }).addTo(map);
    rute.forEach((titik, idx) => {
      if (idx === 0) {
        L.marker(koordinatKelurahan[titik], {
          icon: L.divIcon({
            html: `<div style="background:#2e7d32;color:white;padding:2px 8px;border-radius:12px;">START</div>`,
            iconAnchor: [0, 0],
          }),
        }).addTo(map);
      } else if (idx === rute.length - 1) {
        L.marker(koordinatKelurahan[titik], {
          icon: L.divIcon({
            html: `<div style="background:#e65100;color:white;padding:2px 8px;border-radius:12px;">END</div>`,
            iconAnchor: [0, 0],
          }),
        }).addTo(map);
      } else {
        L.circleMarker(koordinatKelurahan[titik], {
          radius: 5,
          fillColor: warna,
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        })
          .bindPopup(titik)
          .addTo(map);
      }
    });
    map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });

    // Invalidate size setelah render
    setTimeout(() => map.invalidateSize(), 100);
  }, 100);
}

// ==================== INDEX.HTML LOGIC ====================
if (
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  (!window.location.pathname.includes("banding.html") &&
    !window.location.pathname.includes("banding"))
) {
  document.addEventListener("DOMContentLoaded", () => {
    const asalSelect = document.getElementById("daerahAsal");
    const akhirSelect = document.getElementById("daerahAkhir");
    const checkboxesDiv = document.getElementById("kelurahanCheckboxes");
    const customPanel = document.getElementById("kelurahanCustomPanel");
    const radioAll = document.querySelector('input[value="all"]');
    const radioCustom = document.querySelector('input[value="custom"]');
    const tbody = document.getElementById("beratTbody");

    let semuaDataBerat = {};
    SEMUA_TITIK.forEach((kel) => {
      semuaDataBerat[kel] = { ...defaultBeratKelurahan[kel] };
    });

    function getSelectedKelurahan() {
      return Array.from(
        document.querySelectorAll("#kelurahanCheckboxes input:checked"),
      ).map((cb) => cb.value);
    }

    function updateTotalFromDOM() {
      let totOrg = 0,
        totAnorg = 0;
      document.querySelectorAll("#beratTbody tr").forEach((row) => {
        const orgInput = row.querySelector('input[data-jenis="org"]');
        const anorgInput = row.querySelector('input[data-jenis="anorg"]');
        if (orgInput && anorgInput) {
          totOrg += parseFloat(orgInput.value) || 0;
          totAnorg += parseFloat(anorgInput.value) || 0;
        }
      });
      document.getElementById("totalOrganik").innerText = totOrg.toFixed(1);
      document.getElementById("totalAnorganik").innerText = totAnorg.toFixed(1);
      const total = totOrg + totAnorg;
      document.getElementById("totalSemua").innerText = total.toFixed(1);
      const kapasitas =
        parseFloat(document.getElementById("kapasitasTruk").value) || 100;
      const statusDiv = document.getElementById("statusKapasitas");
      statusDiv.style.display = "block";
      if (total > kapasitas) {
        statusDiv.style.background = "#fff3e0";
        statusDiv.style.color = "#e65100";
        statusDiv.innerHTML = `⚠️ Total sampah ${total.toFixed(1)} kg melebihi kapasitas truk ${kapasitas} kg. Perlu ${Math.ceil(total / kapasitas)} trip.`;
      } else {
        statusDiv.style.background = "#e8f5e9";
        statusDiv.style.color = "#1b5e20";
        statusDiv.innerHTML = `✅ Total sampah ${total.toFixed(1)} kg muat dalam 1 trip (kapasitas ${kapasitas} kg).`;
      }
      return total;
    }

    function onBeratInput(e) {
      const kel = e.target.getAttribute("data-kel");
      const jenis = e.target.getAttribute("data-jenis");
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      if (!semuaDataBerat[kel])
        semuaDataBerat[kel] = { organik: 0, anorganik: 0 };
      semuaDataBerat[kel][jenis] = val;
      const safeId = kel.replace(/\s+/g, "_");
      const org =
        parseFloat(document.getElementById(`org_${safeId}`)?.value) || 0;
      const anorg =
        parseFloat(document.getElementById(`anorg_${safeId}`)?.value) || 0;
      const subEl = document.getElementById(`sub_${safeId}`);
      if (subEl) subEl.innerText = (org + anorg).toFixed(1);
      updateTotalFromDOM();
    }

    function renderBeratTableByKelurahan(selectedKel) {
      tbody.innerHTML = "";
      selectedKel.forEach((kel) => {
        const d = semuaDataBerat[kel];
        const safeId = kel.replace(/\s+/g, "_");
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${kel} (${getKecamatan(kel)})</td>
          <td><input type="number" id="org_${safeId}" value="${d.organik}" min="0" step="1" class="berat-input" data-kel="${kel}" data-jenis="org" style="width:90px;"> kg</td>
          <td><input type="number" id="anorg_${safeId}" value="${d.anorganik}" min="0" step="1" class="berat-input" data-kel="${kel}" data-jenis="anorg" style="width:90px;"> kg</td>
          <td id="sub_${safeId}" style="font-weight:bold;">${d.organik + d.anorganik}</td>
        `;
        tbody.appendChild(tr);
      });
      document.querySelectorAll(".berat-input").forEach((inp) => {
        inp.removeEventListener("input", onBeratInput);
        inp.addEventListener("input", onBeratInput);
        inp.removeEventListener("change", onBeratInput);
        inp.addEventListener("change", onBeratInput);
      });
      updateTotalFromDOM();
    }

    function onCheckboxChange() {
      if (radioCustom.checked) {
        const selected = getSelectedKelurahan();
        if (selected.length === 0) return;
        renderBeratTableByKelurahan(selected);
      } else {
        renderBeratTableByKelurahan(SEMUA_TITIK);
      }
    }

    SEMUA_TITIK.forEach((kel) => {
      asalSelect.appendChild(new Option(`${kel} (${getKecamatan(kel)})`, kel));
      akhirSelect.appendChild(new Option(`${kel} (${getKecamatan(kel)})`, kel));
    });
    asalSelect.value = "Nagarasari";
    akhirSelect.value = "Karsamenak";

    for (const [kec, list] of Object.entries(KELURAHAN_PER_KEC)) {
      const kecDiv = document.createElement("div");
      kecDiv.style.gridColumn = "1/-1";
      kecDiv.style.fontWeight = "bold";
      kecDiv.style.marginTop = "8px";
      kecDiv.textContent = `📍 ${kec}`;
      checkboxesDiv.appendChild(kecDiv);
      list.forEach((kel) => {
        const label = document.createElement("label");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = kel;
        cb.checked = true;
        label.appendChild(cb);
        label.appendChild(document.createTextNode(kel));
        checkboxesDiv.appendChild(label);
      });
    }

    function toggleCustomPanel() {
      customPanel.style.display = radioCustom.checked ? "block" : "none";
      onCheckboxChange();
    }
    radioAll.addEventListener("change", toggleCustomPanel);
    radioCustom.addEventListener("change", toggleCustomPanel);
    toggleCustomPanel();

    document.getElementById("selectAllBtn").addEventListener("click", () => {
      document
        .querySelectorAll("#kelurahanCheckboxes input")
        .forEach((cb) => (cb.checked = true));
      onCheckboxChange();
    });
    document.getElementById("deselectAllBtn").addEventListener("click", () => {
      document
        .querySelectorAll("#kelurahanCheckboxes input")
        .forEach((cb) => (cb.checked = false));
      onCheckboxChange();
    });

    function attachCheckboxListeners() {
      document.querySelectorAll("#kelurahanCheckboxes input").forEach((cb) => {
        cb.removeEventListener("change", onCheckboxChange);
        cb.addEventListener("change", onCheckboxChange);
      });
    }
    attachCheckboxListeners();

    function syncDropdowns() {
      const asal = asalSelect.value;
      Array.from(akhirSelect.options).forEach(
        (opt) => (opt.disabled = opt.value === asal),
      );
      if (akhirSelect.value === asal) {
        const avail = Array.from(akhirSelect.options).find((o) => !o.disabled);
        if (avail) akhirSelect.value = avail.value;
      }
      document.getElementById("warningAkhir").style.display =
        akhirSelect.value === asal ? "block" : "none";
    }
    asalSelect.addEventListener("change", syncDropdowns);
    akhirSelect.addEventListener("change", () => {
      document.getElementById("warningAkhir").style.display =
        akhirSelect.value === asalSelect.value ? "block" : "none";
    });
    syncDropdowns();

    document
      .getElementById("kapasitasTruk")
      .addEventListener("input", updateTotalFromDOM);

    // ============ FUNGSI LOAD & RESET ============
    function resetAllData() {
      SEMUA_TITIK.forEach((kel) => {
        semuaDataBerat[kel] = { ...defaultBeratKelurahan[kel] };
      });
      asalSelect.value = "Nagarasari";
      akhirSelect.value = "Karsamenak";
      document.getElementById("kapasitasTruk").value = "100";
      radioAll.checked = true;
      toggleCustomPanel();
      document.querySelectorAll("#kelurahanCheckboxes input").forEach((cb) => {
        cb.checked = true;
      });
      renderBeratTableByKelurahan(SEMUA_TITIK);
      updateTotalFromDOM();
      syncDropdowns();
      localStorage.removeItem("dataSampah");
      const infoDiv = document.getElementById("infoHasil");
      infoDiv.style.display = "none";
      alert("✅ Data telah direset ke nilai default!");
    }

    function loadSavedData() {
      const saved = localStorage.getItem("dataSampah");
      if (!saved) return false;
      try {
        const data = JSON.parse(saved);
        const { asal, akhir, kapasitas, beratPerKel, selectedKelurahan } = data;
        if (asalSelect.querySelector(`option[value="${asal}"]`)) {
          asalSelect.value = asal;
        }
        if (akhirSelect.querySelector(`option[value="${akhir}"]`)) {
          akhirSelect.value = akhir;
        }
        document.getElementById("kapasitasTruk").value = kapasitas || 100;
        SEMUA_TITIK.forEach((kel) => {
          if (beratPerKel[kel]) {
            semuaDataBerat[kel] = { ...beratPerKel[kel] };
          }
        });
        if (
          selectedKelurahan &&
          selectedKelurahan.length < SEMUA_TITIK.length
        ) {
          radioCustom.checked = true;
          toggleCustomPanel();
          document
            .querySelectorAll("#kelurahanCheckboxes input")
            .forEach((cb) => {
              cb.checked = selectedKelurahan.includes(cb.value);
            });
          renderBeratTableByKelurahan(selectedKelurahan);
        } else {
          radioAll.checked = true;
          toggleCustomPanel();
          renderBeratTableByKelurahan(SEMUA_TITIK);
        }
        updateTotalFromDOM();
        syncDropdowns();
        return true;
      } catch (e) {
        console.error("Gagal load data:", e);
        return false;
      }
    }

    function addResetButton() {
      const simpanBtn = document.getElementById("simpanBtn");
      if (simpanBtn && !document.getElementById("resetBtn")) {
        const resetBtn = document.createElement("button");
        resetBtn.id = "resetBtn";
        resetBtn.innerHTML = "🔄 Reset Semua Data";
        resetBtn.style.background = "#c62828";
        resetBtn.style.marginLeft = "10px";
        resetBtn.onclick = resetAllData;
        simpanBtn.parentNode.insertBefore(resetBtn, simpanBtn.nextSibling);
      }
    }

    // Render awal
    renderBeratTableByKelurahan(SEMUA_TITIK);

    // Load data tersimpan
    const loaded = loadSavedData();
    if (loaded) {
      const infoDiv = document.getElementById("infoHasil");
      infoDiv.innerHTML = `📂 Data sebelumnya dimuat. Klik "Simpan & Hitung Rute" untuk memperbarui.`;
      infoDiv.style.display = "block";
      infoDiv.style.background = "#e3f2fd";
      infoDiv.style.color = "#1565c0";
    }

    addResetButton();

    // SIMPAN DATA
    document.getElementById("simpanBtn").addEventListener("click", () => {
      const asal = asalSelect.value;
      const akhir = akhirSelect.value;
      if (asal === akhir) {
        alert("Titik awal dan akhir tidak boleh sama!");
        return;
      }
      const mode = document.querySelector(
        'input[name="routeMode"]:checked',
      ).value;
      let selectedKel = [];
      if (mode === "all") {
        selectedKel = [...SEMUA_TITIK];
      } else {
        selectedKel = getSelectedKelurahan();
        if (selectedKel.length < 2) {
          alert("Pilih minimal 2 kelurahan untuk rute kustom!");
          return;
        }
        if (!selectedKel.includes(asal) || !selectedKel.includes(akhir)) {
          alert("Titik awal dan akhir harus termasuk dalam pilihan kelurahan!");
          return;
        }
      }

      document.querySelectorAll("#beratTbody tr").forEach((row) => {
        const kelCell = row.cells[0];
        if (!kelCell) return;
        const kelName = kelCell.innerText.split(" (")[0];
        const orgInput = row.querySelector('input[data-jenis="org"]');
        const anorgInput = row.querySelector('input[data-jenis="anorg"]');
        if (orgInput && anorgInput) {
          const org = parseFloat(orgInput.value) || 0;
          const anorg = parseFloat(anorgInput.value) || 0;
          if (!semuaDataBerat[kelName])
            semuaDataBerat[kelName] = { organik: 0, anorganik: 0 };
          semuaDataBerat[kelName].organik = org;
          semuaDataBerat[kelName].anorganik = anorg;
        }
      });

      const beratPerKel = {};
      SEMUA_TITIK.forEach((kel) => {
        beratPerKel[kel] = { ...semuaDataBerat[kel] };
      });

      const kapasitas =
        parseFloat(document.getElementById("kapasitasTruk").value) || 100;
      const dataToSave = {
        asal,
        akhir,
        kapasitas,
        beratPerKel,
        selectedKelurahan: selectedKel,
      };
      localStorage.setItem("dataSampah", JSON.stringify(dataToSave));

      const totalSemua = selectedKel.reduce(
        (s, k) => s + beratPerKel[k].organik + beratPerKel[k].anorganik,
        0,
      );
      const infoDiv = document.getElementById("infoHasil");
      infoDiv.innerHTML = `✅ Data tersimpan! Rute: ${asal} → ... → ${akhir}. Total sampah yang akan dijemput: ${totalSemua.toFixed(1)} kg. ${totalSemua > kapasitas ? `⚠️ Perlu ${Math.ceil(totalSemua / kapasitas)} trip.` : "✔️ Cukup 1 trip."}`;
      infoDiv.style.display = "block";
    });
  });
}

// ==================== BANDING.HTML LOGIC ====================
if (
  window.location.pathname.includes("banding.html") ||
  window.location.pathname.includes("banding")
) {
  document.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem("dataSampah"));
    if (!data) {
      alert("Belum ada data. Silakan simpan data dari halaman utama.");
      window.location.href = "index.html";
      return;
    }
    const { asal, akhir, kapasitas, beratPerKel, selectedKelurahan } = data;
    let nodes = selectedKelurahan || SEMUA_TITIK;
    if (!nodes.includes(asal) || !nodes.includes(akhir)) {
      alert(
        "Titik awal/akhir tidak ada dalam pilihan kelurahan. Menggunakan semua titik.",
      );
      nodes = [...SEMUA_TITIK];
    }

    const totalBeratNodes = nodes.reduce(
      (s, k) =>
        s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
      0,
    );
    const jumlahTrip = Math.ceil(totalBeratNodes / kapasitas);
    const tripInfo =
      totalBeratNodes > kapasitas
        ? ` | ⚠️ Total sampah ${totalBeratNodes.toFixed(1)} kg → <strong>${jumlahTrip} trip</strong>`
        : ` | ✅ Cukup 1 trip`;
    document.getElementById("infoRute").innerHTML =
      `Titik Awal: <strong>${asal}</strong> (${getKecamatan(asal)}) → Akhir: <strong>${akhir}</strong> (${getKecamatan(akhir)}) | Kapasitas: ${kapasitas} kg | Jumlah titik: ${nodes.length}${tripInfo}`;

    const ruteGreedy = greedyOpenPath(asal, akhir, nodes);
    const tripsGreedyArr = splitIntoTrips(ruteGreedy, beratPerKel, kapasitas);
    const jarakGreedy = hitungTotalJarak(ruteGreedy);
    const jarakTotalTripsGreedy = parseFloat(
      tripsGreedyArr.reduce((s, t) => s + hitungTotalJarak(t), 0).toFixed(2),
    );
    const waktuTempuhGreedy = parseFloat(
      (jarakTotalTripsGreedy * 3).toFixed(1),
    );
    const totalBeratGreedy = ruteGreedy
      .filter((k) => k !== asal && k !== akhir)
      .reduce(
        (s, k) =>
          s + (beratPerKel[k]?.organik || 0) + (beratPerKel[k]?.anorganik || 0),
        0,
      );
    const waktuAngkutGreedy = totalBeratGreedy;
    const totalWaktuGreedy = parseFloat(
      (waktuTempuhGreedy + waktuAngkutGreedy).toFixed(1),
    );

    document.getElementById("ruteGreedy").innerHTML = ruteGreedy
      .map((k) => `${k} (${getKecamatan(k)})`)
      .join(" → ");
    document.getElementById("jarakGreedy").innerText =
      jarakTotalTripsGreedy.toFixed(2);
    document.getElementById("waktuGreedy").innerText =
      waktuTempuhGreedy.toFixed(1);
    document.getElementById("angkutGreedy").innerText = waktuAngkutGreedy;
    document.getElementById("statJarakGreedy").innerText =
      jarakTotalTripsGreedy.toFixed(1);
    document.getElementById("statWaktuGreedy").innerText =
      waktuTempuhGreedy.toFixed(1);
    document.getElementById("statAngkutGreedy").innerText = waktuAngkutGreedy;
    document.getElementById("statTotalWaktuGreedy").innerText =
      totalWaktuGreedy.toFixed(1);

    let ruteDP = null;
    let jarakTotalTripsDP = 0;
    let waktuTempuhDP = 0;
    let waktuAngkutDP = 0;
    let totalWaktuDP = 0;
    let dpError = false;

    if (nodes.length <= 12) {
      ruteDP = dpOpenPath(asal, akhir, nodes);
      if (ruteDP && ruteDP.length === nodes.length) {
        const tripsDPArr = splitIntoTrips(ruteDP, beratPerKel, kapasitas);
        jarakTotalTripsDP = parseFloat(
          tripsDPArr.reduce((s, t) => s + hitungTotalJarak(t), 0).toFixed(2),
        );
        waktuTempuhDP = parseFloat((jarakTotalTripsDP * 3).toFixed(1));
        const totalBeratDP = ruteDP
          .filter((k) => k !== asal && k !== akhir)
          .reduce(
            (s, k) =>
              s +
              (beratPerKel[k]?.organik || 0) +
              (beratPerKel[k]?.anorganik || 0),
            0,
          );
        waktuAngkutDP = totalBeratDP;
        totalWaktuDP = parseFloat((waktuTempuhDP + waktuAngkutDP).toFixed(1));
      } else dpError = true;
    } else dpError = true;

    if (dpError || !ruteDP) {
      document.getElementById("ruteDP").innerHTML =
        "⚠️ DP tidak dapat dijalankan (jumlah titik > 12 atau error). Gunakan Greedy saja.";
      document.getElementById("jarakDP").innerText = "-";
      document.getElementById("waktuDP").innerText = "-";
      document.getElementById("angkutDP").innerText = "-";
      document.getElementById("statJarakDP").innerText = "-";
      document.getElementById("statWaktuDP").innerText = "-";
      document.getElementById("statAngkutDP").innerText = "-";
      document.getElementById("statTotalWaktuDP").innerText = "-";
      document.getElementById("kesimpulan").innerHTML =
        "DP tidak dijalankan karena terlalu banyak titik (max 12) atau error komputasi. Perbandingan hanya menampilkan Greedy.";
      gambarRute("mapGreedy", ruteGreedy, "#4caf50");
      document.getElementById("mapDP").parentElement.style.opacity = "0.5";
      document.getElementById("mapDP").innerHTML =
        "<div style='text-align:center;padding:50px;'>DP tidak tersedia</div>";
      document.getElementById("beratDP").innerHTML = "<p>DP tidak tersedia</p>";
      document.getElementById("stepDP").innerHTML = "<p>DP tidak tersedia</p>";
    } else {
      document.getElementById("ruteDP").innerHTML = ruteDP
        .map((k) => `${k} (${getKecamatan(k)})`)
        .join(" → ");
      document.getElementById("jarakDP").innerText =
        jarakTotalTripsDP.toFixed(2);
      document.getElementById("waktuDP").innerText = waktuTempuhDP.toFixed(1);
      document.getElementById("angkutDP").innerText = waktuAngkutDP;
      document.getElementById("statJarakDP").innerText =
        jarakTotalTripsDP.toFixed(1);
      document.getElementById("statWaktuDP").innerText =
        waktuTempuhDP.toFixed(1);
      document.getElementById("statAngkutDP").innerText = waktuAngkutDP;
      document.getElementById("statTotalWaktuDP").innerText =
        totalWaktuDP.toFixed(1);

      const selisih = Math.abs(
        jarakTotalTripsDP - jarakTotalTripsGreedy,
      ).toFixed(2);
      let kes =
        jarakTotalTripsDP < jarakTotalTripsGreedy
          ? `🎉 DP lebih optimal, hemat ${selisih} km (${(selisih * 3).toFixed(1)} menit tempuh).`
          : jarakTotalTripsDP > jarakTotalTripsGreedy
            ? `⚡ Greedy lebih baik ${selisih} km.`
            : `✨ Jarak sama.`;
      kes += ` Total waktu (tempuh+angkut): Greedy ${totalWaktuGreedy} menit, DP ${totalWaktuDP} menit.`;
      if (totalBeratNodes > kapasitas) {
        const tripsGreedy = splitIntoTrips(
          ruteGreedy,
          beratPerKel,
          kapasitas,
        ).length;
        const tripsDP = splitIntoTrips(ruteDP, beratPerKel, kapasitas).length;
        kes += ` | ⚠️ Pembagian Trip — Greedy: <strong>${tripsGreedy} trip</strong>, DP: <strong>${tripsDP} trip</strong> (kapasitas ${kapasitas} kg/trip).`;
      }
      document.getElementById("kesimpulan").innerHTML = kes;
      gambarRute("mapGreedy", ruteGreedy, "#4caf50");
      gambarRute("mapDP", ruteDP, "#ff9800");
      renderBeratTable(ruteDP, beratPerKel, kapasitas, "beratDP");
      renderSteps("stepDP", ruteDP, beratPerKel, true, kapasitas);
    }

    renderBeratTable(ruteGreedy, beratPerKel, kapasitas, "beratGreedy");
    renderSteps("stepGreedy", ruteGreedy, beratPerKel, false, kapasitas);

    const matrixContainer = document.getElementById("matrixContainer");
    if (matrixContainer && nodes.length <= 20) {
      let matrixHtml = `<table class="dist-table"><thead><tr><th>Kelurahan</th>${nodes.map((n) => `<th>${n}</th>`).join("")}</tr></thead><tbody>`;
      nodes.forEach((row) => {
        matrixHtml += `<tr><td><strong>${row}</strong></td>`;
        nodes.forEach((col) => {
          matrixHtml +=
            row === col
              ? `<td class="diag">-</td>`
              : `<td>${getJarak(row, col)}</td>`;
        });
        matrixHtml += `</tr>`;
      });
      matrixHtml += `</tbody></table>`;
      matrixContainer.innerHTML = matrixHtml;
    } else if (matrixContainer) {
      matrixContainer.innerHTML = `<p class="section-note">Matriks jarak terlalu besar untuk ditampilkan (${nodes.length} titik).</p>`;
    }

    // Chart rendering dengan pengecekan
    const ctxJarak = document.getElementById("jarakChart")?.getContext("2d");
    const ctxWaktu = document.getElementById("waktuChart")?.getContext("2d");

    if (ctxJarak && typeof Chart !== "undefined") {
      new Chart(ctxJarak, {
        type: "bar",
        data: {
          labels: ["Greedy", "DP"],
          datasets: [
            {
              label: "Jarak (km)",
              data: [jarakTotalTripsGreedy, dpError ? 0 : jarakTotalTripsDP],
              backgroundColor: ["#4caf50", "#ff9800"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { title: { display: true, text: "Jarak (km)" } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    if (ctxWaktu && typeof Chart !== "undefined") {
      new Chart(ctxWaktu, {
        type: "bar",
        data: {
          labels: ["Greedy", "DP"],
          datasets: [
            {
              label: "Total Waktu (menit)",
              data: [totalWaktuGreedy, dpError ? 0 : totalWaktuDP],
              backgroundColor: ["#4caf50", "#ff9800"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { title: { display: true, text: "Total Waktu (menit)" } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  });
}
