// =====================================================================
//  TAMAN MARGASATWA RAGUNAN - MESIN NAVIGASI HYBRID PEJALAN KAKI
//  (OSRM Pedestrian Foot Engine + Offline Dijkstra Fallback)
// =====================================================================

import { RAGUNAN_ROAD_NODES, RAGUNAN_ROAD_EDGES } from '../data/ragunan-data.js';

// Utilitas Jarak Haversine (meter)
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Utilitas Menghitung Sudut Bearing (0 - 360 derajat)
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Mencari Node Jalur Terdekat dari Koordinat [lat, lng]
export function findNearestNode(coords) {
  let closestNodeId = null;
  let minDistance = Infinity;

  for (const [nodeId, node] of Object.entries(RAGUNAN_ROAD_NODES)) {
    const dist = haversineDistanceMeters(coords[0], coords[1], node.coords[0], node.coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestNodeId = nodeId;
    }
  }

  return closestNodeId ? RAGUNAN_ROAD_NODES[closestNodeId] : null;
}

// =====================================================================
// 1. OSRM PEDESTRIAN ROUTING ENGINE (OPENSTREETMAP FOOTWAYS)
// =====================================================================
async function fetchOsrmPedestrianRoute(startCoords, targetCoords) {
  const lon1 = startCoords[1];
  const lat1 = startCoords[0];
  const lon2 = targetCoords[1];
  const lat2 = targetCoords[0];

  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson&steps=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 detik timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM no route found');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Konversi koordinat GeoJSON [lon, lat] ke Leaflet [lat, lon]
    const coordinates = route.geometry.coordinates.map(pt => [pt[1], pt[0]]);

    // Parse langkah-langkah manuver pejalan kaki
    const steps = parseOsrmPedestrianSteps(leg.steps, targetCoords);

    const totalDistance = Math.round(route.distance);
    const durationMinutes = Math.max(1, Math.round(route.duration / 60));
    const caloriesKcal = Math.max(3, Math.round(totalDistance * 0.048));

    return {
      source: 'osrm_pedestrian',
      sourceLabel: 'Jalur Pejalan Kaki OSM',
      coordinates: coordinates,
      totalDistance: totalDistance,
      durationMinutes: durationMinutes,
      caloriesKcal: caloriesKcal,
      canopyPercentage: 94,
      steps: steps
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('OSRM pedestrian route fetch failed, falling back to internal Dijkstra:', err);
    return null;
  }
}

// Penerjemah Manuver Langkah Pejalan Kaki ke Bahasa Indonesia
function parseOsrmPedestrianSteps(osrmSteps, targetCoords) {
  const steps = [];

  osrmSteps.forEach((s, idx) => {
    const mType = s.maneuver.type;
    const modifier = s.maneuver.modifier || '';
    const dist = Math.round(s.distance);
    const rawName = s.name ? s.name.trim() : '';
    const roadName = rawName || 'Jalur Khusus Pejalan Kaki Ragunan';
    const coords = [s.maneuver.location[1], s.maneuver.location[0]];

    let instruction = 'Lurus di jalur pejalan kaki';
    let maneuver = 'straight';

    if (mType === 'depart') {
      instruction = `Mulai berjalan di ${roadName}`;
      maneuver = 'straight';
    } else if (mType === 'arrive') {
      instruction = 'Tiba di tujuan destinasi Anda';
      maneuver = 'pin_drop';
    } else if (mType === 'turn') {
      if (modifier.includes('right')) {
        instruction = modifier.includes('slight') 
          ? `Serong kanan ikuti ${roadName}` 
          : `Belok kanan ke ${roadName}`;
        maneuver = 'turn_right';
      } else if (modifier.includes('left')) {
        instruction = modifier.includes('slight') 
          ? `Serong kiri ikuti ${roadName}` 
          : `Belok kiri ke ${roadName}`;
        maneuver = 'turn_left';
      } else if (modifier.includes('uturn')) {
        instruction = 'Putar balik di jalan setapak';
        maneuver = 'u_turn_right';
      } else {
        instruction = `Lurus di ${roadName}`;
        maneuver = 'straight';
      }
    } else if (mType === 'fork') {
      if (modifier.includes('right')) {
        instruction = 'Ambil percabangan kanan jalan setapak';
        maneuver = 'turn_right';
      } else {
        instruction = 'Ambil percabangan kiri jalan setapak';
        maneuver = 'turn_left';
      }
    } else if (mType === 'end of road') {
      instruction = modifier.includes('right')
        ? 'Di ujung jalan, belok kanan'
        : 'Di ujung jalan, belok kiri';
      maneuver = modifier.includes('right') ? 'turn_right' : 'turn_left';
    } else {
      instruction = `Lurus sejauh ${dist}m di ${roadName}`;
      maneuver = 'straight';
    }

    steps.push({
      instruction: instruction,
      subtext: `Jalur pedestrian rindang (${dist}m)`,
      maneuver: maneuver,
      roadName: roadName,
      distance: dist,
      coords: coords
    });
  });

  // Pastikan langkah terakhir adalah tiba di tujuan
  if (steps.length > 0 && steps[steps.length - 1].maneuver !== 'pin_drop') {
    steps.push({
      instruction: 'Tiba di tujuan destinasi Anda',
      subtext: 'Anda telah sampai di lokasi',
      maneuver: 'pin_drop',
      roadName: 'Destinasi Ragunan',
      distance: 10,
      coords: targetCoords
    });
  }

  return steps;
}

// =====================================================================
// 2. EMBEDDED DIJKSTRA ROUTING (OFFLINE FALLBACK ENGINE)
// =====================================================================
function buildAdjacencyList(mode = 'shaded') {
  const graph = {};

  for (const nodeId of Object.keys(RAGUNAN_ROAD_NODES)) {
    graph[nodeId] = [];
  }

  for (const edge of RAGUNAN_ROAD_EDGES) {
    let weight = edge.distance;

    if (mode === 'shaded') {
      const canopyFactor = Math.max(0.2, edge.canopy || 0.85);
      weight = edge.distance * (1.5 - canopyFactor * 0.8);
    }

    if (graph[edge.from]) {
      graph[edge.from].push({
        to: edge.to,
        weight: weight,
        distance: edge.distance,
        roadName: edge.roadName,
        canopy: edge.canopy || 0.85
      });
    }

    if (graph[edge.to]) {
      graph[edge.to].push({
        to: edge.from,
        weight: weight,
        distance: edge.distance,
        roadName: edge.roadName,
        canopy: edge.canopy || 0.85
      });
    }
  }

  return graph;
}

function calculateDijkstraRoute(startCoords, targetCoords, mode = 'shaded') {
  const startNode = findNearestNode(startCoords);
  const targetNode = findNearestNode(targetCoords);

  if (!startNode || !targetNode) {
    return null;
  }

  if (startNode.id === targetNode.id) {
    return {
      source: 'internal_dijkstra',
      sourceLabel: 'Jalur Pejalan Kaki Ragunan (Offline)',
      nodes: [startNode],
      coordinates: [startCoords, startNode.coords, targetCoords],
      totalDistance: Math.max(20, haversineDistanceMeters(startCoords[0], startCoords[1], targetCoords[0], targetCoords[1])),
      durationMinutes: 1,
      caloriesKcal: 2,
      canopyPercentage: 90,
      steps: [
        {
          instruction: 'Tiba di lokasi destinasi pejalan kaki',
          subtext: 'Area sangat dekat',
          maneuver: 'pin_drop',
          roadName: startNode.name,
          distance: 20,
          coords: targetCoords
        }
      ]
    };
  }

  const graph = buildAdjacencyList(mode);
  const distances = {};
  const previous = {};
  const previousEdge = {};
  const unvisited = new Set(Object.keys(RAGUNAN_ROAD_NODES));

  for (const nodeId of Object.keys(RAGUNAN_ROAD_NODES)) {
    distances[nodeId] = Infinity;
  }
  distances[startNode.id] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let minD = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minD) {
        minD = distances[nodeId];
        current = nodeId;
      }
    }

    if (!current || distances[current] === Infinity) break;
    if (current === targetNode.id) break;

    unvisited.delete(current);

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.to)) {
        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          previous[neighbor.to] = current;
          previousEdge[neighbor.to] = neighbor;
        }
      }
    }
  }

  const pathNodes = [];
  const edgeSequence = [];
  let curr = targetNode.id;

  while (curr) {
    pathNodes.unshift(RAGUNAN_ROAD_NODES[curr]);
    if (previousEdge[curr]) {
      edgeSequence.unshift(previousEdge[curr]);
    }
    curr = previous[curr];
  }

  if (pathNodes.length === 0 || pathNodes[0].id !== startNode.id) {
    return null;
  }

  const coordinates = [startCoords];
  for (const node of pathNodes) {
    coordinates.push(node.coords);
  }
  coordinates.push(targetCoords);

  let totalDist = 0;
  let weightedCanopySum = 0;

  for (const edge of edgeSequence) {
    totalDist += edge.distance;
    weightedCanopySum += edge.distance * (edge.canopy || 0.85);
  }

  const startOffset = haversineDistanceMeters(startCoords[0], startCoords[1], startNode.coords[0], startNode.coords[1]);
  const endOffset = haversineDistanceMeters(targetCoords[0], targetCoords[1], targetNode.coords[0], targetNode.coords[1]);
  totalDist += startOffset + endOffset;

  const durationMinutes = Math.max(1, Math.round(totalDist / 70));
  const caloriesKcal = Math.max(4, Math.round(totalDist * 0.05));
  const canopyPercentage = edgeSequence.length > 0 
    ? Math.min(99, Math.round((weightedCanopySum / (totalDist - startOffset - endOffset || 1)) * 100))
    : 85;

  const steps = generateTurnSteps(pathNodes, edgeSequence, targetCoords);

  return {
    source: 'internal_dijkstra',
    sourceLabel: 'Jalur Pejalan Kaki Ragunan (Offline)',
    nodes: pathNodes,
    coordinates: coordinates,
    totalDistance: totalDist,
    durationMinutes: durationMinutes,
    caloriesKcal: caloriesKcal,
    canopyPercentage: canopyPercentage,
    steps: steps
  };
}

function generateTurnSteps(pathNodes, edgeSequence, targetCoords) {
  const steps = [];

  if (pathNodes.length <= 1) {
    steps.push({
      instruction: 'Jalan langsung menuju destinasi',
      subtext: 'Area pejalan kaki dekat',
      maneuver: 'straight',
      roadName: pathNodes[0]?.name || 'Jalur Ragunan',
      distance: 30,
      coords: targetCoords
    });
    return steps;
  }

  const firstEdge = edgeSequence[0] || { roadName: 'Koridor Utama Pejalan Kaki', distance: 100 };
  steps.push({
    instruction: `Mulai berjalan di ${firstEdge.roadName}`,
    subtext: `Ikuti jalur pedestrian menuju ${pathNodes[1]?.name || 'tujuan'}`,
    maneuver: 'straight',
    roadName: firstEdge.roadName,
    distance: firstEdge.distance,
    coords: pathNodes[0].coords
  });

  for (let i = 1; i < pathNodes.length - 1; i++) {
    const prevNode = pathNodes[i - 1];
    const currNode = pathNodes[i];
    const nextNode = pathNodes[i + 1];
    const nextEdge = edgeSequence[i] || { roadName: 'Jalur Pejalan Kaki Rindang', distance: 120 };

    const bearingIn = calculateBearing(prevNode.coords[0], prevNode.coords[1], currNode.coords[0], currNode.coords[1]);
    const bearingOut = calculateBearing(currNode.coords[0], currNode.coords[1], nextNode.coords[0], nextNode.coords[1]);

    let angleDiff = (bearingOut - bearingIn + 360) % 360;
    if (angleDiff > 180) angleDiff -= 360;

    let maneuver = 'straight';
    let turnText = 'Lurus';

    if (angleDiff >= 35 && angleDiff < 135) {
      maneuver = 'turn_right';
      turnText = 'Belok Kanan';
    } else if (angleDiff >= 135) {
      maneuver = 'u_turn_right';
      turnText = 'Putar Balik ke Kanan';
    } else if (angleDiff <= -35 && angleDiff > -135) {
      maneuver = 'turn_left';
      turnText = 'Belok Kiri';
    } else if (angleDiff <= -135) {
      maneuver = 'u_turn_left';
      turnText = 'Putar Balik ke Kiri';
    }

    steps.push({
      instruction: `${turnText} di ${currNode.name}`,
      subtext: `Masuk ke ${nextEdge.roadName} sejauh ${nextEdge.distance}m`,
      maneuver: maneuver,
      roadName: nextEdge.roadName,
      distance: nextEdge.distance,
      coords: currNode.coords
    });
  }

  const lastNode = pathNodes[pathNodes.length - 1];
  steps.push({
    instruction: `Tiba di tujuan: ${lastNode.name}`,
    subtext: 'Destinasi Anda berada di depan Anda',
    maneuver: 'pin_drop',
    roadName: lastNode.name,
    distance: 20,
    coords: lastNode.coords
  });

  return steps;
}

// =====================================================================
// 3. HYBRID ROUTING EXECUTOR (MAIN ENTRY POINT)
// =====================================================================
export async function calculateRoute(startCoords, targetCoords, mode = 'shaded') {
  // 1. Coba hitung via OSRM Pedestrian Foot Engine terlebih dahulu
  const osrmResult = await fetchOsrmPedestrianRoute(startCoords, targetCoords);
  if (osrmResult && osrmResult.coordinates.length >= 2) {
    return osrmResult;
  }

  // 2. Jika OSRM offline/gagal, fallback mulus ke internal Dijkstra
  return calculateDijkstraRoute(startCoords, targetCoords, mode);
}

// =====================================================================
// PANDUAN SUARA INDONESIA (TEXT-TO-SPEECH)
// =====================================================================
export class VoiceNavigator {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isMuted = false;
    this.lastSpokenText = '';
  }

  speak(text) {
    if (!this.synth || this.isMuted || !text) return;
    if (text === this.lastSpokenText) return;

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = this.synth.getVoices();
      const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      this.lastSpokenText = text;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Voice navigation error:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.synth) {
      this.synth.cancel();
    }
    return !this.isMuted;
  }
}
