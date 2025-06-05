function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const pi1 = toRad(lat1);
  const pi2 = toRad(lat2);
  const deltaPi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lat2 - lat1);

  const a =
    Math.sin(deltaPi / 2) ** 2 +
    Math.cos(pi1) * Math.cos(pi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const startLat = -6.972923058906918;
const startLng = 107.58253642358297;
const map = L.map("map").setView([startLat, startLng], 16);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const marker = L.marker([startLat, startLng]).addTo(map);
let coords = [[startLat, startLng]];
let totalDistance = 0;
const polyline = L.polyline(coords, {
  color: "blue",
  weight: 4,
  opacity: 0.8,
}).addTo(map);

const ws = new WebSocket("ws://localhost:3001");

ws.onmessage = (event) => {
  const { lat, lng } = JSON.parse(event.data);
  const [lastLat, lastLng] = coords[coords.length - 1];
  const distance = getDistance(lastLat, lastLng, lat, lng);
  totalDistance += distance;
  document.getElementById("distance").textContent = (
    totalDistance / 1000
  ).toFixed(2);

  marker.setLatLng([lat, lng]);
  coords.push([lat, lng]);
  polyline.setLatLngs(coords);
  map.panTo([lat, lng]);
};
