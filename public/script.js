const WS_URL = "wss://776c-140-0-77-38.ngrok-free.app";
let map, marker, polyline;
let coords = [];
let totalDistance = 0;

// Haversine formula untuk menghitung jarak (dalam meter) di permukaan bumi
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // radius bumi (meter)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Inisiasi koneksi WebSocket
const ws = new WebSocket(WS_URL);
ws.onopen = () => {
  console.log("WebSocket connected to ", WS_URL);
  startGeolocation();
};
ws.onmessage = (event) => {
  // Saat menerima data dari server (broadcast), parse dan update peta
  try {
    const { lat, lng } = JSON.parse(event.data);
    updateMap(lat, lng);
  } catch (e) {
    console.warn("Invalid message:", event.data);
  }
};
ws.onclose = () => {
  console.log("WebSocket disconnected");
  alert("Koneksi WebSocket terputus");
};

// 2) Fungsi untuk mulai watch posisi GPS
function startGeolocation() {
  if (!("geolocation" in navigator)) {
    alert("Browser mu tidak mendukung Geolocation");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // Kirim posisi ke server via WebSocket
      const payload = JSON.stringify({ lat, lng });
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
      // Update peta di lokal juga
      updateMap(lat, lng);
    },
    (err) => {
      console.error("Gagal mengambil lokasi:", err.message);
      alert("Gagal mengambil lokasi: " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    }
  );
}

// 3) Fungsi untuk update marker + polyline + jarak
function updateMap(lat, lng) {
  const newPos = [lat, lng];

  if (!map) {
    // Inisialisasi Leaflet map
    map = L.map("map").setView(newPos, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Buat marker & polyline awal
    marker = L.marker(newPos).addTo(map);
    coords.push(newPos);
    polyline = L.polyline(coords, {
      color: "blue",
      weight: 4,
      opacity: 0.7,
    }).addTo(map);
    return;
  }

  // Hitung jarak ke titik terakhir
  const [lastLat, lastLng] = coords[coords.length - 1];
  const dist = getDistance(lastLat, lastLng, lat, lng);
  const min_dist = 0.5;
  if (dist > min_dist) {
    totalDistance += dist;

    // Update teks jarak tempuh (dalam km)
    document.getElementById("distance").textContent = totalDistance;

    // Tambah titik baru ke path & update polyline
    coords.push(newPos);
    polyline.setLatLngs(coords);

    // Pindahkan marker & geser peta
    marker.setLatLng(newPos);
    map.panTo(newPos);
  }
}
