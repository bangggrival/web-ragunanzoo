// =====================================================================
//  TAMAN MARGASATWA RAGUNAN - APLIKASI UTAMA PETA & NAVIGASI INTERAKTIF
// =====================================================================

import {
  RAGUNAN_MAP_CONFIG,
  TILE_LAYERS,
  KERETA_KELILING_ROUTE,
  RAGUNAN_ANIMALS,
  RAGUNAN_FACILITIES,
  RAGUNAN_ROAD_NODES
} from './data/ragunan-data.js';

import { RAGUNAN_PEDESTRIAN_GEOJSON } from './data/ragunan-footways.js';

import {
  calculateRoute,
  haversineDistanceMeters,
  calculateBearing,
  VoiceNavigator
} from './js/navigation-engine.js';

// =====================================================================
// STATE APLIKASI
// =====================================================================
const state = {
  map: null,
  activeTileLayer: null,
  currentTileType: 'osmHot', // 'osmHot', 'osmStandard', atau 'satellite'
  tramPolyline: null,
  isTramVisible: false,
  pedestrianLayer: null,
  isPedestrianVisible: true,

  // Lokasi Pengguna & Pelacakan Real GPS
  userCoords: [-6.3048, 106.8198], // Default posisi awal Ragunan
  userLocationName: 'Mencari GPS...',
  userMarker: null,
  userHeading: 0,
  isUsingRealGPS: false,
  gpsWatchId: null,
  gpsAccuracy: null,
  accuracyCircle: null,
  isFollowMode: true, // Kunci tampilan otomatis mengikuti posisi GPS berjalan
  hasInitialGpsFix: false,
  lastRecalculateTime: 0,
  toastTimer: null,
  deviceOrientationActive: false,
  lastGpsCoords: null,
  isOobDismissed: false,
  simulatedOriginNode: null,

  // Destinasi & Navigasi
  activeDestination: null,
  activeOrigin: null,
  activeRoute: null,
  routeMode: 'shaded', // 'shaded' atau 'fastest'
  currentStepIndex: 0,
  isNavigating: false,

  // Filter Kategori
  activeCategory: 'all',
  poiMarkers: [],
  routeLayers: [],

  // Audio & Tampilan
  voiceNavigator: new VoiceNavigator(),
  is3DMode: false,
  isAudioGuidePlaying: false,

  // Lokasi Parkir Kendaraan
  savedParking: null,
  parkingMarker: null,
  parkingSelectedVehicle: 'car',
  parkingSelectedMethod: 'gps',

  // Mode Kurator & Manajemen POI
  isCuratorMode: false,
  curatorDraftMarker: null,
  curatorDraftCoords: null,
  curatorDraftSnappedNode: null,
  curatorActiveTab: 'animal',
  editingPOI: null,
  customAnimals: [],
  customFacilities: [],
  poiManagerFilterType: 'all',
  poiManagerSearchQuery: '',
  curatorSurveyMetadata: null,
  curatorCapturedAnimalPhoto: null,
  curatorCapturedFacPhoto: null,
  calibrationSamples: [],
  calibrationWatchId: null,
  calibrationTimer: null,

  // Data Dinamis dari API Backend (GPS POIs & Tram Route)
  apiAnimals: null,
  apiFacilities: null,
  apiTramRoute: null
};

// =====================================================================
// INISIALISASI PETA LEAFLET
// =====================================================================
function initMap() {
  if (typeof L === 'undefined') {
    console.warn('[Ragunan Map] Menunggu pustaka Leaflet selesai dimuat...');
    setTimeout(initMap, 80);
    return;
  }
  if (state.map) return; // Mencegah inisialisasi ganda

  // Buat Map Instance
  state.map = L.map('map', {
    center: RAGUNAN_MAP_CONFIG.center,
    zoom: RAGUNAN_MAP_CONFIG.defaultZoom,
    minZoom: RAGUNAN_MAP_CONFIG.minZoom,
    maxZoom: RAGUNAN_MAP_CONFIG.maxZoom,
    zoomControl: false,
    maxBounds: RAGUNAN_MAP_CONFIG.maxBounds,
    maxBoundsViscosity: 0.8
  });

  // Zoom-level responsiveness untuk mencegah tumpukan marker & label
  function updateMapZoomClasses() {
    if (!state.map) return;
    const z = state.map.getZoom();
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    mapEl.classList.remove('map-zoom-overview', 'map-zoom-normal', 'map-zoom-detailed');
    if (z <= 15) {
      mapEl.classList.add('map-zoom-overview');
    } else if (z === 16) {
      mapEl.classList.add('map-zoom-normal');
    } else {
      mapEl.classList.add('map-zoom-detailed');
    }
  }
  state.map.on('zoomend', updateMapZoomClasses);
  updateMapZoomClasses();

  // Terapkan Basemap Awal (OpenStreetMap HOT Rindang - 100% Free Tanpa API Key)
  setBasemap('osmHot');

  // Inisialisasi User GPS Marker
  initUserMarker();

  // Inisialisasi Jalur Khusus Pejalan Kaki (256 Koridor OSM)
  initPedestrianLayer();

  // Muat Titik Kustom dari LocalStorage
  loadCustomPOIs();

  // Render Marker Satwa & Fasilitas (awal dari data lokal/fallback)
  renderPOIMarkers();

  // Ambil Data GPS Terkini dari Backend Database (Realtime Sync)
  fetchGpsPoisFromApi();
  fetchTramRouteFromApi();

  // Setup Seluruh Event Listener
  setupUIEventListeners();

  // Jika peta dibuka di dalam iframe (misal di halaman /map web utama),
  // sembunyikan tombol "Web Utama" di header agar tidak redundan dengan navbar utama
  try {
    if (window.self !== window.top) {
      const btnBack = document.getElementById('btn-back-to-web');
      if (btnBack) btnBack.style.display = 'none';
    }
  } catch (err) {
    // Abaikan jika sandbox melarang akses window.top
  }

  // Populate Dropdown Route Planner
  populateRoutePlannerDropdowns();

  // Render Daftar Feeding Show
  renderFeedingShowCards();

  // Fitur Cerdas: Peringatan Feeding Show & Hitung Jarak Fasilitas Terdekat
  initLiveFeedingAlert();
  updateNearbyDistanceTags();

  // Muat Posisi Parkir Tersimpan (jika ada)
  loadSavedParking();

  // Pastikan ukuran viewport peta Leaflet langsung pas & merespons perubahan ukuran kontainer/iframe
  [50, 150, 300, 600, 1000, 1500].forEach(delay => {
    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, delay);
  });

  if (typeof ResizeObserver !== 'undefined') {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      const ro = new ResizeObserver(() => {
        if (state.map) state.map.invalidateSize();
      });
      ro.observe(mapEl);
    }
  }

  window.addEventListener('resize', () => {
    if (state.map) state.map.invalidateSize();
  });

  // Event Klik Peta: Tutup drawer atau mode kurator
  state.map.on('click', (e) => {
    if (state.isCuratorMode) {
      handleMapCuratorClick([e.latlng.lat, e.latlng.lng]);
    } else {
      document.body.classList.remove('drawer-open');
      const detailDrawer = document.getElementById('detail-drawer');
      if (detailDrawer && detailDrawer.classList.contains('open')) {
        closeDetailDrawer();
      }
      const feedingDrawer = document.getElementById('feeding-drawer');
      if (feedingDrawer && feedingDrawer.classList.contains('open')) {
        document.getElementById('btn-close-feeding')?.click();
      }
      const searchResultsDropdown = document.getElementById('search-results-dropdown');
      if (searchResultsDropdown && searchResultsDropdown.classList.contains('show')) {
        searchResultsDropdown.classList.remove('show');
      }
      const layerSwitcherCard = document.getElementById('layer-switcher-card');
      if (layerSwitcherCard && layerSwitcherCard.classList.contains('open')) {
        layerSwitcherCard.classList.remove('open');
      }
    }
  });

  // Mulai Pelacakan Real GPS Perangkat & Kompas Magnetometer
  startRealGpsTracking();
  initDeviceOrientation();

  // Dukungan Deep Link Parameter URL (?poi=... / ?search=...)
  setTimeout(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetPoi = urlParams.get('poi');
      const targetSearch = urlParams.get('search');
      const allItems = typeof getAllActivePOIs === 'function' ? getAllActivePOIs() : [...RAGUNAN_ANIMALS, ...RAGUNAN_FACILITIES];
      
      if (targetPoi) {
        const cleanPoi = targetPoi.toLowerCase().replace(/_/g, ' ').trim();
        const match = allItems.find(x => 
          (x.id && x.id.toLowerCase() === targetPoi.toLowerCase()) || 
          (x.name && x.name.toLowerCase().includes(cleanPoi))
        );
        if (match && match.coords) {
          state.map.flyTo(match.coords, 18, { animate: true, duration: 1.2 });
          openDetailDrawer(match);
        }
      } else if (targetSearch) {
        const searchInput = document.getElementById('input-search');
        if (searchInput) {
          searchInput.value = targetSearch;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } catch (err) {
      console.warn('Error handling URL params in map:', err);
    }
  }, 600);

  // Beritahu website utama bahwa peta siap
  if (window.self !== window.top) {
    try {
      parent.postMessage({ type: 'MAP_READY' }, '*');
    } catch (e) {}
  }

  // Dukungan Komunikasi PostMessage Lengkap dari Website Utama
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    const msg = event.data;

    // 1. Invalidate Size (saat resize window / fullscreen)
    if (msg.type === 'INVALIDATE_SIZE' || msg === 'INVALIDATE_SIZE') {
      if (state.map) state.map.invalidateSize();
      return;
    }

    // 2. Set Basemap (osmHot, osmStandard, satellite)
    if (msg.type === 'SET_BASEMAP' && msg.basemap) {
      setBasemap(msg.basemap);
      return;
    }

    // 3. Set Filter Kategori
    if (msg.type === 'SET_CATEGORY_FILTER') {
      state.activeCategory = msg.category || 'all';
      renderPOIMarkers();
      return;
    }

    // 4. Pencarian Teks Terpadu
    if (msg.type === 'SEARCH_QUERY') {
      const q = (msg.query || '').trim().toLowerCase();
      state.searchQuery = q;
      renderPOIMarkers();
      if (q) {
        const allItems = typeof getAllActivePOIs === 'function' ? getAllActivePOIs() : [...RAGUNAN_ANIMALS, ...RAGUNAN_FACILITIES];
        const match = allItems.find(x => 
          (x.name && x.name.toLowerCase().includes(q)) || 
          (x.latin && x.latin.toLowerCase().includes(q))
        );
        if (match && match.coords) {
          state.map.flyTo(match.coords, 17, { animate: true, duration: 0.8 });
        }
      }
      return;
    }

    // 5. Fokus ke POI tertentu
    if (msg.type === 'FOCUS_POI' || msg.poi) {
      const poiKey = msg.poi || msg.poiId;
      if (!poiKey) return;
      const allItems = typeof getAllActivePOIs === 'function' ? getAllActivePOIs() : [...RAGUNAN_ANIMALS, ...RAGUNAN_FACILITIES];
      const cleanKey = poiKey.toLowerCase().replace(/_/g, ' ').trim();
      const match = allItems.find(x => 
        (x.id && x.id.toLowerCase() === poiKey.toLowerCase()) || 
        (x.name && x.name.toLowerCase().includes(cleanKey))
      );
      if (match && match.coords) {
        state.map.flyTo(match.coords, 18, { animate: true, duration: 1.2 });
        openDetailDrawer(match);
      }
      return;
    }

    // 6. Pusatkan ke GPS Pengguna
    if (msg.type === 'LOCATE_ME') {
      document.getElementById('btn-locate-user')?.click();
      return;
    }

    // 6b. Atur Titik Lokasi Pengguna (Real GPS atau Gerbang/Lokasi Simulasi)
    if (msg.type === 'SET_USER_LOCATION') {
      if (msg.preset === 'device_gps') {
        startRealGpsTracking(true);
        state.isFollowMode = true;
        const fBtn = document.getElementById('btn-toggle-follow');
        if (fBtn) fBtn.classList.add('active');
        state.map.flyTo(state.userCoords, 18, { duration: 0.8 });
        showGpsLiveToast('Meminta Sensor GPS Real HP Anda...', 'satellite_alt');
      } else if (msg.preset && RAGUNAN_ROAD_NODES[msg.preset]) {
        stopRealGpsTracking();
        const node = RAGUNAN_ROAD_NODES[msg.preset];
        state.isUsingRealGPS = false;
        state.isFollowMode = false;
        state.gpsAccuracy = null;
        state.simulatedOriginNode = node;
        const fBtn = document.getElementById('btn-toggle-follow');
        if (fBtn) fBtn.classList.remove('active');
        updateUserPosition(node.coords, node.name);
        updateGpsIndicator('active', node.name);
        state.map.flyTo(node.coords, 17);
        showGpsLiveToast(`Titik awal dialihkan ke ${node.name}`, 'place');
      } else if (msg.coords && Array.isArray(msg.coords)) {
        stopRealGpsTracking();
        state.isUsingRealGPS = false;
        state.isFollowMode = false;
        state.gpsAccuracy = null;
        updateUserPosition(msg.coords, msg.name || 'Titik Pilihan');
        state.map.flyTo(msg.coords, 17);
      }
      return;
    }

    // 6c. Hentikan Sensor GPS (Single Source of Truth)
    if (msg.type === 'STOP_GPS') {
      stopRealGpsTracking();
      return;
    }

    // 6d. Izin Sensor Kompas dari Parent Window
    if (msg.type === 'REQUEST_COMPASS_PERMISSION') {
      if (typeof state.requestCompassPermission === 'function') {
        state.requestCompassPermission();
      }
      return;
    }

    // 6e. Buka Modal Picker Lokasi
    if (msg.type === 'OPEN_LOCATION_PICKER') {
      document.getElementById('location-picker-modal')?.classList.add('open');
      return;
    }

    // 7. Buka Modal / Simpan Parkir
    if (msg.type === 'TOGGLE_PARKING') {
      openParkingModal();
      return;
    }

    // 8. Buka Modal Darurat SOS
    if (msg.type === 'TRIGGER_SOS') {
      document.getElementById('sos-modal')?.classList.add('open');
      return;
    }

    // 9. Mulai Navigasi Rute Pejalan Kaki (A ke B) dari Web Native
    if (msg.type === 'START_NAVIGATION') {
      const originVal = msg.originId || 'current';
      const destVal = msg.destId;
      const pref = msg.preference || 'shaded';

      state.routePreference = pref === 'fastest' ? 'fastest' : 'shaded';
      const btnShaded = document.getElementById('btn-route-shaded');
      const btnFastest = document.getElementById('btn-route-fastest');
      if (btnShaded && btnFastest) {
        if (state.routePreference === 'shaded') {
          btnShaded.classList.add('active');
          btnFastest.classList.remove('active');
        } else {
          btnFastest.classList.add('active');
          btnShaded.classList.remove('active');
        }
      }

      // Cari koordinat titik origin yang dipilih
      let startCoords = state.userCoords;
      let originLabel = 'Posisi Anda';
      if (originVal === 'pintu_utara' && RAGUNAN_ROAD_NODES.n_pintu_utara) {
        startCoords = RAGUNAN_ROAD_NODES.n_pintu_utara.coords;
        originLabel = 'Pintu Masuk Utama (Utara)';
      } else if (originVal === 'pintu_barat' && RAGUNAN_ROAD_NODES.n_pintu_barat) {
        startCoords = RAGUNAN_ROAD_NODES.n_pintu_barat.coords;
        originLabel = 'Pintu Masuk Barat';
      } else if (originVal === 'pintu_timur' && RAGUNAN_ROAD_NODES.n_pintu_timur) {
        startCoords = RAGUNAN_ROAD_NODES.n_pintu_timur.coords;
        originLabel = 'Pintu Masuk Timur';
      } else if (originVal === 'pintu_selatan' && RAGUNAN_ROAD_NODES.n_pintu_selatan) {
        startCoords = RAGUNAN_ROAD_NODES.n_pintu_selatan.coords;
        originLabel = 'Pintu Masuk Selatan';
      } else if ((originVal === 'danau_pelikan' || originVal === 'burung') && RAGUNAN_ROAD_NODES.n_danau_pusat) {
        startCoords = RAGUNAN_ROAD_NODES.n_danau_pusat.coords;
        originLabel = 'Plaza Danau Burung Pelikan';
      } else if ((originVal === 'schmutzer' || originVal === 'primata') && RAGUNAN_ROAD_NODES.n_schmutzer_gerbang) {
        startCoords = RAGUNAN_ROAD_NODES.n_schmutzer_gerbang.coords;
        originLabel = 'Pusat Primata Schmutzer';
      } else if (originVal !== 'current') {
        const allPOIs = typeof getAllActivePOIs === 'function' ? getAllActivePOIs() : [...RAGUNAN_ANIMALS, ...RAGUNAN_FACILITIES];
        const matchOrigin = allPOIs.find(p => p.id === originVal);
        if (matchOrigin && matchOrigin.coords) {
          startCoords = matchOrigin.coords;
          originLabel = matchOrigin.name;
        }
      }

      // Cari object destination
      const allTargets = typeof getAllActivePOIs === 'function' ? getAllActivePOIs() : [...RAGUNAN_ANIMALS, ...RAGUNAN_FACILITIES];
      let targetObj = allTargets.find(t => t.id === destVal);
      if (!targetObj && destVal) {
        const cleanDest = destVal.toLowerCase().replace(/_/g, ' ').trim();
        targetObj = allTargets.find(t => t.name && t.name.toLowerCase().includes(cleanDest));
      }

      if (targetObj) {
        updateUserPosition(startCoords, originLabel);
        startNavigationToDestination(targetObj, startCoords);
      }
      return;
    }

    // 10. Hentikan Navigasi Rute
    if (msg.type === 'STOP_NAVIGATION') {
      exitNavigation();
      return;
    }

    // 11. Ubah Preferensi Rute
    if (msg.type === 'SET_ROUTE_PREFERENCE') {
      state.routePreference = msg.preference === 'fastest' ? 'fastest' : 'shaded';
      if (state.isNavigating && state.activeDestination) {
        startNavigationToDestination(state.activeDestination);
      }
      return;
    }
  });
}

// Penggantian Basemap (100% Free Tanpa API Key)
function setBasemap(type) {
  if (state.activeTileLayer) {
    state.map.removeLayer(state.activeTileLayer);
  }

  const config = TILE_LAYERS[type] || TILE_LAYERS.osmHot;
  state.currentTileType = type;

  state.activeTileLayer = L.tileLayer(config.url, {
    attribution: config.attribution,
    maxZoom: config.maxZoom || 19,
    subdomains: config.subdomains || 'abc'
  }).addTo(state.map);

  // Fallback otomatis jika tile gagal dimuat (misal kendala jaringan)
  let tileErrors = 0;
  state.activeTileLayer.on('tileerror', () => {
    tileErrors++;
    if (tileErrors === 5 && type === 'osmHot') {
      console.warn('[Ragunan Map] Gagal memuat beberapa tile OSM Hot, beralih ke OSM Standar...');
      setBasemap('osmStandard');
    }
  });

  // Update indikator checkmark di menu switcher
  document.querySelectorAll('.layer-switch-item').forEach(el => el.classList.remove('active'));
  let activeId = 'layer-opt-osm-hot';
  if (type === 'osmStandard') activeId = 'layer-opt-osm-std';
  else if (type === 'satellite') activeId = 'layer-opt-satellite';
  const activeEl = document.getElementById(activeId);
  if (activeEl) activeEl.classList.add('active');
}

// Inisialisasi Layer Jaringan 256 Jalur Pejalan Kaki
function initPedestrianLayer() {
  if (typeof RAGUNAN_PEDESTRIAN_GEOJSON !== 'undefined') {
    state.pedestrianLayer = L.geoJSON(RAGUNAN_PEDESTRIAN_GEOJSON, {
      style: {
        color: '#3b614b',
        weight: 2.5,
        dashArray: '4, 4',
        opacity: 0.65,
        className: 'pedestrian-footway-line'
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip('Jalur Khusus Pejalan Kaki (Bebas Kendaraan)', {
          sticky: true,
          direction: 'top'
        });
      }
    }).addTo(state.map);
  }
}

// Toggle Jalur Khusus Pejalan Kaki
function togglePedestrianLayer() {
  state.isPedestrianVisible = !state.isPedestrianVisible;
  const icon = document.getElementById('footway-layer-icon');

  if (state.isPedestrianVisible) {
    if (!state.pedestrianLayer) {
      initPedestrianLayer();
    } else {
      state.map.addLayer(state.pedestrianLayer);
    }
    if (icon) {
      icon.textContent = 'toggle_on';
      icon.style.color = '#2e7d32';
    }
  } else {
    if (state.pedestrianLayer) {
      state.map.removeLayer(state.pedestrianLayer);
    }
    if (icon) {
      icon.textContent = 'toggle_off';
      icon.style.color = '#aaa';
    }
  }
}

// Toggle Layer Jalur Kereta Wisata Keliling
function toggleTramRouteLayer() {
  state.isTramVisible = !state.isTramVisible;
  const tramIcon = document.getElementById('tram-layer-icon');

  if (state.isTramVisible) {
    const routeCoords = (state.apiTramRoute && state.apiTramRoute.length > 1) ? state.apiTramRoute : KERETA_KELILING_ROUTE;
    state.tramPolyline = L.polyline(routeCoords, {
      className: 'tram-track-line',
      color: '#b85032'
    }).addTo(state.map);

    if (tramIcon) {
      tramIcon.textContent = 'toggle_on';
      tramIcon.style.color = '#b85032';
    }
  } else {
    if (state.tramPolyline) {
      state.map.removeLayer(state.tramPolyline);
      state.tramPolyline = null;
    }
    if (tramIcon) {
      tramIcon.textContent = 'toggle_off';
      tramIcon.style.color = '#718277';
    }
  }
}

// Inisialisasi Marker Posisi Pengguna (Marker Real GPS dengan Arah Hadap & Pulsa)
function initUserMarker() {
  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div class="user-gps-marker" id="user-gps-marker-el">
        <div class="user-gps-cone" id="user-gps-cone"></div>
        <div class="user-gps-pulse"></div>
        <div class="user-gps-dot"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  state.userMarker = L.marker(state.userCoords, {
    icon: userIcon,
    zIndexOffset: 3000
  }).addTo(state.map);

  state.userMarker.bindTooltip('Posisi GPS Real Anda', {
    permanent: false,
    direction: 'top',
    offset: [0, -16]
  });
}

// Memperbarui Posisi Pengguna di Peta
function updateUserPosition(newCoords, locationLabel = null) {
  state.userCoords = newCoords;
  if (locationLabel) {
    state.userLocationName = locationLabel;
  }

  if (state.userMarker) {
    state.userMarker.setLatLng(newCoords);
  }

  if (state.isNavigating && state.activeRoute) {
    checkRealWalkingProgress(newCoords);
  }

  // Update live jarak ke titik parkir jika modal sedang terbuka
  if (state.savedParking) {
    updateLiveParkingDistance();
  }

  // Update live jarak ke fasilitas terdekat
  if (typeof updateNearbyDistanceTags === 'function') {
    updateNearbyDistanceTags();
  }

  // Notifikasi posisi GPS ke website utama
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'GPS_UPDATE',
        data: {
          latitude: newCoords[0],
          longitude: newCoords[1],
          accuracy: state.isUsingRealGPS ? (state.gpsAccuracy || 15) : null,
          isRealGps: !!state.isUsingRealGPS,
          locationName: state.userLocationName || null
        }
      }, '*');
    } catch (e) {}
  }
}

// Memperbarui Arah Hadap / Cone Pengguna
function updateUserMarkerHeading(deg) {
  state.userHeading = deg;
  const cone = document.getElementById('user-gps-cone');
  if (cone) {
    cone.style.transform = `rotate(${deg}deg)`;
  }
}

// Lingkaran Akurasi Real GPS (Radius dalam Meter)
function updateUserAccuracyCircle(coords, accuracyMeters) {
  if (!accuracyMeters || isNaN(accuracyMeters)) return;

  if (!state.accuracyCircle) {
    state.accuracyCircle = L.circle(coords, {
      radius: Math.min(accuracyMeters, 150),
      color: '#0288d1',
      weight: 1,
      opacity: 0.5,
      fillColor: '#0288d1',
      fillOpacity: 0.12,
      interactive: false
    }).addTo(state.map);
  } else {
    state.accuracyCircle.setLatLng(coords);
    state.accuracyCircle.setRadius(Math.min(accuracyMeters, 150));
  }
}

// =====================================================================
// HELPER GETTERS: AKTIFKAN DEFAULT + CUSTOM POI DARI LOCALSTORAGE
// =====================================================================
function loadCustomPOIs() {
  try {
    const rawAnimals = localStorage.getItem('ragunan_custom_animals');
    if (rawAnimals) state.customAnimals = JSON.parse(rawAnimals) || [];
    const rawFac = localStorage.getItem('ragunan_custom_facilities');
    if (rawFac) state.customFacilities = JSON.parse(rawFac) || [];
  } catch (e) {
    console.warn('Gagal memuat custom POI dari localStorage:', e);
  }
}

function saveCustomPOIsToStorage() {
  try {
    localStorage.setItem('ragunan_custom_animals', JSON.stringify(state.customAnimals));
    localStorage.setItem('ragunan_custom_facilities', JSON.stringify(state.customFacilities));
  } catch (e) {
    console.warn('Gagal menyimpan custom POI ke localStorage:', e);
  }
}

function getActiveAnimals() {
  const base = (state.apiAnimals && state.apiAnimals.length > 0) ? state.apiAnimals : RAGUNAN_ANIMALS;
  return [...base, ...(state.customAnimals || [])];
}

function getActiveFacilities() {
  const base = (state.apiFacilities && state.apiFacilities.length > 0) ? state.apiFacilities : RAGUNAN_FACILITIES;
  return [...base, ...(state.customFacilities || [])];
}

function getAllActivePOIs() {
  return [...getActiveAnimals(), ...getActiveFacilities()];
}

// Mengambil Data POI GPS Real-Time dari Database Backend
async function fetchGpsPoisFromApi() {
  try {
    const res = await fetch('/api/gps-pois?active_only=false');
    if (!res.ok) throw new Error('Gagal memuat GPS POI dari backend');
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      const animals = [];
      const facilities = [];

      json.data.forEach(poi => {
        const item = {
          id: poi.id,
          name: poi.name,
          nameEn: poi.name_en || poi.name,
          coords: [poi.lat, poi.lng],
          category: poi.category,
          color: poi.color || '#22c55e',
          emoji: poi.emoji || '📍',
          description: poi.description,
          descriptionEn: poi.description_en,
          is_active: poi.is_active,
          is_temporarily_closed: !!poi.is_temporarily_closed,
          closure_reason: poi.closure_reason,
          closure_until: poi.closure_until,
          capacity_status: poi.capacity_status || 'normal',
          local_announcement: poi.local_announcement,
          announcement_expires_at: poi.announcement_expires_at,
          operating_hours_open: poi.operating_hours_open,
          operating_hours_close: poi.operating_hours_close,
          feedingTime: poi.feeding_time,
          feeding_time_hour: poi.feeding_time_hour,
          feeding_time_minute: poi.feeding_time_minute,
          feedingNote: poi.feeding_note,
          latinName: poi.latin_name,
          latin: poi.latin_name,
          status: poi.conservation_status,
          conservationStatus: poi.conservation_status,
          origin: poi.origin,
          diet: poi.diet,
          food: poi.diet
        };

        if (poi.category === 'animal') {
          item.isAnimal = true;
          const staticMatch = RAGUNAN_ANIMALS.find(a => a.id === poi.id);
          item.img = staticMatch?.img || 'assets/hero_bg.jpg';
          item.funFacts = staticMatch?.funFacts || [];
          animals.push(item);
        } else {
          item.isAnimal = false;
          item.type = poi.category;
          facilities.push(item);
        }
      });

      if (animals.length > 0) state.apiAnimals = animals;
      if (facilities.length > 0) state.apiFacilities = facilities;

      if (state.map) {
        renderPOIMarkers();
        populateRoutePlannerDropdowns();
        renderFeedingShowCards();
      }
    }
  } catch (err) {
    console.warn('[Ragunan Map] Menggunakan data offline fallback untuk POI:', err);
  }
}

// Mengambil Data Rute Kereta Wisata dari Database Backend
async function fetchTramRouteFromApi() {
  try {
    const res = await fetch('/api/tram-route');
    if (!res.ok) throw new Error('Gagal memuat rute tram dari backend');
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      state.apiTramRoute = json.data.map(pt => [pt.lat, pt.lng]);
      if (state.isTramVisible && state.map) {
        if (state.tramPolyline) {
          state.map.removeLayer(state.tramPolyline);
        }
        state.tramPolyline = L.polyline(state.apiTramRoute, {
          className: 'tram-track-line',
          color: '#b85032'
        }).addTo(state.map);
      }
    }
  } catch (err) {
    console.warn('[Ragunan Map] Menggunakan rute tram default fallback:', err);
  }
}

// Menentukan Node Pejalan Kaki Terdekat untuk Rute Navigasi Bebas Buntu
function findNearestPedestrianNode(coords) {
  if (!coords || !RAGUNAN_ROAD_NODES) return null;
  let nearest = null;
  let minDistance = Infinity;

  Object.values(RAGUNAN_ROAD_NODES).forEach(node => {
    const dist = haversineDistanceMeters(coords[0], coords[1], node.coords[0], node.coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...node, distanceMeters: Math.round(dist) };
    }
  });

  return nearest;
}

// =====================================================================
// =====================================================================
// PALET WARNA KATEGORI KARTOGRAFI BOTANI & FASILITAS RESMI
// =====================================================================
const ANIMAL_CATEGORY_COLORS = {
  mamalia: '#1b4332',
  karnivora: '#b85032',
  primata: '#a16207',
  aves: '#6b21a8',
  reptil: '#0e7490',
  akuatik: '#0284c7',
  edukasi: '#123326'
};

const FACILITY_COLORS = {
  toilet: '#0284c7',
  musholla: '#059669',
  kuliner: '#d97706',
  info: '#1d4ed8',
  medis: '#dc2626',
  tram: '#15803d',
  parkir: '#b85032',
  gate: '#123326',
  sepeda: '#0f766e',
  gazebo: '#4d7c0f',
  default: '#4e735e'
};

// =====================================================================
// RENDER POI (MARKER FOTO REAL SATWA & VEKTOR FASILITAS)
// =====================================================================
function renderPOIMarkers() {
  state.poiMarkers.forEach(m => state.map.removeLayer(m));
  state.poiMarkers = [];

  const itemsToRender = [];

  if (state.activeCategory === 'all' || state.activeCategory === 'satwa') {
    getActiveAnimals().forEach(animal => itemsToRender.push({ ...animal, isAnimal: true }));
  }

  getActiveFacilities().forEach(fac => {
    const fType = (fac.type || '').toLowerCase();
    const fCat = (fac.category || '').toLowerCase();
    const fName = (fac.name || '').toLowerCase();
    const fId = (fac.id || '').toLowerCase();

    if (state.activeCategory === 'all') {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'toilet' && (fType === 'toilet' || fId.includes('toilet') || fName.includes('toilet') || fName.includes('laktasi'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'musholla' && (fType === 'musholla' || fId.includes('musholla') || fName.includes('musholla') || fName.includes('masjid'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'transportasi' && (fCat === 'transportasi' || fType === 'transport' || fType === 'tram' || fId.includes('halte') || fName.includes('halte') || fName.includes('kereta') || fName.includes('sepeda'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'pintu' && (fCat === 'pintu' || fType === 'gate' || fId.includes('pintu') || fName.includes('pintu') || fName.includes('gerbang') || fName.includes('loket'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'kuliner' && (fCat === 'kuliner' || fType === 'food' || fType === 'kuliner' || fName.includes('pujasera') || fName.includes('kafe') || fName.includes('kios'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    } else if (state.activeCategory === 'medical' && (fType === 'medical' || fType === 'security' || fId.includes('medis') || fId.includes('ranger') || fName.includes('medis') || fName.includes('p3k') || fName.includes('ranger'))) {
      itemsToRender.push({ ...fac, isAnimal: false });
    }
  });

  itemsToRender.forEach(item => {
    const isAnimal = item.isAnimal;
    const isClosed = !!item.is_temporarily_closed;
    const isPadat = item.capacity_status === 'padat';
    const isSepi = item.capacity_status === 'sepi';
    const closureBadge = isClosed ? `<div class="marker-closure-badge" title="Tutup Sementara">TUTUP</div>` : '';
    const capacityBadge = isPadat ? `<div class="marker-capacity-badge padat" title="Kapasitas Padat">PADAT</div>` : (isSepi ? `<div class="marker-capacity-badge sepi" title="Kondisi Sepi">SEPI</div>` : '');

    let iconHtml = '';

    if (isAnimal) {
      const pinColor = isClosed ? '#dc2626' : (ANIMAL_CATEGORY_COLORS[item.category] || item.color || '#123326');
      const imgSrc = item.img || item.image || 'assets/hero_bg.jpg';
      const hasFeeding = !!item.feedingTime;
      const feedingBadge = hasFeeding ? `
        <div class="marker-feeding-badge" title="Jadwal Feeding Show: ${item.feedingTime}">
          <span class="material-symbols-outlined">restaurant</span>
        </div>` : '';

      iconHtml = `
        <div class="marker-animal-pin ${hasFeeding ? 'has-feeding-pin' : ''} ${isClosed ? 'is-closed-pin' : ''}" style="--pin-color: ${pinColor};" title="${item.name}">
          <div class="marker-avatar-frame ${hasFeeding ? 'has-feeding-pulse' : ''}">
            <img src="${imgSrc}" alt="${item.name}" class="marker-avatar-photo" onerror="this.src='assets/hero_bg.jpg'">
            <div class="marker-category-dot"></div>
            ${closureBadge}
            ${capacityBadge}
            ${feedingBadge}
          </div>
          <div class="marker-pin-stem"></div>
        </div>
        <div class="marker-label-tag ${isClosed ? 'tag-closed' : ''}">${item.name}</div>
      `;
    } else {
      const facColor = isClosed ? '#dc2626' : (FACILITY_COLORS[item.type] || item.color || '#0284c7');
      const iconName = item.icon || 'place';
      iconHtml = `
        <div class="marker-facility-pin ${isClosed ? 'is-closed-pin' : ''}" style="--fac-color: ${facColor};" title="${item.name}">
          <div class="marker-facility-badge" style="position:relative;">
            <span class="material-symbols-outlined">${iconName}</span>
            ${closureBadge}
            ${capacityBadge}
          </div>
          <div class="marker-facility-stem"></div>
        </div>
        <div class="marker-facility-tag ${isClosed ? 'tag-closed' : ''}">${item.name.split('(')[0].trim()}</div>
      `;
    }

    const customIcon = L.divIcon({
      className: `custom-leaflet-marker ${isAnimal ? 'marker-type-animal' : 'marker-type-facility'}`,
      html: iconHtml,
      iconSize: [110, 72],
      iconAnchor: [55, 48],
      popupAnchor: [0, -48]
    });

    const marker = L.marker(item.coords, { 
      icon: customIcon,
      zIndexOffset: isAnimal ? 150 : 20
    }).addTo(state.map);

    marker.on('click', (e) => {
      if (state.isCuratorMode) {
        L.DomEvent.stopPropagation(e);
        openCuratorModal(item);
      } else {
        openDetailDrawer(item);
      }
    });

    state.poiMarkers.push(marker);
  });
}

// =====================================================================
// DETAIL DRAWER / BOTTOM SHEET
// =====================================================================
function openDetailDrawer(item) {
  state.activeDestination = item;

  // Beritahu parent window (website utama) tentang POI yang dipilih
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'POI_SELECTED',
        data: {
          id: item.id || '',
          name: item.name || '',
          nameEn: item.name_en || item.name || '',
          latin: item.latin || '',
          category: item.category || (item.isAnimal ? 'animal' : 'facility'),
          description: item.description || '',
          descriptionEn: item.description_en || item.description || '',
          img: item.img || '',
          coords: item.coords,
          isAnimal: !!item.isAnimal,
          feedingTime: item.feedingTime || null,
          feedingNote: item.feedingNote || null
        }
      }, '*');
    } catch (e) {}
  }

  const drawer = document.getElementById('detail-drawer');
  const imgEl = document.getElementById('drawer-img');
  const catBadge = document.getElementById('drawer-category-badge');
  const nameEl = document.getElementById('drawer-name');
  const latinEl = document.getElementById('drawer-latin');
  const descEl = document.getElementById('drawer-desc');
  const scheduleCard = document.getElementById('drawer-schedule-card');
  const feedingNote = document.getElementById('drawer-feeding-note');
  const feedingTime = document.getElementById('drawer-feeding-time');
  const factsSection = document.getElementById('drawer-facts-section');
  const factsList = document.getElementById('drawer-facts-list');
  const audioGuideBtn = document.getElementById('btn-play-audio-guide');

  nameEl.textContent = item.name;
  descEl.textContent = item.description || 'Fasilitas umum resmi Taman Margasatwa Ragunan.';

  // Status Tutup Sementara
  const closureAlert = document.getElementById('drawer-closure-alert');
  const closureReason = document.getElementById('drawer-closure-reason');
  if (closureAlert) {
    if (item.is_temporarily_closed) {
      closureAlert.style.display = 'flex';
      const reasonText = item.closure_reason || 'Area ini sedang dalam perbaikan/pemeliharaan berkala.';
      const untilText = item.closure_until ? `<br><small style="color:#7f1d1d;">Estimasi buka kembali: <b>${item.closure_until}</b></small>` : '';
      if (closureReason) closureReason.innerHTML = `${reasonText}${untilText}`;
    } else {
      closureAlert.style.display = 'none';
    }
  }

  // Pengumuman Khusus Lokasi
  const annCard = document.getElementById('drawer-announcement-card');
  const annText = document.getElementById('drawer-announcement-text');
  if (annCard) {
    if (item.local_announcement) {
      annCard.style.display = 'flex';
      if (annText) annText.textContent = item.local_announcement;
    } else {
      annCard.style.display = 'none';
    }
  }

  // Jam Operasional Fasilitas
  const hoursCard = document.getElementById('drawer-hours-card');
  const hoursText = document.getElementById('drawer-hours-text');
  if (hoursCard) {
    if (item.operating_hours_open) {
      hoursCard.style.display = 'flex';
      if (hoursText) hoursText.textContent = `${item.operating_hours_open} - ${item.operating_hours_close || '16:00 WIB'}`;
    } else {
      hoursCard.style.display = 'none';
    }
  }

  if (item.isAnimal || item.latin) {
    imgEl.src = item.img || 'assets/gajah_sumatera.jpg';
    catBadge.textContent = item.categoryLabel || 'Satwa Ragunan';
    catBadge.style.display = 'inline-block';
    latinEl.textContent = item.latin || '';
    latinEl.style.display = 'block';

    if (item.feedingTime) {
      scheduleCard.style.display = 'flex';
      feedingNote.textContent = item.feedingNote || 'Pemberian Pakan Satwa';
      feedingTime.textContent = item.feedingTime;
    } else {
      scheduleCard.style.display = 'none';
    }

    factsSection.style.display = 'block';
    factsList.innerHTML = '';
    (item.funFacts || []).forEach(fact => {
      const factDiv = document.createElement('div');
      factDiv.className = 'fact-item';
      factDiv.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span>${fact}</span>
      `;
      factsList.appendChild(factDiv);
    });

    audioGuideBtn.style.display = 'flex';
  } else {
    imgEl.src = 'assets/hero_bg.jpg';
    catBadge.textContent = 'Fasilitas Pengunjung';
    latinEl.style.display = 'none';
    scheduleCard.style.display = 'none';
    factsSection.style.display = 'none';
    audioGuideBtn.style.display = 'none';
  }

  drawer.classList.add('open');
  document.body.classList.add('drawer-open');

  // Reset inline display styles agar CSS drawer-open bekerja optimal
  const filterBar = document.querySelector('.bottom-filter-bar');
  if (filterBar) filterBar.style.display = '';
  const nearbyStrip = document.getElementById('nearby-facilities-strip');
  if (nearbyStrip) nearbyStrip.style.display = '';
  const mapControls = document.querySelector('.map-controls-stack');
  if (mapControls) mapControls.style.display = '';

  if (window.innerWidth >= 1024) {
    state.map.panTo([item.coords[0], item.coords[1] + 0.0018], {
      animate: true,
      duration: 0.5
    });
  } else {
    state.map.panTo([item.coords[0] - 0.0015, item.coords[1]], {
      animate: true,
      duration: 0.5
    });
  }
}

function closeDetailDrawer() {
  document.getElementById('detail-drawer').classList.remove('open');
  document.body.classList.remove('drawer-open');
  stopAudioGuide();

  const filterBar = document.querySelector('.bottom-filter-bar');
  if (filterBar && !state.isNavigating) filterBar.style.display = '';
  const nearbyStrip = document.getElementById('nearby-facilities-strip');
  if (nearbyStrip && !state.isNavigating) nearbyStrip.style.display = '';
  const mapControls = document.querySelector('.map-controls-stack');
  if (mapControls) mapControls.style.display = '';
}

function closeFeedingDrawer() {
  const feedingDrawer = document.getElementById('feeding-drawer');
  if (feedingDrawer) feedingDrawer.classList.remove('open');
  document.body.classList.remove('drawer-open');
  const filterBar = document.querySelector('.bottom-filter-bar');
  if (filterBar && !state.isNavigating) filterBar.style.display = '';
  const nearbyStrip = document.getElementById('nearby-facilities-strip');
  if (nearbyStrip && !state.isNavigating) nearbyStrip.style.display = '';
  const mapControls = document.querySelector('.map-controls-stack');
  if (mapControls) mapControls.style.display = '';
}

// =====================================================================
// MOBILE: SWIPE-TO-DISMISS TOUCH GESTURES FOR BOTTOM SHEET DRAWERS
// =====================================================================
function setupDrawerTouchGestures() {
  function makeSwipeDismissible(drawer, closeFn) {
    if (!drawer) return;

    let startY = 0;
    let startScrollTop = 0;
    let isDragging = false;
    let isScrolling = null;

    const handles = drawer.querySelectorAll('.drawer-drag-handle, .feeding-header, .drawer-header');

    function onTouchStart(e) {
      startY = e.touches[0].clientY;
      const content = drawer.querySelector('.drawer-content, .feeding-list-container');
      startScrollTop = content ? content.scrollTop : 0;
      isDragging = false;
      isScrolling = null;
      drawer.style.transition = 'none';
    }

    function onTouchMove(e) {
      const deltaY = e.touches[0].clientY - startY;
      const content = drawer.querySelector('.drawer-content, .feeding-list-container');
      const scrollTop = content ? content.scrollTop : 0;

      // Determine direction on first move
      if (isScrolling === null) {
        isScrolling = Math.abs(deltaY) < 8;
      }

      // Only handle downward swipe when at top of scroll
      if (deltaY > 0 && scrollTop <= 2) {
        isDragging = true;
        isScrolling = false;
        e.preventDefault();

        const progress = Math.min(deltaY, 320);
        const eased = progress * (1 - progress / 900);
        const isDesktop = drawer.classList.contains('detail-drawer') || drawer.classList.contains('feeding-drawer');

        // Mobile: translate downward from bottom sheet position
        if (window.innerWidth < 1024) {
          drawer.style.transform = `translate(-50%, ${eased}px)`;
        }
      }
    }

    function onTouchEnd(e) {
      const deltaY = e.changedTouches[0].clientY - startY;
      drawer.style.transition = '';

      if (isDragging && deltaY > 72) {
        // Snap to dismiss with animation
        if (window.innerWidth < 1024) {
          drawer.style.transform = `translate(-50%, 100%)`;
        }
        setTimeout(() => {
          drawer.style.transform = '';
          closeFn();
        }, 220);
      } else {
        // Snap back
        if (window.innerWidth < 1024) {
          drawer.style.transform = 'translate(-50%, 0)';
        }
        setTimeout(() => { drawer.style.transform = ''; }, 320);
      }
      isDragging = false;
    }

    drawer.addEventListener('touchstart', onTouchStart, { passive: true });
    drawer.addEventListener('touchmove', onTouchMove, { passive: false });
    drawer.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  const detailDrawer = document.getElementById('detail-drawer');
  const feedingDrawer = document.getElementById('feeding-drawer');

  makeSwipeDismissible(detailDrawer, closeDetailDrawer);
  makeSwipeDismissible(feedingDrawer, closeFeedingDrawer);
}

async function startNavigationToDestination(destination = null, customOrigin = null) {
  const target = destination || state.activeDestination;
  if (!target) return;

  let startCoords = customOrigin || state.userCoords;

  // Pilar 2: Jika posisi pengguna berada jauh di luar area Ragunan (>2500m) dan tanpa titik awal khusus,
  // otomatis gunakan Pintu Masuk Utama (Utara) sebagai titik awal simulasi rute dalam kebun binatang.
  const distToRagunan = haversineDistanceMeters(startCoords[0], startCoords[1], RAGUNAN_MAP_CONFIG.center[0], RAGUNAN_MAP_CONFIG.center[1]);
  if (distToRagunan > 2500 && !customOrigin && state.isUsingRealGPS) {
    if (RAGUNAN_ROAD_NODES && RAGUNAN_ROAD_NODES.n_pintu_utara) {
      startCoords = RAGUNAN_ROAD_NODES.n_pintu_utara.coords;
      showGpsLiveToast(`Lokasi GPS Anda di luar area Ragunan (~${(distToRagunan / 1000).toFixed(1)} km). Rute pejalan kaki disimulasikan dari Pintu Masuk Utama (Utara).`, 'place', 5000);
    }
  }

  state.activeDestination = target;
  closeDetailDrawer();

  // Tutup route planner jika sedang terbuka
  document.getElementById('route-planner-card').classList.remove('open');

  // Hitung rute menggunakan Mesin Hybrid (OSRM Pedestrian + Offline Dijkstra Fallback)
  const route = await calculateRoute(startCoords, target.coords, state.routeMode);

  if (!route) {
    alert('Jalur navigasi tidak dapat ditemukan.');
    return;
  }

  state.activeRoute = route;
  state.isNavigating = true;
  state.currentStepIndex = 0;

  // Render rute di peta
  renderRouteOnMap(route);

  // Perbarui HUD
  updateNavigationHUD(route);

  // Ucapkan instruksi awal
  const firstInstruction = route.steps[0]?.instruction || 'Mulai berjalan menuju destinasi';
  state.voiceNavigator.speak(`Rute pejalan kaki ke ${target.name} telah siap. ${firstInstruction}`);

  document.getElementById('navigation-hud').classList.add('active');
  document.body.classList.add('navigating');
  document.body.classList.remove('drawer-open');
  document.getElementById('search-section').style.display = 'none';

  // Sembunyikan filter bar, nearby strip, & banner feeding saat navigasi HUD aktif agar tampilan bersih
  const navFilterBar = document.querySelector('.bottom-filter-bar');
  if (navFilterBar) navFilterBar.style.display = 'none';
  const navNearbyStrip = document.getElementById('nearby-facilities-strip');
  if (navNearbyStrip) navNearbyStrip.style.display = 'none';
  const feedingBanner = document.getElementById('feeding-alert-banner');
  if (feedingBanner) feedingBanner.style.display = 'none';

  showGpsLiveToast(`Navigasi aktif menuju ${target.name}. Berjalanlah mengikuti rute.`);
}

// Render Rute di Peta
function renderRouteOnMap(route) {
  state.routeLayers.forEach(l => state.map.removeLayer(l));
  state.routeLayers = [];

  const latlngs = route.coordinates;

  const glowLine = L.polyline(latlngs, {
    className: 'route-glow'
  }).addTo(state.map);

  const activeLine = L.polyline(latlngs, {
    className: 'route-active'
  }).addTo(state.map);

  const animatedTrail = L.polyline(latlngs, {
    className: 'route-animated-trail'
  }).addTo(state.map);

  const targetMarker = L.marker(state.activeDestination.coords, {
    icon: L.divIcon({
      className: 'custom-destination-pin',
      html: `
        <div class="destination-pulse-pin">
          <div class="destination-pin-badge">
            <span class="material-symbols-outlined">flag</span>
          </div>
          <div class="destination-pulse-ring"></div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 38]
    })
  }).addTo(state.map);

  state.routeLayers.push(glowLine, activeLine, animatedTrail, targetMarker);

  state.map.fitBounds(L.latLngBounds(latlngs), {
    padding: [120, 40],
    animate: true
  });
}

// Update Konten HUD Turn-by-Turn
function updateNavigationHUD(route, stepIdx = 0) {
  const currentStep = route.steps[stepIdx] || route.steps[0];

  document.getElementById('hud-maneuver-icon').textContent = currentStep.maneuver || 'straight';
  document.getElementById('hud-turn-distance').textContent = `${currentStep.instruction.split(' ')[0]} • ${currentStep.distance}m`;
  document.getElementById('hud-road-name').textContent = currentStep.roadName || 'Jalur Khusus Pejalan Kaki';
  const sourceLabel = route.sourceLabel || 'Jalur Pejalan Kaki';
  document.getElementById('hud-subtext').textContent = currentStep.subtext 
    ? `${currentStep.subtext} • ${sourceLabel}` 
    : `Menuju ${state.activeDestination?.name} • ${sourceLabel}`;

  document.getElementById('hud-total-dist').textContent = `${route.totalDistance} m`;
  document.getElementById('hud-est-time').textContent = `${route.durationMinutes} Menit`;
  document.getElementById('hud-calories').textContent = `${route.caloriesKcal} kcal`;
  const elCanopy = document.getElementById('hud-canopy-text');
  if (elCanopy) elCanopy.textContent = `${route.canopyPercentage}% Kanopi Teduh`;

  // Kirimkan status rute terkini ke portal web
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'ROUTE_INFO_UPDATE',
        data: {
          isNavigating: true,
          totalDistance: route.totalDistance,
          durationMinutes: route.durationMinutes,
          destinationName: state.activeDestination?.name || '',
          instruction: currentStep.instruction,
          roadName: currentStep.roadName || '',
          canopyPercentage: route.canopyPercentage
        }
      }, '*');
    } catch (e) {}
  }

  document.getElementById('steps-header-count').textContent = `Rincian Manuver Belokan (${route.steps.length} Langkah)`;
  const stepsContainer = document.getElementById('steps-container-list');
  stepsContainer.innerHTML = '';

  route.steps.forEach((step, idx) => {
    const isCurrent = idx === stepIdx;
    const stepCard = document.createElement('div');
    stepCard.className = 'step-card-item';
    if (isCurrent) {
      stepCard.style.borderColor = 'var(--primary)';
      stepCard.style.background = '#e8f5e9';
    }

    stepCard.innerHTML = `
      <span class="material-symbols-outlined">${step.maneuver || 'straight'}</span>
      <div class="step-details">
        <span class="step-title">${step.instruction}</span>
        <span class="step-sub">${step.subtext || ''} (${step.distance}m)</span>
      </div>
    `;
    stepsContainer.appendChild(stepCard);
  });
}

// Hentikan Navigasi
function exitNavigation() {
  state.isNavigating = false;

  state.routeLayers.forEach(l => state.map.removeLayer(l));
  state.routeLayers = [];

  document.getElementById('navigation-hud').classList.remove('active');
  document.body.classList.remove('navigating');
  document.getElementById('search-section').style.display = 'block';

  const filterBar = document.querySelector('.bottom-filter-bar');
  if (filterBar) filterBar.style.display = '';
  const nearbyStrip = document.getElementById('nearby-facilities-strip');
  if (nearbyStrip) nearbyStrip.style.display = '';
  const feedingBanner = document.getElementById('feeding-alert-banner');
  if (feedingBanner && !state.isFeedingDismissed) feedingBanner.style.display = '';
  const mapControls = document.querySelector('.map-controls-stack');
  if (mapControls) mapControls.style.display = '';

  state.voiceNavigator.speak('Navigasi telah dihentikan.');
  showGpsLiveToast('Navigasi telah selesai.');

  if (window.self !== window.top) {
    try {
      parent.postMessage({ type: 'ROUTE_STOPPED' }, '*');
    } catch (e) {}
  }
}

// =====================================================================
// FITUR CERDAS: CARI FASILITAS TERDEKAT (ONE-TAP NEARBY FINDER)
// =====================================================================
function getFacilitiesByType(type) {
  const allFacilities = getActiveFacilities();
  switch (type) {
    case 'toilet':
      return allFacilities.filter(f => f.type === 'toilet' || (f.name && (f.name.toLowerCase().includes('toilet') || f.name.toLowerCase().includes('laktasi'))));
    case 'musholla':
      return allFacilities.filter(f => f.type === 'musholla' || (f.name && (f.name.toLowerCase().includes('musholla') || f.name.toLowerCase().includes('masjid'))));
    case 'tram':
      return allFacilities.filter(f => f.type === 'transport' || f.type === 'tram' || (f.category === 'transportasi' && (f.icon === 'tram' || (f.name && f.name.toLowerCase().includes('halte')))));
    case 'pintu':
      return allFacilities.filter(f => f.category === 'pintu' || f.type === 'gate' || (f.name && (f.name.toLowerCase().includes('pintu') || f.name.toLowerCase().includes('loket') || f.name.toLowerCase().includes('gerbang'))));
    case 'kuliner':
      return allFacilities.filter(f => f.category === 'kuliner' || f.type === 'food' || f.type === 'kuliner' || (f.name && (f.name.toLowerCase().includes('kuliner') || f.name.toLowerCase().includes('pujasera') || f.name.toLowerCase().includes('kafe'))));
    case 'parkir':
      return allFacilities.filter(f => f.type === 'parkir' || f.type === 'parking' || (f.name && f.name.toLowerCase().includes('parkir')));
    case 'medical':
      return allFacilities.filter(f => f.type === 'medical' || f.type === 'security' || (f.name && (f.name.toLowerCase().includes('medis') || f.name.toLowerCase().includes('p3k') || f.name.toLowerCase().includes('ranger'))));
    default:
      return allFacilities;
  }
}

function updateNearbyDistanceTags() {
  const types = ['toilet', 'musholla', 'tram', 'pintu', 'kuliner', 'parkir'];
  const userPos = state.userCoords || RAGUNAN_MAP_CONFIG.center;

  types.forEach(t => {
    const facilities = getFacilitiesByType(t);
    const tagEl = document.getElementById(`nearby-tag-${t}`);
    if (!tagEl || facilities.length === 0) return;

    let minDist = Infinity;
    facilities.forEach(f => {
      const d = haversineDistanceMeters(userPos[0], userPos[1], f.coords[0], f.coords[1]);
      if (d < minDist) minDist = d;
    });

    if (minDist !== Infinity) {
      tagEl.textContent = minDist >= 1000 ? `${(minDist / 1000).toFixed(1)}km` : `${Math.round(minDist)}m`;
    }
  });
}

function findNearestFacility(type) {
  const userPos = state.userCoords || RAGUNAN_MAP_CONFIG.center;
  const matches = getFacilitiesByType(type);

  if (!matches || matches.length === 0) {
    showGpsLiveToast(`Fasilitas jenis "${type}" belum tersedia di area ini.`);
    return;
  }

  // Cari fasilitas dengan jarak terdekat dari posisi pengguna saat ini
  let nearest = null;
  let minDistance = Infinity;

  matches.forEach(f => {
    const dist = haversineDistanceMeters(userPos[0], userPos[1], f.coords[0], f.coords[1]);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = f;
    }
  });

  if (!nearest) return;

  // Highlight pill yang dipilih
  document.querySelectorAll('.btn-nearby-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.facilityType === type);
  });

  // Animasi kamera terbang mulus ke lokasi fasilitas
  state.map.flyTo(nearest.coords, 18, {
    animate: true,
    duration: 1.2
  });

  // Buka detail drawer fasilitas
  openDetailDrawer(nearest);

  // Tampilkan toast notifikasi cerdas
  const distText = minDistance >= 1000 ? `${(minDistance / 1000).toFixed(1)} km` : `${Math.round(minDistance)} meter`;
  showGpsLiveToast(`📍 ${nearest.name} (${distText}) ditemukan! Tekan 'Mulai Navigasi' untuk panduan rute.`, 'near_me');
}

// =====================================================================
// FITUR CERDAS: LIVE FEEDING SHOW ALERT BANNER & AUTO ROTATION
// =====================================================================
let feedingScheduleInterval = null;
let currentFeedingIndex = 0;
let feedingAnimalsList = [];

function initLiveFeedingAlert() {
  const allAnimals = getActiveAnimals();
  feedingAnimalsList = allAnimals.filter(a => a.feedingTime && (a.feedingTimeHour !== undefined || a.feedingTime));

  if (feedingAnimalsList.length === 0) {
    const banner = document.getElementById('feeding-alert-banner');
    if (banner) banner.classList.add('hidden');
    return;
  }

  // Urutkan dan tampilkan jadwal show yang paling relevan saat ini
  updateFeedingAlertDisplay();

  // Auto-rotate jadwal setiap 14 detik jika ada lebih dari 1 satwa
  if (feedingScheduleInterval) clearInterval(feedingScheduleInterval);
  feedingScheduleInterval = setInterval(() => {
    const banner = document.getElementById('feeding-alert-banner');
    if (!state.isNavigating && banner && !banner.classList.contains('hidden') && banner.style.display !== 'none') {
      currentFeedingIndex = (currentFeedingIndex + 1) % feedingAnimalsList.length;
      renderFeedingAlert(feedingAnimalsList[currentFeedingIndex]);
    }
  }, 14000);

  // Event klik banner untuk lihat kandang satwa di peta
  const bannerContent = document.getElementById('feeding-alert-content');
  if (bannerContent) {
    bannerContent.onclick = () => {
      const curAnimal = feedingAnimalsList[currentFeedingIndex];
      if (curAnimal) {
        state.map.flyTo(curAnimal.coords, 18, { duration: 1 });
        openDetailDrawer(curAnimal);
      }
    };
  }

  // Event klik "Pandu Rute"
  const btnNavigate = document.getElementById('btn-feeding-navigate');
  if (btnNavigate) {
    btnNavigate.onclick = (e) => {
      e.stopPropagation();
      const curAnimal = feedingAnimalsList[currentFeedingIndex];
      if (curAnimal) {
        startNavigationToDestination(curAnimal);
      }
    };
  }

  // Event tombol tutup pemberitahuan banner
  const btnDismiss = document.getElementById('btn-feeding-dismiss');
  if (btnDismiss) {
    btnDismiss.onclick = (e) => {
      e.stopPropagation();
      const banner = document.getElementById('feeding-alert-banner');
      if (banner) {
        banner.classList.add('hidden');
        banner.style.display = 'none';
        state.feedingAlertDismissed = true;
      }
      showGpsLiveToast('Pemberitahuan jadwal pakan satwa ditutup.', 'check');
    };
  }
}

function updateFeedingAlertDisplay() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Urutkan jadwal feeding show: yang akan datang terdekat diletakkan paling awal
  feedingAnimalsList.sort((a, b) => {
    const aMin = (a.feedingTimeHour || 12) * 60 + (a.feedingTimeMinute || 0);
    const bMin = (b.feedingTimeHour || 12) * 60 + (b.feedingTimeMinute || 0);
    const diffA = aMin >= currentMinutes ? aMin - currentMinutes : aMin - currentMinutes + 1440;
    const diffB = bMin >= currentMinutes ? bMin - currentMinutes : bMin - currentMinutes + 1440;
    return diffA - diffB;
  });

  currentFeedingIndex = 0;
  renderFeedingAlert(feedingAnimalsList[0]);
}

function renderFeedingAlert(animal) {
  if (!animal || state.feedingAlertDismissed) return;

  const banner = document.getElementById('feeding-alert-banner');
  if (!banner) return;

  banner.style.display = '';
  banner.classList.remove('hidden');

  const avatar = document.getElementById('feeding-alert-avatar');
  const title = document.getElementById('feeding-alert-title');
  const sub = document.getElementById('feeding-alert-sub');
  const countdown = document.getElementById('feeding-alert-countdown');

  if (avatar) avatar.src = animal.img || animal.image || 'assets/hero_bg.jpg';
  if (title) title.textContent = `${animal.name} (${animal.feedingNote || 'Feeding Show'})`;
  if (sub) sub.textContent = `Jadwal: ${animal.feedingTime} • ${animal.categoryLabel || 'Satwa Konservasi'}`;

  // Hitung status selisih waktu
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const showMinutes = (animal.feedingTimeHour || 12) * 60 + (animal.feedingTimeMinute || 0);
  const diff = showMinutes - currentMinutes;

  if (countdown) {
    if (diff >= 0 && diff <= 15) {
      countdown.textContent = '🔥 Sedang Berlangsung!';
      countdown.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
    } else if (diff > 15 && diff <= 60) {
      countdown.textContent = `⏱️ ${diff} mnt lagi`;
      countdown.style.background = 'linear-gradient(135deg, #ea580c, #c2410c)';
    } else if (diff > 60) {
      countdown.textContent = animal.feedingTime;
      countdown.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
      countdown.textContent = `Pukul ${animal.feedingTime}`;
      countdown.style.background = 'linear-gradient(135deg, #15803d, #166534)';
    }
  }
}

// =====================================================================
// PELACAKAN SENSOR REAL GPS SECARA LIVE (GEOLOCATION API)
// =====================================================================
function startRealGpsTracking(forcePrompt = false) {
  const isInsecure = typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  if (!navigator.geolocation) {
    updateGpsIndicator('error', 'GPS Tidak Didukung');
    showGpsLiveToast('Sensor Geolocation tidak didukung di perangkat/browser ini.');
    if (window.self !== window.top) {
      try {
        parent.postMessage({
          type: 'GPS_STATUS_UPDATE',
          data: {
            isRealGps: false,
            errorReason: 'NOT_SUPPORTED',
            statusText: 'GPS Tidak Didukung',
            isInsecure
          }
        }, '*');
      } catch (e) {}
    }
    return;
  }

  updateGpsIndicator('searching', 'Mencari GPS...');

  const options = {
    enableHighAccuracy: true,
    maximumAge: 1500,
    timeout: 15000
  };

  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }

  state.gpsWatchId = navigator.geolocation.watchPosition(
    handleGpsPositionUpdate,
    handleGpsError,
    options
  );
}

// Pilar 1: Fungsi resmi untuk menghentikan pelacakan GPS agar hemat daya baterai
function stopRealGpsTracking() {
  if (state.gpsWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
  state.isUsingRealGPS = false;
  state.gpsAccuracy = null;
  state.lastGpsCoords = null;
  if (state.accuracyCircle && state.map) {
    state.map.removeLayer(state.accuracyCircle);
    state.accuracyCircle = null;
  }
  const oobBanner = document.getElementById('out-of-bounds-banner');
  if (oobBanner) oobBanner.style.display = 'none';
}

function handleGpsPositionUpdate(pos) {
  const rawLat = pos.coords.latitude;
  const rawLng = pos.coords.longitude;
  const accuracy = Math.round(pos.coords.accuracy || 15);

  // Pilar 3: GPS Jitter Low-Pass Smoothing Filter
  let lat = rawLat;
  let lng = rawLng;
  if (state.lastGpsCoords) {
    const jumpDist = haversineDistanceMeters(state.lastGpsCoords[0], state.lastGpsCoords[1], rawLat, rawLng);
    if (jumpDist < 2.5) {
      // Redam fluktuasi saat pengguna sedang berdiri/diam di bawah pohon
      lat = state.lastGpsCoords[0] * 0.85 + rawLat * 0.15;
      lng = state.lastGpsCoords[1] * 0.85 + rawLng * 0.15;
    } else {
      // Transisi pergerakan mulus saat berjalan
      const smoothingFactor = accuracy > 20 ? 0.45 : 0.75;
      lat = state.lastGpsCoords[0] * (1 - smoothingFactor) + rawLat * smoothingFactor;
      lng = state.lastGpsCoords[1] * (1 - smoothingFactor) + rawLng * smoothingFactor;
    }
  }
  state.lastGpsCoords = [lat, lng];
  const coords = [lat, lng];

  state.isUsingRealGPS = true;
  state.gpsAccuracy = accuracy;

  // Heading dari Geolocation (jika tersedia saat bergerak)
  if (pos.coords.heading !== null && !isNaN(pos.coords.heading) && pos.coords.heading >= 0) {
    state.userHeading = Math.round(pos.coords.heading);
    updateUserMarkerHeading(state.userHeading);
    rotateCompass(state.userHeading);
  }

  // Hitung jarak ke pusat Taman Margasatwa Ragunan
  const distToRagunan = haversineDistanceMeters(lat, lng, RAGUNAN_MAP_CONFIG.center[0], RAGUNAN_MAP_CONFIG.center[1]);
  const isInsideZoo = distToRagunan <= 2500;
  const distKmStr = (distToRagunan / 1000).toFixed(1);

  // Pilar 2: Tampilkan Out-of-Bounds Smart Banner jika berada di luar Ragunan
  const oobBanner = document.getElementById('out-of-bounds-banner');
  const oobDistance = document.getElementById('oob-distance');
  if (!isInsideZoo) {
    if (oobBanner && !state.isOobDismissed) {
      if (oobDistance) oobDistance.textContent = distKmStr;
      oobBanner.style.display = 'flex';
    }
  } else {
    if (oobBanner) oobBanner.style.display = 'none';
  }

  // Update posisi marker & lingkaran akurasi
  updateUserPosition(coords, isInsideZoo ? `GPS (±${accuracy}m)` : `GPS Real HP (~${distKmStr}km dari Ragunan)`);
  updateUserAccuracyCircle(coords, accuracy);

  // Update badge status di header internal jika ada
  updateGpsIndicator('active', isInsideZoo ? `GPS (±${accuracy}m)` : `Luar Ragunan (~${distKmStr}km)`);

  // Jika Follow-Me aktif dan pengguna berada di kawasan Ragunan, otomatis pusatkan peta
  if (state.isFollowMode) {
    if (isInsideZoo) {
      if (!state.hasInitialGpsFix) {
        state.map.flyTo(coords, 17, { duration: 1.2 });
      } else {
        state.map.panTo(coords, { animate: true, duration: 0.5 });
      }
    }
  }

  // Kirim status detail lengkap ke website utama
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'GPS_STATUS_UPDATE',
        data: {
          isRealGps: true,
          isInsideZoo,
          latitude: lat,
          longitude: lng,
          accuracy,
          distanceToRagunanKm: distKmStr,
          isInsecure: false
        }
      }, '*');
    } catch (e) {}
  }

  // Notifikasi banner pertama kali
  if (!state.hasInitialGpsFix) {
    state.hasInitialGpsFix = true;
    if (!isInsideZoo) {
      showGpsLiveToast(`GPS Real Aktif: Anda berjarak ~${distKmStr} km dari Ragunan. Anda dapat memilih gerbang simulasi di peta.`, 'near_me', 6000);
    } else {
      showGpsLiveToast(`GPS Real Aktif di Ragunan: Akurasi ±${accuracy}m.`, 'my_location', 4000);
    }
  }
}

function handleGpsError(err) {
  console.warn('GPS Error:', err);
  state.isUsingRealGPS = false;
  state.gpsAccuracy = null;
  let statusText = 'Mencari GPS...';
  let errorReason = 'UNKNOWN';

  const isInsecure = typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  if (isInsecure) {
    statusText = 'HTTP Batasi GPS';
    errorReason = 'INSECURE_ORIGIN';
    showGpsLiveToast('Browser membatasi GPS pada koneksi HTTP (bukan HTTPS). Gunakan titik gerbang simulasi atau aktifkan izin.', 'warning', 6000);
  } else if (err.code === err.PERMISSION_DENIED) {
    statusText = 'Izin Lokasi Ditolak';
    errorReason = 'PERMISSION_DENIED';
    showGpsLiveToast('Akses GPS ditolak. Silakan izinkan akses lokasi di browser HP Anda.', 'warning', 5000);
  } else if (err.code === err.POSITION_UNAVAILABLE) {
    statusText = 'Sinyal GPS Lemah';
    errorReason = 'POSITION_UNAVAILABLE';
    showGpsLiveToast('Sinyal GPS lemah atau tidak tersedia di dalam ruangan.', 'satellite_alt', 5000);
  } else if (err.code === err.TIMEOUT) {
    statusText = 'GPS Timeout';
    errorReason = 'TIMEOUT';
  }

  updateGpsIndicator('error', statusText);

  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'GPS_STATUS_UPDATE',
        data: {
          isRealGps: false,
          errorReason,
          statusText,
          isInsecure,
          latitude: state.userCoords[0],
          longitude: state.userCoords[1]
        }
      }, '*');
    } catch (e) {}
  }
}

function updateGpsIndicator(status, labelText) {
  const pill = document.getElementById('btn-gps-status');
  const textEl = document.getElementById('gps-status-text');
  if (!pill || !textEl) return;

  textEl.textContent = labelText;

  if (status === 'active') {
    pill.classList.add('active');
  } else {
    pill.classList.remove('active');
  }
}

function showGpsLiveToast(text, iconName = 'near_me', duration = 4000) {
  const banner = document.getElementById('gps-live-banner');
  const bannerText = document.getElementById('gps-live-banner-text');
  const bannerIcon = document.getElementById('gps-live-banner-icon');
  if (!banner || !bannerText) return;

  // Bersihkan teks dari emoji karakter
  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '').trim();

  bannerText.textContent = cleanText;
  if (bannerIcon) {
    bannerIcon.textContent = iconName;
  }
  banner.classList.add('active');

  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    banner.classList.remove('active');
  }, duration);
}

// Utilitas jarak titik ke segmen garis (proyeksi ortogonal)
function distanceToSegmentMeters(p, a, b) {
  const dx = b[1] - a[1];
  const dy = b[0] - a[0];
  if (dx === 0 && dy === 0) {
    return haversineDistanceMeters(p[0], p[1], a[0], a[1]);
  }
  const t = Math.max(0, Math.min(1, ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / (dx * dx + dy * dy)));
  const projLat = a[0] + t * dy;
  const projLng = a[1] + t * dx;
  return haversineDistanceMeters(p[0], p[1], projLat, projLng);
}

function calculateDistanceToPolyline(point, coordinates) {
  if (!coordinates || coordinates.length === 0) return 0;
  if (coordinates.length === 1) return haversineDistanceMeters(point[0], point[1], coordinates[0][0], coordinates[0][1]);
  let min = Infinity;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const d = distanceToSegmentMeters(point, coordinates[i], coordinates[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

// Cek Kemajuan Berjalan Real Pengguna & Instruksi Belokan
function checkRealWalkingProgress(currentCoords) {
  if (!state.activeRoute || !state.activeRoute.steps) return;

  const steps = state.activeRoute.steps;
  const currentStep = steps[state.currentStepIndex];

  if (!currentStep) return;

  const distToFinal = haversineDistanceMeters(
    currentCoords[0],
    currentCoords[1],
    state.activeDestination.coords[0],
    state.activeDestination.coords[1]
  );

  // Jika sudah tiba di destinasi akhir (<= 15 meter)
  if (distToFinal <= 15) {
    triggerArrival();
    return;
  }

  // Update live estimasi jarak sisa & waktu di HUD
  const estMins = Math.max(1, Math.round(distToFinal / 75));
  const totalDistEl = document.getElementById('hud-total-dist');
  const estTimeEl = document.getElementById('hud-est-time');
  if (totalDistEl) totalDistEl.textContent = `${distToFinal} m`;
  if (estTimeEl) estTimeEl.textContent = `${estMins} Menit`;

  // Cek jarak ke belokan berikutnya
  let distToTurn = distToFinal;
  if (state.currentStepIndex < steps.length - 1) {
    const nextStep = steps[state.currentStepIndex + 1];
    if (nextStep.coords) {
      distToTurn = haversineDistanceMeters(
        currentCoords[0],
        currentCoords[1],
        nextStep.coords[0],
        nextStep.coords[1]
      );

      const maneuverWord = currentStep.instruction.split(' ')[0] || 'Lurus';
      const hudTurnDist = document.getElementById('hud-turn-distance');
      if (hudTurnDist) hudTurnDist.textContent = `${maneuverWord} • ${distToTurn}m`;

      if (distToTurn <= 20) {
        state.currentStepIndex++;
        updateNavigationHUD(state.activeRoute, state.currentStepIndex);
        state.voiceNavigator.speak(`${nextStep.instruction}. ${nextStep.subtext || ''}`);
      }
    }
  }

  // Kirimkan progres live ke portal Next.js parent
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'ROUTE_INFO_UPDATE',
        data: {
          isNavigating: true,
          totalDistance: distToFinal,
          durationMinutes: estMins,
          destinationName: state.activeDestination?.name || '',
          instruction: currentStep.instruction,
          roadName: currentStep.roadName || '',
          distanceToTurn: distToTurn,
          canopyPercentage: state.activeRoute.canopyPercentage || 80
        }
      }, '*');
    } catch (e) {}
  }

  // Pilar 4: Deteksi Deviasi Rute Otomatis (Off-Route / Salah Jalan):
  // Jika pengguna menyimpang > 35 meter dari rute terdekat, hitung ulang rute
  const now = Date.now();
  if (now - state.lastRecalculateTime > 8000) {
    const minDistanceToRoute = calculateDistanceToPolyline(currentCoords, state.activeRoute.coordinates);
    if (minDistanceToRoute > 35) {
      state.lastRecalculateTime = now;
      console.log('Pengguna menyimpang dari rute:', minDistanceToRoute, 'm. Menghitung ulang...');
      state.voiceNavigator.speak('Menghitung ulang rute pejalan kaki dari posisi GPS Anda.');
      showGpsLiveToast('Menghitung ulang rute dari posisi GPS...', 'sync');
      recalculateRouteFromCurrentGps();
    }
  }
}

async function recalculateRouteFromCurrentGps() {
  if (!state.activeDestination) return;
  const newRoute = await calculateRoute(state.userCoords, state.activeDestination.coords, state.routeMode);
  if (newRoute) {
    state.activeRoute = newRoute;
    state.currentStepIndex = 0;
    renderRouteOnMap(newRoute);
    updateNavigationHUD(newRoute, 0);
  }
}

// Inisialisasi Sensor Kompas / Gyroscope HP dengan Smoothing
function initDeviceOrientation() {
  if (!window.DeviceOrientationEvent) return;

  let currentFilteredHeading = 0;

  const handleOrientation = (event) => {
    let heading = null;
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null && !isNaN(event.alpha)) {
      heading = 360 - event.alpha;
    }

    if (heading !== null && !isNaN(heading)) {
      heading = (heading + 360) % 360;
      // Pilar 3: Interpolasi sudut lingkaran halus agar jarum kompas tidak bergetar
      let diff = (heading - currentFilteredHeading + 540) % 360 - 180;
      currentFilteredHeading = (currentFilteredHeading + diff * 0.35 + 360) % 360;
      state.userHeading = Math.round(currentFilteredHeading);
      rotateCompass(state.userHeading);
      updateUserMarkerHeading(state.userHeading);
    }
  };

  const requestCompassPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          state.deviceOrientationActive = true;
          showGpsLiveToast('Sensor kompas magnetik HP aktif.', 'explore');
        } else {
          showGpsLiveToast('Izin akses kompas ditolak.', 'warning');
        }
      } catch (e) {
        console.warn('Orientation permission error:', e);
      }
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      state.deviceOrientationActive = true;
    }
  };

  state.requestCompassPermission = requestCompassPermission;

  // Tombol Kompas: Meminta izin jika belum aktif, atau memusatkan peta menghadap utara
  const compassBtn = document.getElementById('btn-compass');
  if (compassBtn) {
    compassBtn.addEventListener('click', async () => {
      if (!state.deviceOrientationActive && typeof DeviceOrientationEvent.requestPermission === 'function') {
        await requestCompassPermission();
      } else {
        state.map.setView(state.userCoords, Math.max(state.map.getZoom(), 17), { animate: true });
        showGpsLiveToast('Peta dipusatkan ke posisi Anda (Menghadap Utara)', 'explore');
      }
    });
  }

  // Pada Android / Non-iOS, listener otomatis aktif
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    state.deviceOrientationActive = true;
  }
}

function rotateCompass(deg) {
  const needle = document.getElementById('compass-needle');
  if (needle) {
    needle.style.transform = `rotate(${deg}deg)`;
  }
}

function triggerArrival() {
  const destName = state.activeDestination?.name || 'tujuan';
  state.voiceNavigator.speak(`Selamat, Anda telah tiba di ${destName}! Nikmati kunjungan Anda di Ragunan.`);
  showGpsLiveToast(`Anda telah tiba di ${destName}!`, 'celebration');
  alert(`Anda telah tiba di tujuan: ${destName}!`);
  exitNavigation();
}

// =====================================================================
// ROUTE PLANNER (ORIGIN ⇄ DESTINATION)
// =====================================================================
function populateRoutePlannerDropdowns() {
  const destSelect = document.getElementById('select-destination');
  if (!destSelect) return;

  destSelect.innerHTML = '';

  const allFacilities = getActiveFacilities();

  // 1. Loket & Pintu Gerbang
  const gates = allFacilities.filter(f => f.category === 'pintu' || f.type === 'gate' || f.name.toLowerCase().includes('pintu'));
  if (gates.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🎟️ Loket & Pintu Masuk';
    gates.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }

  // 2. Toilet & Laktasi
  const toilets = allFacilities.filter(f => f.type === 'toilet' || f.name.toLowerCase().includes('toilet'));
  if (toilets.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🚻 Toilet & Ruang Laktasi';
    toilets.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }

  // 3. Musholla & Masjid
  const mushollas = allFacilities.filter(f => f.type === 'musholla' || f.name.toLowerCase().includes('musholla') || f.name.toLowerCase().includes('masjid'));
  if (mushollas.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🕌 Musholla & Tempat Ibadah';
    mushollas.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }

  // 4. Halte Kereta Wisata (Tram)
  const trams = allFacilities.filter(f => f.category === 'transportasi' || f.type === 'transport' || f.type === 'tram' || f.name.toLowerCase().includes('halte'));
  if (trams.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🚋 Halte Kereta Wisata (Tram)';
    trams.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }

  // 5. Kandang Satwa Ragunan
  const optGroupAnimal = document.createElement('optgroup');
  optGroupAnimal.label = '🐾 Kandang Satwa Ragunan';
  getActiveAnimals().forEach(animal => {
    const opt = document.createElement('option');
    opt.value = animal.id;
    opt.textContent = `${animal.name} (${animal.categoryLabel || 'Satwa'})`;
    optGroupAnimal.appendChild(opt);
  });
  destSelect.appendChild(optGroupAnimal);

  // 6. Kuliner & Pujasera
  const foods = allFacilities.filter(f => f.category === 'kuliner' || f.type === 'food' || f.name.toLowerCase().includes('pujasera') || f.name.toLowerCase().includes('kafe'));
  if (foods.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🍲 Pujasera & Kafe Rindang';
    foods.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }

  // 7. Pos Medis & Ranger
  const med = allFacilities.filter(f => f.type === 'medical' || f.type === 'security' || f.name.toLowerCase().includes('medis') || f.name.toLowerCase().includes('p3k'));
  if (med.length > 0) {
    const grp = document.createElement('optgroup');
    grp.label = '🏥 Pos Medis & Ranger P3K';
    med.forEach(fac => {
      const opt = document.createElement('option');
      opt.value = fac.id;
      opt.textContent = fac.name;
      grp.appendChild(opt);
    });
    destSelect.appendChild(grp);
  }
}

function handleExecutePlannerRoute() {
  const originVal = document.getElementById('select-origin').value;
  const destVal = document.getElementById('select-destination').value;

  // Cari koordinat titik origin yang dipilih
  let startCoords = state.userCoords;
  if (originVal === 'pintu_utara' && RAGUNAN_ROAD_NODES.n_pintu_utara) startCoords = RAGUNAN_ROAD_NODES.n_pintu_utara.coords;
  else if (originVal === 'pintu_barat' && RAGUNAN_ROAD_NODES.n_pintu_barat) startCoords = RAGUNAN_ROAD_NODES.n_pintu_barat.coords;
  else if (originVal === 'pintu_timur' && RAGUNAN_ROAD_NODES.n_pintu_timur) startCoords = RAGUNAN_ROAD_NODES.n_pintu_timur.coords;
  else if (originVal === 'pintu_selatan' && RAGUNAN_ROAD_NODES.n_pintu_selatan) startCoords = RAGUNAN_ROAD_NODES.n_pintu_selatan.coords;
  else if (originVal === 'danau_pelikan' && RAGUNAN_ROAD_NODES.n_danau_pusat) startCoords = RAGUNAN_ROAD_NODES.n_danau_pusat.coords;
  else if (originVal === 'schmutzer' && RAGUNAN_ROAD_NODES.n_schmutzer_gerbang) startCoords = RAGUNAN_ROAD_NODES.n_schmutzer_gerbang.coords;

  // Cari object destination
  const allTargets = getAllActivePOIs();
  const targetObj = allTargets.find(t => t.id === destVal);

  if (targetObj) {
    const originLabel = document.getElementById('select-origin').selectedOptions[0]?.text || 'Titik Awal';
    updateUserPosition(startCoords, originLabel);
    startNavigationToDestination(targetObj, startCoords);
  }
}

// =====================================================================
// DRAWER JADWAL FEEDING SHOW
// =====================================================================
function renderFeedingShowCards() {
  const container = document.getElementById('feeding-list-container');
  if (!container) return;

  container.innerHTML = '';

  const feedingAnimals = getActiveAnimals().filter(a => a.feedingTime);

  feedingAnimals.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'feeding-show-card';
    card.innerHTML = `
      <div class="feeding-card-left">
        <img src="${animal.img}" class="feeding-card-avatar" alt="${animal.name}">
        <div class="feeding-card-info">
          <h4>${animal.name}</h4>
          <p>${animal.feedingNote || 'Pemberian Pakan & Edukasi'}</p>
        </div>
      </div>
      <div class="feeding-card-right">
        <span class="feeding-time-pill">${animal.feedingTime}</span>
        <button class="btn-route-to-feeding" data-id="${animal.id}">
          <span class="material-symbols-outlined" style="font-size: 14px;">directions</span>
          Pandu Rute
        </button>
      </div>
    `;

    card.querySelector('.btn-route-to-feeding').addEventListener('click', () => {
      document.getElementById('feeding-drawer').classList.remove('open');
      startNavigationToDestination(animal);
    });

    container.appendChild(card);
  });
}

// =====================================================================
// AUDIO GUIDE CERITA RANGER
// =====================================================================
function playAudioGuide() {
  if (!state.activeDestination || !state.activeDestination.audioScript) return;

  if (state.isAudioGuidePlaying) {
    stopAudioGuide();
  } else {
    state.isAudioGuidePlaying = true;
    document.getElementById('audio-guide-title').textContent = 'Memutar Cerita Ranger...';
    document.getElementById('btn-play-audio-guide').style.background = 'var(--secondary-container)';

    state.voiceNavigator.speak(state.activeDestination.audioScript);

    setTimeout(() => {
      stopAudioGuide();
    }, 15000);
  }
}

function stopAudioGuide() {
  state.isAudioGuidePlaying = false;
  const titleEl = document.getElementById('audio-guide-title');
  const btnEl = document.getElementById('btn-play-audio-guide');
  if (titleEl) titleEl.textContent = 'Dengarkan Cerita Ranger';
  if (btnEl) btnEl.style.background = 'var(--surface-container-high)';
}

// =====================================================================
// FITUR "INGAT POSISI PARKIR KENDARAAN SAYA" (SAVED PARKING & GUIDE)
// =====================================================================

const PARKING_GATE_COORDS = {
  pintu_utara: {
    name: 'Area Parkir Pintu Utama (Utara)',
    coords: [-6.3045, 106.8198]
  },
  pintu_barat: {
    name: 'Area Parkir Pintu Barat (Kav. Polri)',
    coords: [-6.3105, 106.8130]
  },
  pintu_timur: {
    name: 'Area Parkir Pintu Timur (TB Simatupang)',
    coords: [-6.3132, 106.8272]
  }
};

const VEHICLE_LABELS = {
  car: { label: 'Mobil', icon: 'directions_car' },
  motor: { label: 'Motor', icon: 'two_wheeler' },
  bike: { label: 'Sepeda', icon: 'pedal_bike' }
};

function loadSavedParking() {
  try {
    const raw = localStorage.getItem('ragunan_saved_parking');
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.coords && Array.isArray(data.coords)) {
        state.savedParking = data;
        updateParkingButtonUI(true);
        renderParkingMarker();
      }
    }
  } catch (e) {
    console.warn('Gagal membaca data parkir dari localStorage:', e);
  }
}

function updateParkingButtonUI(isSaved) {
  const btn = document.getElementById('btn-parking-toggle');
  const label = document.getElementById('parking-btn-label');
  const icon = document.getElementById('parking-icon-symbol');
  const sidebarBadge = document.getElementById('sidebar-parking-badge');

  if (isSaved && state.savedParking) {
    if (btn) btn.classList.add('active');
    const vInfo = VEHICLE_LABELS[state.savedParking.vehicleType] || VEHICLE_LABELS.car;
    if (label) label.textContent = 'Parkir Saya';
    if (icon) icon.textContent = vInfo.icon;
    if (sidebarBadge) sidebarBadge.style.display = 'inline-block';
  } else {
    if (btn) btn.classList.remove('active');
    if (label) label.textContent = 'Parkir';
    if (icon) icon.textContent = 'local_parking';
    if (sidebarBadge) sidebarBadge.style.display = 'none';
  }

  // Notifikasi status parkir ke website utama
  if (window.self !== window.top) {
    try {
      parent.postMessage({
        type: 'PARKING_UPDATE',
        data: {
          isSaved: !!(isSaved && state.savedParking),
          parking: state.savedParking || null
        }
      }, '*');
    } catch (e) {}
  }
}

function renderParkingMarker() {
  if (state.parkingMarker) {
    state.map.removeLayer(state.parkingMarker);
    state.parkingMarker = null;
  }

  if (!state.savedParking) return;

  const vInfo = VEHICLE_LABELS[state.savedParking.vehicleType] || VEHICLE_LABELS.car;

  const customIcon = L.divIcon({
    className: 'custom-parking-marker-wrap',
    html: `
      <div class="parking-marker-pin" title="Posisi Parkir: ${state.savedParking.locationName}">
        <div class="parking-marker-pulse"></div>
        <span class="material-symbols-outlined" style="font-size: 20px;">${vInfo.icon}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });

  state.parkingMarker = L.marker(state.savedParking.coords, {
    icon: customIcon,
    zIndexOffset: 1200
  }).addTo(state.map);

  const notesHtml = state.savedParking.notes 
    ? `<div style="font-size: 11px; color: #555; background: #f5f3ec; padding: 4px 8px; border-radius: 4px; margin-top: 5px;"><strong>Catatan:</strong> ${escapeParkingHtml(state.savedParking.notes)}</div>` 
    : '';

  const popupContent = `
    <div style="font-family: var(--font-sans); min-width: 180px; padding: 3px;">
      <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--terracotta);">${vInfo.icon}</span>
        <strong style="font-size: 13px; color: var(--primary);">Parkir ${vInfo.label} Anda</strong>
      </div>
      <div style="font-size: 11.5px; color: var(--text-primary); font-weight: 500;">${state.savedParking.locationName}</div>
      ${notesHtml}
      <div style="font-size: 10px; color: #888; margin-top: 4px;">Disimpan: ${state.savedParking.savedAt}</div>
      <button id="btn-popup-nav-parking" style="margin-top: 8px; width: 100%; height: 32px; background: var(--terracotta); color: #ffffff; border: none; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.15s ease;">
        <span class="material-symbols-outlined" style="font-size: 16px;">directions_walk</span>
        Pandu Pulang ke Kendaraan
      </button>
    </div>
  `;

  state.parkingMarker.bindPopup(popupContent);
  state.parkingMarker.on('popupopen', () => {
    document.getElementById('btn-popup-nav-parking')?.addEventListener('click', () => {
      state.parkingMarker.closePopup();
      navigateBackToParking();
    });
  });
}

function escapeParkingHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

function updateLiveParkingDistance() {
  const distEl = document.getElementById('saved-parking-distance-text');
  if (!distEl || !state.savedParking) return;

  const dist = haversineDistanceMeters(
    state.userCoords[0],
    state.userCoords[1],
    state.savedParking.coords[0],
    state.savedParking.coords[1]
  );

  if (dist < 1000) {
    distEl.textContent = `± ${dist} meter dari posisi Anda saat ini`;
  } else {
    distEl.textContent = `± ${(dist / 1000).toFixed(1)} km dari posisi Anda saat ini`;
  }
}

function openParkingModal() {
  const modal = document.getElementById('parking-modal');
  if (!modal) return;

  const viewEmpty = document.getElementById('parking-view-empty');
  const viewSaved = document.getElementById('parking-view-saved');

  if (state.savedParking) {
    // Tampilan Saat Parkir Sudah Tersimpan
    if (viewEmpty) viewEmpty.style.display = 'none';
    if (viewSaved) viewSaved.style.display = 'block';

    const vInfo = VEHICLE_LABELS[state.savedParking.vehicleType] || VEHICLE_LABELS.car;
    const vIcon = document.getElementById('saved-vehicle-icon');
    const vLabel = document.getElementById('saved-vehicle-label');
    const timeEl = document.getElementById('saved-parking-time');
    const titleEl = document.getElementById('saved-parking-title');
    const notesEl = document.getElementById('saved-parking-notes-display');

    if (vIcon) vIcon.textContent = vInfo.icon;
    if (vLabel) vLabel.textContent = vInfo.label;
    if (timeEl) timeEl.textContent = `Tersimpan ${state.savedParking.savedAt}`;
    if (titleEl) titleEl.textContent = state.savedParking.locationName;
    if (notesEl) {
      if (state.savedParking.notes) {
        notesEl.textContent = `Catatan: ${state.savedParking.notes}`;
        notesEl.style.display = 'block';
      } else {
        notesEl.style.display = 'none';
      }
    }

    updateLiveParkingDistance();
  } else {
    // Tampilan Saat Belum Ada Parkir (Form Simpan Baru)
    if (viewEmpty) viewEmpty.style.display = 'block';
    if (viewSaved) viewSaved.style.display = 'none';

    state.parkingSelectedVehicle = 'car';
    state.parkingSelectedMethod = 'gps';
    document.querySelectorAll('.btn-vehicle').forEach(b => {
      b.classList.toggle('active', b.dataset.vehicle === 'car');
    });

    const btnGps = document.getElementById('btn-method-gps');
    const btnGate = document.getElementById('btn-method-gate');
    const gateWrap = document.getElementById('parking-gate-select-wrap');
    if (btnGps) {
      btnGps.classList.add('active');
      const radio = btnGps.querySelector('.method-radio');
      if (radio) {
        radio.textContent = 'radio_button_checked';
        radio.style.color = 'var(--primary)';
      }
    }
    if (btnGate) {
      btnGate.classList.remove('active');
      const radio = btnGate.querySelector('.method-radio');
      if (radio) {
        radio.textContent = 'radio_button_unchecked';
        radio.style.color = 'var(--text-tertiary)';
      }
    }
    if (gateWrap) gateWrap.style.display = 'none';
    const notesInput = document.getElementById('input-parking-notes');
    if (notesInput) notesInput.value = '';
  }

  modal.classList.add('open');
}

function closeParkingModal() {
  const modal = document.getElementById('parking-modal');
  if (modal) modal.classList.remove('open');
}

function saveParkingLocation() {
  let coords = null;
  let locationName = '';

  if (state.parkingSelectedMethod === 'gate') {
    const gateKey = document.getElementById('select-parking-gate')?.value || 'pintu_utara';
    const gateObj = PARKING_GATE_COORDS[gateKey] || PARKING_GATE_COORDS.pintu_utara;
    coords = [...gateObj.coords];
    locationName = gateObj.name;
  } else {
    coords = [...state.userCoords];
    locationName = state.userLocationName && state.userLocationName !== 'Mencari GPS...'
      ? `Posisi GPS (${state.userLocationName})`
      : 'Posisi GPS Anda Saat Tiba';
  }

  const notes = document.getElementById('input-parking-notes')?.value.trim() || '';
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const parkingData = {
    coords,
    vehicleType: state.parkingSelectedVehicle || 'car',
    locationName,
    notes,
    savedAt: timeStr
  };

  state.savedParking = parkingData;
  try {
    localStorage.setItem('ragunan_saved_parking', JSON.stringify(parkingData));
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
  }

  updateParkingButtonUI(true);
  renderParkingMarker();
  closeParkingModal();

  // Animasi ke posisi parkir yang baru disimpan
  state.map.flyTo(coords, 17, { duration: 0.8 });
  if (state.parkingMarker) {
    setTimeout(() => {
      state.parkingMarker.openPopup();
    }, 900);
  }

  const vLabel = VEHICLE_LABELS[parkingData.vehicleType]?.label || 'Kendaraan';
  showGpsLiveToast(`Posisi parkir ${vLabel} Anda berhasil disimpan!`, 'local_parking');
}

function deleteSavedParking() {
  state.savedParking = null;
  try {
    localStorage.removeItem('ragunan_saved_parking');
  } catch (e) {
    console.warn('Gagal menghapus dari localStorage:', e);
  }

  if (state.parkingMarker) {
    state.map.removeLayer(state.parkingMarker);
    state.parkingMarker = null;
  }

  updateParkingButtonUI(false);
  closeParkingModal();
  showGpsLiveToast('Posisi parkir kendaraan telah dihapus.', 'delete');
}

function navigateBackToParking() {
  if (!state.savedParking) {
    alert('Belum ada lokasi parkir tersimpan.');
    return;
  }

  closeParkingModal();

  const vInfo = VEHICLE_LABELS[state.savedParking.vehicleType] || VEHICLE_LABELS.car;
  const parkingDest = {
    id: 'saved_parking',
    name: `Parkir ${vInfo.label} (${state.savedParking.locationName})`,
    coords: state.savedParking.coords,
    icon: vInfo.icon,
    color: '#b85032',
    description: state.savedParking.notes ? `Catatan: ${state.savedParking.notes}` : 'Titik parkir kendaraan tersimpan'
  };

  startNavigationToDestination(parkingDest);
  showGpsLiveToast(`Memandu rute pejalan kaki kembali ke ${vInfo.label} Anda!`, 'directions_walk');
}

// =====================================================================
// FITUR "MODE KURATOR & STUDIO TITIK" (ADMIN POI STUDIO)
// =====================================================================

function toggleCuratorMode(enable = null) {
  const nextState = enable !== null ? enable : !state.isCuratorMode;
  state.isCuratorMode = nextState;

  const appContainer = document.getElementById('app-container');
  const banner = document.getElementById('curator-banner');
  const headerBtn = document.getElementById('btn-header-curator');
  const searchSection = document.getElementById('search-section');
  const filterBar = document.querySelector('.bottom-filter-bar');
  const floatingCard = document.getElementById('curator-floating-card');

  if (state.isCuratorMode) {
    appContainer?.classList.add('curator-mode-active');
    if (banner) banner.style.display = 'flex';
    if (headerBtn) headerBtn.classList.add('active');

    // Sembunyikan search bar & bottom filter bar agar TIDAK MENUMPUK dengan banner & card
    if (searchSection) searchSection.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';

    showGpsLiveToast('Mode Kurator Aktif: Klik pada peta untuk menaruh pin titik baru.', 'edit_location_alt');
  } else {
    appContainer?.classList.remove('curator-mode-active');
    if (banner) banner.style.display = 'none';
    if (headerBtn) headerBtn.classList.remove('active');

    // Kembalikan search bar & bottom filter bar jika tidak dalam navigasi
    if (searchSection && !state.isNavigating) searchSection.style.display = 'block';
    if (filterBar && !state.isNavigating) filterBar.style.display = 'block';

    // Bersihkan draft marker & sembunyikan floating card
    if (floatingCard) floatingCard.style.display = 'none';
    if (state.curatorDraftMarker) {
      state.map.removeLayer(state.curatorDraftMarker);
      state.curatorDraftMarker = null;
    }
    state.curatorDraftCoords = null;
    state.curatorDraftSnappedNode = null;

    showGpsLiveToast('Mode Kurator dinonaktifkan.', 'lock');
  }
}

function handleMapCuratorClick(coords) {
  state.curatorDraftCoords = coords;
  const nearestNode = findNearestPedestrianNode(coords);
  state.curatorDraftSnappedNode = nearestNode;

  // Pasang atau pindahkan draft pin di peta
  renderCuratorDraftMarker(coords);

  // Tampilkan Kartu Mengambang Aksi Cepat (TIDAK langsung membuka modal penuh)
  showCuratorFloatingCard(coords, nearestNode);
}

function showCuratorFloatingCard(coords, nearestNode) {
  const card = document.getElementById('curator-floating-card');
  const miniCoords = document.getElementById('curator-mini-coords');
  const miniSnap = document.getElementById('curator-mini-snap');

  if (miniCoords && coords) {
    miniCoords.textContent = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
  }
  if (miniSnap) {
    if (nearestNode) {
      miniSnap.innerHTML = `<span class="material-symbols-outlined" style="font-size: 13px; vertical-align: middle; color: var(--primary);">alt_route</span> Terhubung ke: ${nearestNode.name} (${nearestNode.distanceMeters}m)`;
    } else {
      miniSnap.innerHTML = `<span class="material-symbols-outlined" style="font-size: 13px; vertical-align: middle; color: var(--primary);">alt_route</span> Terhubung ke: Simpul jalur pejalan kaki`;
    }
  }

  if (card) {
    card.style.display = 'flex';
  }
}

function hideCuratorFloatingCard() {
  const card = document.getElementById('curator-floating-card');
  if (card) card.style.display = 'none';
}

function cancelCuratorDraft() {
  hideCuratorFloatingCard();
  if (state.curatorDraftMarker) {
    state.map.removeLayer(state.curatorDraftMarker);
    state.curatorDraftMarker = null;
  }
  state.curatorDraftCoords = null;
  state.curatorDraftSnappedNode = null;
  showGpsLiveToast('Draft pin dibatalkan.');
}

// =====================================================================
// KALIBRASI MULTI-SAMPEL GPS HP PETUGAS (ANTI-JITTER KANOPI POHON)
// =====================================================================

function startGpsMultiSamplingSurvey() {
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung sensor GPS Geolocation.');
    return;
  }

  const modal = document.getElementById('gps-calibration-modal');
  const sampleCountEl = document.getElementById('cal-sample-count');
  const progressFillEl = document.getElementById('cal-progress-fill');
  const accuracyDisplayEl = document.getElementById('cal-accuracy-display');
  const meterIndicatorEl = document.getElementById('cal-meter-indicator');
  const forceBtn = document.getElementById('btn-force-use-cal-gps');
  const statusMsgEl = document.getElementById('cal-status-msg');

  if (!modal) return;

  stopGpsMultiSamplingSurvey();

  state.calibrationSamples = [];
  if (sampleCountEl) sampleCountEl.textContent = '0 / 6 Sampel';
  if (progressFillEl) progressFillEl.style.width = '8%';
  if (accuracyDisplayEl) accuracyDisplayEl.textContent = 'Mencari sinyal satelit...';
  if (meterIndicatorEl) meterIndicatorEl.style.left = '75%';
  if (forceBtn) forceBtn.style.display = 'none';
  if (statusMsgEl) {
    statusMsgEl.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">info</span><span>Berdirilah tepat di depan kandang atau gerbang objek.</span>';
  }

  modal.classList.add('open');

  const TARGET_SAMPLES = 6;
  const MAX_WAIT_MS = 12000;

  state.calibrationTimer = setTimeout(() => {
    if (state.calibrationSamples.length >= 2) {
      finishGpsMultiSampling();
    } else {
      stopGpsMultiSamplingSurvey();
      modal.classList.remove('open');
      if (state.userCoords) {
        state.curatorDraftCoords = [...state.userCoords];
        const snapNode = findNearestPedestrianNode(state.userCoords);
        state.curatorDraftSnappedNode = snapNode;
        renderCuratorDraftMarker(state.userCoords);
        openCuratorModal(null, state.userCoords, snapNode);
        showGpsLiveToast('Waktu kalibrasi habis, menggunakan posisi GPS standar.', 'warning');
      } else {
        alert('Gagal mengunci sinyal GPS. Pastikan izin lokasi aktif dan Anda berada di luar ruangan.');
      }
    }
  }, MAX_WAIT_MS);

  state.calibrationWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy || 10;
      const heading = pos.coords.heading || state.userHeading || 0;

      state.calibrationSamples.push({ lat, lng, accuracy: acc, heading });

      const count = state.calibrationSamples.length;
      const pct = Math.min(100, Math.round((count / TARGET_SAMPLES) * 100));

      if (sampleCountEl) sampleCountEl.textContent = `${count} / ${TARGET_SAMPLES} Sampel`;
      if (progressFillEl) progressFillEl.style.width = `${pct}%`;
      if (accuracyDisplayEl) accuracyDisplayEl.textContent = `±${acc.toFixed(1)} meter`;

      let indPct = 50;
      if (acc <= 5) {
        indPct = 5 + (acc / 5) * 30;
      } else if (acc <= 10) {
        indPct = 35 + ((acc - 5) / 5) * 30;
      } else {
        indPct = Math.min(95, 65 + ((acc - 10) / 15) * 30);
      }
      if (meterIndicatorEl) meterIndicatorEl.style.left = `${indPct}%`;

      if (count >= 2 && forceBtn) {
        forceBtn.style.display = 'flex';
      }

      if (count >= TARGET_SAMPLES) {
        finishGpsMultiSampling();
      }
    },
    (err) => {
      console.warn('Calibration GPS Error:', err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 6000
    }
  );
}

function stopGpsMultiSamplingSurvey() {
  if (state.calibrationWatchId !== null) {
    navigator.geolocation.clearWatch(state.calibrationWatchId);
    state.calibrationWatchId = null;
  }
  if (state.calibrationTimer !== null) {
    clearTimeout(state.calibrationTimer);
    state.calibrationTimer = null;
  }
}

function finishGpsMultiSampling() {
  stopGpsMultiSamplingSurvey();

  const modal = document.getElementById('gps-calibration-modal');
  if (modal) modal.classList.remove('open');

  const samples = state.calibrationSamples;
  if (!samples || samples.length === 0) return;

  let validSamples = samples;
  if (samples.length >= 4) {
    const sortedByAcc = [...samples].sort((a, b) => a.accuracy - b.accuracy);
    validSamples = sortedByAcc.slice(0, samples.length - 1);
  }

  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let totalAcc = 0;

  validSamples.forEach(s => {
    const w = 1 / Math.max(1, s.accuracy * s.accuracy);
    totalWeight += w;
    weightedLat += s.lat * w;
    weightedLng += s.lng * w;
    totalAcc += s.accuracy;
  });

  const finalLat = weightedLat / totalWeight;
  const finalLng = weightedLng / totalWeight;
  const avgAccuracy = totalAcc / validSamples.length;
  const lastHeading = validSamples[validSamples.length - 1]?.heading || 0;

  state.curatorDraftCoords = [finalLat, finalLng];
  const snapNode = findNearestPedestrianNode(state.curatorDraftCoords);
  state.curatorDraftSnappedNode = snapNode;

  state.curatorSurveyMetadata = {
    method: 'GPS Smartphone Multi-Sample',
    accuracy: avgAccuracy,
    sampleCount: validSamples.length,
    heading: lastHeading,
    timestamp: new Date().toISOString()
  };

  renderCuratorDraftMarker(state.curatorDraftCoords);
  state.map.flyTo(state.curatorDraftCoords, 18, { duration: 0.8 });

  setTimeout(() => {
    openCuratorModal(null, state.curatorDraftCoords, snapNode);
  }, 600);

  showGpsLiveToast(`GPS Terkalibrasi: Akurasi ±${avgAccuracy.toFixed(1)}m (${validSamples.length} sampel satelit).`, 'center_focus_strong');
}

function handleFieldCameraCapture(file, type = 'animal') {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      if (type === 'animal') {
        state.curatorCapturedAnimalPhoto = compressedDataUrl;
        const previewImg = document.getElementById('preview-animal-photo');
        if (previewImg) previewImg.src = compressedDataUrl;

        const photoSelect = document.getElementById('select-animal-photo');
        const customPhotoInput = document.getElementById('input-animal-custom-photo');
        const cameraShotOpt = photoSelect?.querySelector('option[value="camera_shot"]');
        if (cameraShotOpt) {
          cameraShotOpt.style.display = 'block';
          cameraShotOpt.selected = true;
        }
        if (customPhotoInput) customPhotoInput.style.display = 'none';
        showGpsLiveToast('Foto satwa lapangan berhasil diambil!', 'photo_camera');
      } else {
        state.curatorCapturedFacPhoto = compressedDataUrl;
        const previewFacImg = document.getElementById('preview-facility-photo');
        const facPhotoNote = document.getElementById('fac-photo-note');
        if (previewFacImg) {
          previewFacImg.src = compressedDataUrl;
          previewFacImg.style.display = 'block';
        }
        if (facPhotoNote) facPhotoNote.style.display = 'none';
        showGpsLiveToast('Foto plang fasilitas berhasil diambil!', 'photo_camera');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderCuratorDraftMarker(coords) {
  if (state.curatorDraftMarker) {
    state.curatorDraftMarker.setLatLng(coords);
  } else {
    const draftIcon = L.divIcon({
      className: 'custom-draft-marker-wrap',
      html: `
        <div class="curator-draft-pin" title="Geser untuk mengatur titik presisi (Klik untuk isi data)">
          <div class="curator-draft-pulse"></div>
          <span class="material-symbols-outlined" style="font-size: 22px;">add_location_alt</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    state.curatorDraftMarker = L.marker(coords, {
      icon: draftIcon,
      draggable: true,
      zIndexOffset: 1500
    }).addTo(state.map);

    // Saat pin draft digeser (drag), update koordinat dan node terdekat di floating card & form
    state.curatorDraftMarker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      state.curatorDraftCoords = [newPos.lat, newPos.lng];
      const newNearest = findNearestPedestrianNode(state.curatorDraftCoords);
      state.curatorDraftSnappedNode = newNearest;
      updateCuratorCoordsDisplay(state.curatorDraftCoords, newNearest);
      showCuratorFloatingCard(state.curatorDraftCoords, newNearest);
    });

    // Mengetuk langsung pin draft juga membuka formulir
    state.curatorDraftMarker.on('click', () => {
      openCuratorModal(null, state.curatorDraftCoords, state.curatorDraftSnappedNode);
    });
  }
}

function updateCuratorCoordsDisplay(coords, nearestNode) {
  const coordsEl = document.getElementById('curator-coords-display');
  const snapEl = document.getElementById('curator-snap-node-display');
  if (coordsEl && coords) {
    coordsEl.textContent = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
  }
  if (snapEl) {
    if (nearestNode) {
      snapEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 13px; color: var(--primary);">alt_route</span> <span>Terhubung ke: ${nearestNode.name} (${nearestNode.distanceMeters}m)</span>`;
    } else {
      snapEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 13px; color: var(--primary);">alt_route</span> <span>Terhubung ke: Simpul pejalan kaki terdekat</span>`;
    }
  }
}

function openCuratorModal(poiToEdit = null, customCoords = null, nearestNode = null) {
  const modal = document.getElementById('curator-modal');
  if (!modal) return;

  hideCuratorFloatingCard();
  state.editingPOI = poiToEdit;

  const titleEl = document.getElementById('curator-modal-title');
  const subtitleEl = document.getElementById('curator-modal-subtitle');
  const btnSaveLabel = document.getElementById('btn-save-curator-label');
  const btnDelete = document.getElementById('btn-delete-curator-poi');

  const coords = poiToEdit ? poiToEdit.coords : (customCoords || state.curatorDraftCoords || state.userCoords);
  const snapNode = nearestNode || findNearestPedestrianNode(coords);

  updateCuratorCoordsDisplay(coords, snapNode);

  // Update accuracy badge & surveyor strip
  const accBadge = document.getElementById('curator-accuracy-badge');
  const surveyorInput = document.getElementById('input-surveyor-name');
  const methodText = document.getElementById('survey-method-text');

  let activeAccuracy = null;
  if (state.curatorSurveyMetadata && state.curatorSurveyMetadata.accuracy) {
    activeAccuracy = state.curatorSurveyMetadata.accuracy;
  } else if (poiToEdit && poiToEdit.surveyMetadata && poiToEdit.surveyMetadata.accuracy) {
    activeAccuracy = poiToEdit.surveyMetadata.accuracy;
  }

  if (accBadge) {
    if (activeAccuracy !== null) {
      accBadge.style.display = 'inline-flex';
      accBadge.textContent = `±${activeAccuracy.toFixed(1)}m (GPS HP)`;
      accBadge.className = activeAccuracy <= 5 ? 'badge-accuracy-optimal' : (activeAccuracy <= 10 ? 'badge-accuracy-fair' : 'badge-accuracy-weak');
    } else {
      accBadge.style.display = 'none';
    }
  }

  if (surveyorInput) {
    if (poiToEdit && poiToEdit.surveyor) {
      surveyorInput.value = poiToEdit.surveyor;
    } else {
      surveyorInput.value = localStorage.getItem('ragunan_ranger_name') || 'Ranger Ragunan';
    }
  }

  if (methodText) {
    methodText.textContent = state.curatorSurveyMetadata ? 'GPS HP (Multi-Sample)' : (poiToEdit?.surveyMetadata?.method || 'Manual / Pin Peta');
  }

  const previewAnimalImg = document.getElementById('preview-animal-photo');
  const previewFacIconSymbol = document.getElementById('preview-fac-icon-symbol');
  const previewFacImg = document.getElementById('preview-facility-photo');
  const facPhotoNote = document.getElementById('fac-photo-note');

  if (poiToEdit) {
    // Mode Edit POI
    titleEl.textContent = `Edit: ${poiToEdit.name}`;
    subtitleEl.textContent = `Perbarui rincian, foto, jam feeding, atau koordinat`;
    btnSaveLabel.textContent = `Perbarui Titik Ini`;
    btnDelete.style.display = poiToEdit.isCustom ? 'flex' : 'none';

    if (poiToEdit.isAnimal || poiToEdit.latin || poiToEdit.feedingTime) {
      switchCuratorTab('animal');
      document.getElementById('input-animal-name').value = poiToEdit.name || '';
      document.getElementById('input-animal-latin').value = poiToEdit.latin || '';
      document.getElementById('select-animal-category').value = poiToEdit.category || 'mamalia';
      document.getElementById('select-animal-status').value = poiToEdit.status || 'Rentan (VU)';
      document.getElementById('input-animal-origin').value = poiToEdit.origin || '';
      document.getElementById('input-animal-diet').value = poiToEdit.diet || '';
      document.getElementById('input-animal-feeding-time').value = poiToEdit.feedingTime || '';
      document.getElementById('input-animal-feeding-note').value = poiToEdit.feedingNote || '';
      document.getElementById('textarea-animal-desc').value = poiToEdit.description || '';
      document.getElementById('textarea-animal-audio').value = poiToEdit.audioScript || '';

      const photoSelect = document.getElementById('select-animal-photo');
      const customPhotoInput = document.getElementById('input-animal-custom-photo');
      if (poiToEdit.img && poiToEdit.img.startsWith('data:image')) {
        state.curatorCapturedAnimalPhoto = poiToEdit.img;
        const camOpt = photoSelect.querySelector('option[value="camera_shot"]');
        if (camOpt) {
          camOpt.style.display = 'block';
          camOpt.selected = true;
        }
        customPhotoInput.style.display = 'none';
        if (previewAnimalImg) previewAnimalImg.src = poiToEdit.img;
      } else if (poiToEdit.img && photoSelect.querySelector(`option[value="${poiToEdit.img}"]`)) {
        photoSelect.value = poiToEdit.img;
        customPhotoInput.style.display = 'none';
        if (previewAnimalImg) previewAnimalImg.src = poiToEdit.img;
      } else if (poiToEdit.img) {
        photoSelect.value = 'custom';
        customPhotoInput.style.display = 'block';
        customPhotoInput.value = poiToEdit.img;
        if (previewAnimalImg) previewAnimalImg.src = poiToEdit.img;
      } else {
        if (previewAnimalImg) previewAnimalImg.src = 'assets/giraffe.jpg';
      }
    } else {
      switchCuratorTab('facility');
      document.getElementById('input-fac-name').value = poiToEdit.name || '';
      document.getElementById('select-fac-type').value = poiToEdit.type || 'toilet';
      document.getElementById('select-fac-icon').value = poiToEdit.icon || 'wc';
      document.getElementById('textarea-fac-desc').value = poiToEdit.description || '';
      if (previewFacIconSymbol) previewFacIconSymbol.textContent = poiToEdit.icon || 'wc';
      if (poiToEdit.photo) {
        state.curatorCapturedFacPhoto = poiToEdit.photo;
        if (previewFacImg) {
          previewFacImg.src = poiToEdit.photo;
          previewFacImg.style.display = 'block';
        }
        if (facPhotoNote) facPhotoNote.style.display = 'none';
      } else {
        if (previewFacImg) previewFacImg.style.display = 'none';
        if (facPhotoNote) facPhotoNote.style.display = 'block';
      }
    }
  } else {
    // Mode Tambah Baru
    titleEl.textContent = `Studio Titik Ragunan`;
    subtitleEl.textContent = `Tambah & kurasi titik satwa atau fasilitas di peta`;
    btnSaveLabel.textContent = `Simpan Titik ke Peta`;
    btnDelete.style.display = 'none';

    // Reset default form
    document.getElementById('form-curator-animal').reset();
    document.getElementById('form-curator-facility').reset();
    document.getElementById('input-animal-custom-photo').style.display = 'none';
    const camOpt = document.getElementById('select-animal-photo')?.querySelector('option[value="camera_shot"]');
    if (camOpt && !state.curatorCapturedAnimalPhoto) camOpt.style.display = 'none';

    if (previewFacImg && !state.curatorCapturedFacPhoto) previewFacImg.style.display = 'none';
    if (facPhotoNote && !state.curatorCapturedFacPhoto) facPhotoNote.style.display = 'block';

    switchCuratorTab(state.curatorActiveTab || 'animal');

    if (previewAnimalImg) {
      previewAnimalImg.src = state.curatorCapturedAnimalPhoto || document.getElementById('select-animal-photo')?.value || 'assets/giraffe.jpg';
    }
    if (previewFacIconSymbol) {
      previewFacIconSymbol.textContent = document.getElementById('select-fac-icon')?.value || 'wc';
    }
  }

  modal.classList.add('open');
}

function closeCuratorModal() {
  const modal = document.getElementById('curator-modal');
  if (modal) modal.classList.remove('open');
  if (state.editingPOI) {
    state.editingPOI = null;
  }

  // Jika sedang dalam mode kurator dan ada draft pin, tampilkan kembali floating card
  if (state.isCuratorMode && state.curatorDraftCoords && state.curatorDraftMarker) {
    showCuratorFloatingCard(state.curatorDraftCoords, state.curatorDraftSnappedNode);
  }
}

function switchCuratorTab(tab) {
  state.curatorActiveTab = tab;
  document.querySelectorAll('.curator-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  const formAnimal = document.getElementById('form-curator-animal');
  const formFacility = document.getElementById('form-curator-facility');

  if (tab === 'animal') {
    if (formAnimal) formAnimal.style.display = 'block';
    if (formFacility) formFacility.style.display = 'none';
  } else {
    if (formAnimal) formAnimal.style.display = 'none';
    if (formFacility) formFacility.style.display = 'block';
  }
}

function saveCuratorPOI(continueNext = false) {
  const coords = state.curatorDraftCoords || state.editingPOI?.coords || state.userCoords;
  const nearestNode = state.curatorDraftSnappedNode || findNearestPedestrianNode(coords);
  const nodeId = nearestNode ? nearestNode.id : 'n_danau_pusat';

  const surveyorName = document.getElementById('input-surveyor-name')?.value.trim() || 'Ranger Ragunan';
  try {
    localStorage.setItem('ragunan_ranger_name', surveyorName);
  } catch (e) {}

  const surveyMeta = state.curatorSurveyMetadata || state.editingPOI?.surveyMetadata || {
    method: 'Manual GPS Map Tag',
    accuracy: 5.0,
    timestamp: new Date().toISOString()
  };

  let savedName = '';

  if (state.curatorActiveTab === 'animal') {
    const name = document.getElementById('input-animal-name').value.trim();
    if (!name) {
      alert('Mohon masukkan nama satwa.');
      return;
    }
    savedName = name;

    const latin = document.getElementById('input-animal-latin').value.trim();
    const category = document.getElementById('select-animal-category').value;
    const status = document.getElementById('select-animal-status').value;
    const origin = document.getElementById('input-animal-origin').value.trim();
    const diet = document.getElementById('input-animal-diet').value.trim();
    const feedingTime = document.getElementById('input-animal-feeding-time').value.trim();
    const feedingNote = document.getElementById('input-animal-feeding-note').value.trim();
    const desc = document.getElementById('textarea-animal-desc').value.trim();
    const audioScript = document.getElementById('textarea-animal-audio').value.trim();

    let img = document.getElementById('select-animal-photo').value;
    if (img === 'camera_shot' && state.curatorCapturedAnimalPhoto) {
      img = state.curatorCapturedAnimalPhoto;
    } else if (img === 'custom') {
      img = document.getElementById('input-animal-custom-photo').value.trim() || 'assets/giraffe.jpg';
    }

    const animalCategoryLabels = {
      mamalia: 'Mamalia Darat',
      karnivora: 'Predator Karnivora',
      aves: 'Unggas Air & Burung',
      reptil: 'Reptil Purba',
      primata: 'Primata & Kera',
      akuatik: 'Satwa Akuatik Danau',
      edukasi: 'Wisata Edukasi Satwa'
    };

    const categoryEmojis = {
      mamalia: '🦒',
      karnivora: '🦁',
      aves: '🦜',
      reptil: '🐊',
      primata: '🐵',
      akuatik: '🦢',
      edukasi: '🐾'
    };

    const newAnimal = {
      id: state.editingPOI?.id || `custom_animal_${Date.now()}`,
      name,
      latin: latin || name,
      category,
      categoryLabel: animalCategoryLabels[category] || 'Satwa Ragunan',
      coords: [...coords],
      nodeId,
      img,
      emoji: categoryEmojis[category] || '🐾',
      color: '#123326',
      status,
      origin: origin || 'Koleksi Konservasi Ragunan',
      diet: diet || 'Nutrisi Terpandu Zookeeper',
      feedingTime: feedingTime || null,
      feedingNote: feedingNote || 'Pemberian Pakan Terjadwal',
      description: desc || `Enclosure satwa ${name} di kawasan asri Taman Margasatwa Ragunan.`,
      funFacts: [
        `Satwa ${name} dirawat dengan pengawasan zookeeper berpengalaman.`,
        `Kandang dilengkapi area rindang dan pengayaan lingkungan alami.`
      ],
      audioScript: audioScript || `${name} adalah salah satu satwa istimewa penghuni Ragunan. Selamat menikmati kunjungan Anda.`,
      surveyor: surveyorName,
      surveyMetadata: surveyMeta,
      isCustom: true
    };

    if (state.editingPOI && state.editingPOI.isCustom) {
      const idx = state.customAnimals.findIndex(a => a.id === state.editingPOI.id);
      if (idx !== -1) state.customAnimals[idx] = newAnimal;
    } else {
      state.customAnimals.push(newAnimal);
    }
  } else {
    // Facility
    const name = document.getElementById('input-fac-name').value.trim();
    if (!name) {
      alert('Mohon masukkan nama fasilitas.');
      return;
    }
    savedName = name;

    const type = document.getElementById('select-fac-type').value;
    const icon = document.getElementById('select-fac-icon').value;
    const desc = document.getElementById('textarea-fac-desc').value.trim();

    const newFac = {
      id: state.editingPOI?.id || `custom_fac_${Date.now()}`,
      name,
      type,
      category: type === 'toilet' || type === 'musholla' || type === 'kuliner' ? 'kuliner' : (type === 'gate' ? 'pintu' : (type === 'halte' ? 'transportasi' : 'fasilitas')),
      coords: [...coords],
      nodeId,
      icon,
      color: '#4e735e',
      description: desc || `Fasilitas umum resmi Ragunan.`,
      photo: state.curatorCapturedFacPhoto || null,
      surveyor: surveyorName,
      surveyMetadata: surveyMeta,
      isCustom: true
    };

    if (state.editingPOI && state.editingPOI.isCustom) {
      const idx = state.customFacilities.findIndex(f => f.id === state.editingPOI.id);
      if (idx !== -1) state.customFacilities[idx] = newFac;
    } else {
      state.customFacilities.push(newFac);
    }
  }

  saveCustomPOIsToStorage();
  refreshAllPOIDisplays();
  hideCuratorFloatingCard();

  // Sinkronisasi otomatis ke Database PostgreSQL Backend
  try {
    const token = localStorage.getItem('sb-token') || '';
    const payload = {
      id: (state.curatorActiveTab === 'animal' ? newAnimal.id : newFac.id),
      name: savedName,
      category: state.curatorActiveTab === 'animal' ? (newAnimal.category || 'animal') : (newFac.type || 'toilet'),
      lat: coords[0],
      lng: coords[1],
      color: state.curatorActiveTab === 'animal' ? newAnimal.color : newFac.color,
      emoji: state.curatorActiveTab === 'animal' ? newAnimal.emoji : '📍',
      description: state.curatorActiveTab === 'animal' ? newAnimal.description : newFac.description,
      latin_name: state.curatorActiveTab === 'animal' ? newAnimal.latin : null,
      feeding_time: state.curatorActiveTab === 'animal' ? newAnimal.feedingTime : null,
      feeding_note: state.curatorActiveTab === 'animal' ? newAnimal.feedingNote : null,
      is_active: true
    };
    fetch('/api/gps-pois', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data => {
      if (data.data) {
        console.log('[Curator] Berhasil menyimpan titik ke database PostgreSQL:', data.data);
        fetchGpsPoisFromApi();
      }
    }).catch(e => {
      console.warn('[Curator] Titik disimpan lokal di browser:', e);
    });
  } catch (err) {
    console.warn('[Curator] Error sinkronisasi database:', err);
  }

  if (state.curatorDraftMarker) {
    state.map.removeLayer(state.curatorDraftMarker);
    state.curatorDraftMarker = null;
  }
  state.curatorDraftCoords = null;
  state.curatorDraftSnappedNode = null;
  state.curatorSurveyMetadata = null;
  state.curatorCapturedAnimalPhoto = null;
  state.curatorCapturedFacPhoto = null;

  closeCuratorModal();

  state.map.flyTo(coords, 17, { duration: 0.8 });

  if (continueNext) {
    showGpsLiveToast(`Titik \"${savedName}\" tersimpan! Silakan jalan ke objek berikutnya lalu tekan 'Tag Posisi HP'.`, 'check_circle');
  } else {
    showGpsLiveToast(`Titik \"${savedName}\" berhasil disimpan ke peta & database!`, 'check_circle');
  }
}

function deleteCuratorPOI() {
  if (!state.editingPOI) return;

  const targetId = state.editingPOI.id;
  const targetName = state.editingPOI.name;

  const conf = confirm(`Apakah Anda yakin ingin menghapus titik "${targetName}"?`);
  if (!conf) return;

  if (state.editingPOI.isAnimal || state.editingPOI.latin) {
    state.customAnimals = state.customAnimals.filter(a => a.id !== targetId);
  } else {
    state.customFacilities = state.customFacilities.filter(f => f.id !== targetId);
  }

  // Sinkronisasi hapus ke database backend PostgreSQL
  try {
    const token = localStorage.getItem('sb-token') || '';
    fetch(`/api/gps-pois/${encodeURIComponent(targetId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }).then(r => r.json()).then(data => {
      console.log('[Curator] Titik dihapus dari database:', targetId);
      fetchGpsPoisFromApi();
    }).catch(e => {
      console.warn('[Curator] Hapus titik offline:', e);
    });
  } catch (err) {
    console.warn('[Curator] Error sinkronisasi delete database:', err);
  }

  saveCustomPOIsToStorage();
  refreshAllPOIDisplays();
  hideCuratorFloatingCard();
  closeCuratorModal();
  showGpsLiveToast(`Titik "${targetName}" telah dihapus.`, 'delete');
}

function refreshAllPOIDisplays() {
  renderPOIMarkers();
  populateRoutePlannerDropdowns();
  renderFeedingShowCards();
}

// =====================================================================
// POI MANAGER & EKSPOR DATA (POI STUDIO)
// =====================================================================

function openPOIManagerModal() {
  const modal = document.getElementById('poi-manager-modal');
  if (!modal) return;

  renderPOIManagerList();
  modal.classList.add('open');
}

function closePOIManagerModal() {
  const modal = document.getElementById('poi-manager-modal');
  if (modal) modal.classList.remove('open');
}

function renderPOIManagerList() {
  const container = document.getElementById('poi-manager-list');
  if (!container) return;

  const allAnimals = getActiveAnimals();
  const allFacilities = getActiveFacilities();

  // Update stats
  const countAnimalsEl = document.getElementById('stat-count-animals');
  const countFacEl = document.getElementById('stat-count-facilities');
  const countCustomEl = document.getElementById('stat-count-custom');
  if (countAnimalsEl) countAnimalsEl.textContent = allAnimals.length;
  if (countFacEl) countFacEl.textContent = allFacilities.length;
  if (countCustomEl) countCustomEl.textContent = (state.customAnimals.length + state.customFacilities.length);

  container.innerHTML = '';

  const filterType = state.poiManagerFilterType || 'all';
  const query = (state.poiManagerSearchQuery || '').toLowerCase().trim();

  let items = [];
  if (filterType === 'all') {
    items = [...allAnimals.map(a => ({ ...a, isAnimal: true })), ...allFacilities.map(f => ({ ...f, isAnimal: false }))];
  } else if (filterType === 'animal') {
    items = allAnimals.map(a => ({ ...a, isAnimal: true }));
  } else if (filterType === 'facility') {
    items = allFacilities.map(f => ({ ...f, isAnimal: false }));
  } else if (filterType === 'custom') {
    items = [
      ...state.customAnimals.map(a => ({ ...a, isAnimal: true })),
      ...state.customFacilities.map(f => ({ ...f, isAnimal: false }))
    ];
  }

  if (query) {
    items = items.filter(it =>
      it.name.toLowerCase().includes(query) ||
      (it.latin && it.latin.toLowerCase().includes(query)) ||
      (it.category && it.category.toLowerCase().includes(query))
    );
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-tertiary); font-size: 12px;">
        Tidak ada data titik yang sesuai filter.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'poi-list-card';

    const iconHtml = item.isAnimal
      ? `<img src="${item.img || 'assets/giraffe.jpg'}" class="poi-list-avatar" alt="${item.name}">`
      : `<div class="poi-list-icon-box"><span class="material-symbols-outlined" style="font-size: 18px;">${item.icon || 'place'}</span></div>`;

    const subText = item.isAnimal
      ? `${item.latin || item.categoryLabel || 'Satwa'} • [${item.coords[0].toFixed(4)}, ${item.coords[1].toFixed(4)}]`
      : `${item.type || 'Fasilitas'} • [${item.coords[0].toFixed(4)}, ${item.coords[1].toFixed(4)}]`;

    card.innerHTML = `
      <div class="poi-list-left">
        ${iconHtml}
        <div class="poi-list-info">
          <h5>${item.name} ${item.isCustom ? '<span style="font-size: 9.5px; background: var(--terracotta-light); color: var(--terracotta); padding: 1px 4px; border-radius: 3px; font-weight: 700;">Custom</span>' : ''}</h5>
          <span>${subText}</span>
        </div>
      </div>
      <div class="poi-list-actions">
        <button class="btn-poi-action btn-view-poi" title="Lihat di Peta">
          <span class="material-symbols-outlined" style="font-size: 16px;">explore</span>
        </button>
        <button class="btn-poi-action btn-edit-poi" title="Edit Titik Ini">
          <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
        </button>
        ${item.isCustom ? `
          <button class="btn-poi-action btn-del-poi" title="Hapus Titik" style="color: var(--error);">
            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
          </button>
        ` : ''}
      </div>
    `;

    card.querySelector('.btn-view-poi').addEventListener('click', () => {
      closePOIManagerModal();
      state.map.flyTo(item.coords, 18, { duration: 0.8 });
      setTimeout(() => openDetailDrawer(item), 900);
    });

    card.querySelector('.btn-edit-poi').addEventListener('click', () => {
      closePOIManagerModal();
      openCuratorModal(item);
    });

    const delBtn = card.querySelector('.btn-del-poi');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        state.editingPOI = item;
        deleteCuratorPOI();
        renderPOIManagerList();
      });
    }

    container.appendChild(card);
  });
}

function exportPOIToJSON() {
  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'Taman Margasatwa Ragunan - Interactive Map Studio',
      totalAnimals: getActiveAnimals().length,
      totalFacilities: getActiveFacilities().length
    },
    animals: getActiveAnimals(),
    facilities: getActiveFacilities()
  };

  const jsonStr = JSON.stringify(data, null, 2);
  downloadTextFile('ragunan-poi-data.json', jsonStr, 'application/json');
  showGpsLiveToast('Berkas JSON berhasil diunduh!', 'inventory_2');
}

function exportPOIToGeoJSON() {
  const features = [];

  getActiveAnimals().forEach(animal => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [animal.coords[1], animal.coords[0]]
      },
      properties: {
        id: animal.id,
        name: animal.name,
        latin: animal.latin,
        category: animal.category,
        type: 'animal',
        status: animal.status,
        feedingTime: animal.feedingTime,
        description: animal.description
      }
    });
  });

  getActiveFacilities().forEach(fac => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [fac.coords[1], fac.coords[0]]
      },
      properties: {
        id: fac.id,
        name: fac.name,
        type: fac.type,
        category: fac.category,
        icon: fac.icon,
        description: fac.description
      }
    });
  });

  const geojson = {
    type: 'FeatureCollection',
    name: 'Ragunan Zoo POI',
    features
  };

  const geoStr = JSON.stringify(geojson, null, 2);
  downloadTextFile('ragunan-poi.geojson', geoStr, 'application/geo+json');
  showGpsLiveToast('Berkas GeoJSON (QGIS / GIS) berhasil diunduh!', 'map');
}

function copyPOIToClipboard() {
  const animalsCode = `export const RAGUNAN_ANIMALS = ${JSON.stringify(getActiveAnimals(), null, 2)};`;
  const facilitiesCode = `export const RAGUNAN_FACILITIES = ${JSON.stringify(getActiveFacilities(), null, 2)};`;
  const fullCode = `// Generated by Ragunan Zoo Studio\n\n${animalsCode}\n\n${facilitiesCode}\n`;

  const previewModal = document.getElementById('code-preview-modal');
  const textarea = document.getElementById('textarea-code-preview');
  if (textarea) textarea.value = fullCode;

  if (previewModal) previewModal.classList.add('open');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullCode).then(() => {
      showGpsLiveToast('Kode JavaScript disalin ke clipboard!', 'content_copy');
    }).catch(e => console.warn('Clipboard write error:', e));
  }
}

function importPOIFromFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      let importedCount = 0;

      if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
        parsed.features.forEach(feat => {
          if (feat.geometry && feat.geometry.type === 'Point' && Array.isArray(feat.geometry.coordinates)) {
            const lng = feat.geometry.coordinates[0];
            const lat = feat.geometry.coordinates[1];
            const props = feat.properties || {};

            if (props.type === 'animal' || props.latin) {
              state.customAnimals.push({
                id: props.id || `imported_animal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                name: props.name || 'Satwa Impor',
                latin: props.latin || '',
                category: props.category || 'mamalia',
                categoryLabel: 'Satwa Ragunan',
                coords: [lat, lng],
                nodeId: findNearestPedestrianNode([lat, lng])?.id || 'n_danau_pusat',
                img: 'assets/giraffe.jpg',
                emoji: '🐾',
                color: '#123326',
                status: props.status || 'Rentan (VU)',
                origin: props.origin || 'Indonesia',
                diet: props.diet || 'Herbivora',
                feedingTime: props.feedingTime || null,
                description: props.description || 'Satwa impor baru.',
                isCustom: true
              });
              importedCount++;
            } else {
              state.customFacilities.push({
                id: props.id || `imported_fac_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                name: props.name || 'Fasilitas Impor',
                type: props.type || 'toilet',
                category: props.category || 'fasilitas',
                coords: [lat, lng],
                nodeId: findNearestPedestrianNode([lat, lng])?.id || 'n_danau_pusat',
                icon: props.icon || 'place',
                color: '#4e735e',
                description: props.description || 'Fasilitas umum.',
                isCustom: true
              });
              importedCount++;
            }
          }
        });
      } else if (parsed.animals || parsed.facilities) {
        if (Array.isArray(parsed.animals)) {
          parsed.animals.forEach(a => {
            if (a.coords && !state.customAnimals.some(ex => ex.id === a.id)) {
              state.customAnimals.push({ ...a, isCustom: true });
              importedCount++;
            }
          });
        }
        if (Array.isArray(parsed.facilities)) {
          parsed.facilities.forEach(f => {
            if (f.coords && !state.customFacilities.some(ex => ex.id === f.id)) {
              state.customFacilities.push({ ...f, isCustom: true });
              importedCount++;
            }
          });
        }
      }

      saveCustomPOIsToStorage();
      refreshAllPOIDisplays();
      renderPOIManagerList();
      showGpsLiveToast(`Berhasil mengimpor ${importedCount} titik baru!`, 'download');
    } catch (err) {
      alert('Gagal membaca file JSON/GeoJSON. Pastikan format valid.');
      console.error('Import error:', err);
    }
  };
  reader.readAsText(file);
}

function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// =====================================================================
// EVENT LISTENERS & UI INTERACTION
// =====================================================================
function setupUIEventListeners() {
  // SIDEBAR DRAWER TOGGLES
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggleBtn = document.getElementById('btn-toggle-sidebar');
  const closeBtn = document.getElementById('btn-close-sidebar');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // SIDEBAR NAVIGATION ITEMS
  document.getElementById('nav-item-map')?.addEventListener('click', () => {
    closeSidebar();
    state.map.flyTo(RAGUNAN_MAP_CONFIG.center, 16);
  });

  document.getElementById('nav-item-route-planner')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('route-planner-card').classList.add('open');
    const searchSec = document.getElementById('search-section');
    if (searchSec) searchSec.style.display = 'none';
    const feedingBanner = document.getElementById('feeding-alert-banner');
    if (feedingBanner) feedingBanner.classList.add('hidden');
  });

  document.getElementById('nav-item-feeding')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('feeding-drawer').classList.add('open');
    document.body.classList.add('drawer-open');
    const filterBar = document.querySelector('.bottom-filter-bar');
    if (filterBar) filterBar.style.display = '';
    const nearbyStrip = document.getElementById('nearby-facilities-strip');
    if (nearbyStrip) nearbyStrip.style.display = '';
    const mapControls = document.querySelector('.map-controls-stack');
    if (mapControls) mapControls.style.display = '';
  });

  document.getElementById('nav-item-footways')?.addEventListener('click', () => {
    closeSidebar();
    togglePedestrianLayer();
  });

  document.getElementById('nav-item-tram')?.addEventListener('click', () => {
    closeSidebar();
    toggleTramRouteLayer();
  });

  document.getElementById('nav-item-parking')?.addEventListener('click', () => {
    closeSidebar();
    openParkingModal();
  });

  document.getElementById('nav-item-amenities')?.addEventListener('click', () => {
    closeSidebar();
    document.querySelector('.btn-filter-pill[data-category="kuliner"]').click();
  });

  document.getElementById('nav-item-sos')?.addEventListener('click', () => {
    closeSidebar();
    document.getElementById('sos-modal').classList.add('open');
  });

  document.getElementById('nav-item-curator')?.addEventListener('click', () => {
    closeSidebar();
    toggleCuratorMode(true);
  });

  document.getElementById('nav-item-poi-manager')?.addEventListener('click', () => {
    closeSidebar();
    openPOIManagerModal();
  });

  // ROUTE PLANNER CONTROLS
  document.getElementById('btn-close-planner')?.addEventListener('click', () => {
    document.getElementById('route-planner-card').classList.remove('open');
    const searchSec = document.getElementById('search-section');
    if (searchSec) searchSec.style.display = 'block';
    const feedingBanner = document.getElementById('feeding-alert-banner');
    if (feedingBanner && !state.isNavigating) feedingBanner.classList.remove('hidden');
  });

  document.getElementById('btn-swap-points')?.addEventListener('click', () => {
    // Swap effect animation
    const originSelect = document.getElementById('select-origin');
    const destSelect = document.getElementById('select-destination');
    const tempVal = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = tempVal;
  });

  document.getElementById('btn-execute-route')?.addEventListener('click', handleExecutePlannerRoute);

  // FEEDING DRAWER CLOSE
  document.getElementById('btn-close-feeding')?.addEventListener('click', closeFeedingDrawer);

  // LAYER SWITCHER MENU TOGGLE
  const layerSwitcherCard = document.getElementById('layer-switcher-card');
  document.getElementById('btn-open-layers')?.addEventListener('click', () => {
    layerSwitcherCard.classList.toggle('open');
  });

  document.getElementById('layer-opt-osm-hot')?.addEventListener('click', () => {
    setBasemap('osmHot');
    layerSwitcherCard.classList.remove('open');
  });

  document.getElementById('layer-opt-osm-std')?.addEventListener('click', () => {
    setBasemap('osmStandard');
    layerSwitcherCard.classList.remove('open');
  });

  document.getElementById('layer-opt-satellite')?.addEventListener('click', () => {
    setBasemap('satellite');
    layerSwitcherCard.classList.remove('open');
  });

  document.getElementById('layer-opt-footways')?.addEventListener('click', () => {
    togglePedestrianLayer();
  });

  document.getElementById('layer-opt-tram')?.addEventListener('click', () => {
    toggleTramRouteLayer();
  });

  // PENCARIAN & AUTOCOMPLETE
  const searchInput = document.getElementById('input-search');
  const searchResultsDropdown = document.getElementById('search-results-dropdown');
  const clearSearchBtn = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length === 0) {
      searchResultsDropdown.classList.remove('show');
      clearSearchBtn.classList.remove('visible');
      return;
    }

    clearSearchBtn.classList.add('visible');

    const allItems = getAllActivePOIs();
    const matches = allItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.latin && item.latin.toLowerCase().includes(query)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query))
    ).slice(0, 6);

    searchResultsDropdown.innerHTML = '';
    if (matches.length > 0) {
      matches.forEach(item => {
        const isAnimal = item.isAnimal || item.latin || item.img;
        const iconHtml = isAnimal
          ? `<img src="${item.img || 'assets/hero_bg.jpg'}" class="search-item-avatar" alt="${item.name}" onerror="this.src='assets/hero_bg.jpg'">`
          : `<div class="search-item-fac-box" style="background: ${FACILITY_COLORS[item.type] || item.color || '#0284c7'};"><span class="material-symbols-outlined">${item.icon || 'place'}</span></div>`;

        const itemEl = document.createElement('div');
        itemEl.className = 'search-item';
        itemEl.innerHTML = `
          ${iconHtml}
          <div class="search-item-info">
            <span class="search-item-title">${item.name}</span>
            <span class="search-item-sub">${item.latin || item.description || item.categoryLabel || ''}</span>
          </div>
        `;
        itemEl.addEventListener('click', () => {
          searchInput.value = item.name;
          searchResultsDropdown.classList.remove('show');
          document.body.classList.remove('search-active');
          openDetailDrawer(item);
        });
        searchResultsDropdown.appendChild(itemEl);
      });
      searchResultsDropdown.classList.add('show');
    } else {
      searchResultsDropdown.innerHTML = `
        <div style="padding: 12px 16px; font-size: 12px; color: #777;">
          Tidak ditemukan hasil untuk "${query}"
        </div>
      `;
      searchResultsDropdown.classList.add('show');
    }
  });

  const feedingBanner = document.getElementById('feeding-alert-banner');

  searchInput.addEventListener('focus', () => {
    document.body.classList.add('search-active');
    if (feedingBanner) feedingBanner.classList.add('hidden');
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.body.classList.remove('search-active');
      if (!searchInput.value.trim() && feedingBanner && !state.isFeedingDismissed && !state.isNavigating) {
        feedingBanner.classList.remove('hidden');
      }
    }, 250);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResultsDropdown.classList.remove('show');
    clearSearchBtn.classList.remove('visible');
    document.body.classList.remove('search-active');
    if (feedingBanner && !state.isFeedingDismissed && !state.isNavigating) {
      feedingBanner.classList.remove('hidden');
    }
  });

  // FILTER KATEGORI BOTTOM CHIPS
  document.querySelectorAll('.btn-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      renderPOIMarkers();
    });
  });

  // FITUR CERDAS: TOMBOL CARI FASILITAS TERDEKAT (ONE-TAP FINDER)
  document.querySelectorAll('.btn-nearby-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.facilityType;
      if (type) {
        findNearestFacility(type);
      }
    });
  });

  // ZOOM BUTTONS
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    state.map.zoomIn();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    state.map.zoomOut();
  });

  // LOCATE / RE-CENTER BUTTON KE GPS REAL
  document.getElementById('btn-locate-user').addEventListener('click', () => {
    state.isFollowMode = true;
    const fBtn = document.getElementById('btn-toggle-follow');
    if (fBtn) fBtn.classList.add('active');

    if (!state.isUsingRealGPS) {
      showGpsLiveToast('Meminta sensor GPS perangkat HP...', 'satellite_alt');
      startRealGpsTracking(true);
    }

    state.map.flyTo(state.userCoords, 18, { duration: 0.8 });
    if (state.isUsingRealGPS) {
      showGpsLiveToast(`Posisi GPS Real: Akurasi ±${state.gpsAccuracy || 10}m`, 'my_location');
    }
  });

  // FOLLOW-ME AUTO-CENTER TOGGLE
  const followBtn = document.getElementById('btn-toggle-follow');
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      state.isFollowMode = !state.isFollowMode;
      if (state.isFollowMode) {
        followBtn.classList.add('active');
        state.map.panTo(state.userCoords, { animate: true });
        showGpsLiveToast('Mode Ikuti Langkah GPS: Aktif', 'navigation');
      } else {
        followBtn.classList.remove('active');
        showGpsLiveToast('Mode Bebas: Peta tidak otomatis bergeser', 'pan_tool');
      }
    });
  }

  // Jika pengguna menggeser peta secara manual, nonaktifkan auto-follow sementara
  state.map.on('dragstart', () => {
    if (state.isFollowMode) {
      state.isFollowMode = false;
      const fBtn = document.getElementById('btn-toggle-follow');
      if (fBtn) fBtn.classList.remove('active');
    }
  });

  // 3D PERSPECTIVE TILT TOGGLE
  document.getElementById('btn-toggle-3d').addEventListener('click', () => {
    state.is3DMode = !state.is3DMode;
    const mapEl = document.getElementById('map');
    if (state.is3DMode) {
      mapEl.style.transform = 'perspective(900px) rotateX(25deg)';
      mapEl.style.transition = 'transform 0.4s ease-out';
      document.getElementById('btn-toggle-3d').style.background = 'var(--secondary-container)';
    } else {
      mapEl.style.transform = 'none';
      document.getElementById('btn-toggle-3d').style.background = 'rgba(255, 255, 255, 0.95)';
    }
  });

  // DETAIL DRAWER ACTIONS
  document.getElementById('btn-close-drawer').addEventListener('click', closeDetailDrawer);
  document.getElementById('btn-direct-here').addEventListener('click', () => {
    startNavigationToDestination();
  });
  document.getElementById('btn-play-audio-guide').addEventListener('click', playAudioGuide);

  // HUD ACTIONS
  document.getElementById('btn-exit-navigation').addEventListener('click', exitNavigation);

  // VOICE MUTE TOGGLE
  const voiceToggleBtn = document.getElementById('btn-voice-toggle');
  const voiceIconSymbol = document.getElementById('voice-icon-symbol');
  voiceToggleBtn.addEventListener('click', () => {
    const isUnmuted = state.voiceNavigator.toggleMute();
    if (isUnmuted) {
      voiceToggleBtn.classList.add('active');
      voiceIconSymbol.textContent = 'volume_up';
    } else {
      voiceToggleBtn.classList.remove('active');
      voiceIconSymbol.textContent = 'volume_off';
    }
  });

  // PREFERENSI RUTE (TEDUH VS TERCEPAT)
  const btnShaded = document.getElementById('btn-route-shaded');
  const btnFastest = document.getElementById('btn-route-fastest');

  if (btnShaded) {
    btnShaded.addEventListener('click', () => {
      btnShaded.classList.add('active');
      if (btnFastest) btnFastest.classList.remove('active');
      state.routeMode = 'shaded';
      if (state.isNavigating && state.activeDestination) {
        startNavigationToDestination(state.activeDestination);
      }
    });
  }

  if (btnFastest) {
    btnFastest.addEventListener('click', () => {
      btnFastest.classList.add('active');
      if (btnShaded) btnShaded.classList.remove('active');
      state.routeMode = 'fastest';
      if (state.isNavigating && state.activeDestination) {
        startNavigationToDestination(state.activeDestination);
      }
    });
  }

  // ACCORDION STEPS LIST TOGGLE
  const btnToggleSteps = document.getElementById('btn-toggle-steps');
  const stepsContainer = document.getElementById('steps-container-list');
  const stepsChevron = document.getElementById('steps-chevron');

  btnToggleSteps.addEventListener('click', () => {
    const isOpen = stepsContainer.classList.contains('open');
    if (isOpen) {
      stepsContainer.classList.remove('open');
      stepsChevron.style.transform = 'rotate(0deg)';
    } else {
      stepsContainer.classList.add('open');
      stepsChevron.style.transform = 'rotate(180deg)';
    }
  });

  // SOS MODAL
  const sosModal = document.getElementById('sos-modal');
  document.getElementById('btn-open-sos').addEventListener('click', () => {
    sosModal.classList.add('open');
  });
  document.getElementById('btn-close-sos').addEventListener('click', () => {
    sosModal.classList.remove('open');
  });

  // NAVIGATE TO MEDICAL FROM SOS
  document.getElementById('btn-navigate-medical').addEventListener('click', () => {
    sosModal.classList.remove('open');
    const medicalTarget = RAGUNAN_FACILITIES.find(f => f.id === 'pos_medis_p3k') || RAGUNAN_FACILITIES[0];
    startNavigationToDestination(medicalTarget);
  });

  // PICK LOCATION MODAL
  const locationPickerModal = document.getElementById('location-picker-modal');
  document.getElementById('btn-gps-status').addEventListener('click', () => {
    locationPickerModal.classList.add('open');
  });
  document.getElementById('btn-close-location-picker').addEventListener('click', () => {
    locationPickerModal.classList.remove('open');
  });

  document.querySelectorAll('.btn-pick-location').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      locationPickerModal.classList.remove('open');

      if (preset === 'device_gps') {
        startRealGpsTracking(true);
        state.isFollowMode = true;
        const fBtn = document.getElementById('btn-toggle-follow');
        if (fBtn) fBtn.classList.add('active');
        state.map.flyTo(state.userCoords, 18, { duration: 0.8 });
        showGpsLiveToast('Menggunakan Sensor GPS Real HP Anda', 'satellite_alt');
      } else if (RAGUNAN_ROAD_NODES[preset]) {
        const node = RAGUNAN_ROAD_NODES[preset];
        state.isFollowMode = false;
        const fBtn = document.getElementById('btn-toggle-follow');
        if (fBtn) fBtn.classList.remove('active');
        updateUserPosition(node.coords, node.name);
        updateGpsIndicator('active', node.name);
        state.map.flyTo(node.coords, 17);
        showGpsLiveToast(`Posisi dialihkan ke ${node.name}`, 'place');
      }
    });
  });

  // =====================================================================
  // EVENT LISTENERS: FITUR INGAT POSISI PARKIR KENDARAAN
  // =====================================================================
  // Buka Modal Parkir dari Header
  document.getElementById('btn-parking-toggle')?.addEventListener('click', openParkingModal);

  // Tutup Modal Parkir
  document.getElementById('btn-close-parking-modal')?.addEventListener('click', closeParkingModal);

  // Klik Area Luar Modal untuk Menutup
  const parkingModal = document.getElementById('parking-modal');
  parkingModal?.addEventListener('click', (e) => {
    if (e.target === parkingModal) closeParkingModal();
  });

  // Pemilihan Jenis Kendaraan (Mobil, Motor, Sepeda)
  document.querySelectorAll('.btn-vehicle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-vehicle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.parkingSelectedVehicle = btn.dataset.vehicle;
    });
  });

  // Pemilihan Metode Lokasi Parkir (GPS vs Kantung Parkir Resmi)
  const btnGps = document.getElementById('btn-method-gps');
  const btnGate = document.getElementById('btn-method-gate');
  const gateWrap = document.getElementById('parking-gate-select-wrap');

  btnGps?.addEventListener('click', () => {
    state.parkingSelectedMethod = 'gps';
    btnGps.classList.add('active');
    btnGate?.classList.remove('active');

    const radioGps = btnGps.querySelector('.method-radio');
    const radioGate = btnGate?.querySelector('.method-radio');
    if (radioGps) {
      radioGps.textContent = 'radio_button_checked';
      radioGps.style.color = 'var(--primary)';
    }
    if (radioGate) {
      radioGate.textContent = 'radio_button_unchecked';
      radioGate.style.color = 'var(--text-tertiary)';
    }
    if (gateWrap) gateWrap.style.display = 'none';
  });

  btnGate?.addEventListener('click', () => {
    state.parkingSelectedMethod = 'gate';
    btnGate?.classList.add('active');
    btnGps?.classList.remove('active');

    const radioGate = btnGate?.querySelector('.method-radio');
    const radioGps = btnGps?.querySelector('.method-radio');
    if (radioGate) {
      radioGate.textContent = 'radio_button_checked';
      radioGate.style.color = 'var(--primary)';
    }
    if (radioGps) {
      radioGps.textContent = 'radio_button_unchecked';
      radioGps.style.color = 'var(--text-tertiary)';
    }
    if (gateWrap) gateWrap.style.display = 'block';
  });

  // Tombol Simpan Titik Parkir
  document.getElementById('btn-confirm-save-parking')?.addEventListener('click', saveParkingLocation);

  // Tombol Pandu Pulang ke Kendaraan
  document.getElementById('btn-navigate-to-parking')?.addEventListener('click', navigateBackToParking);

  // Tombol Hapus / Ganti Posisi Parkir
  document.getElementById('btn-reset-parking')?.addEventListener('click', deleteSavedParking);

  // Pilar 2: Event Listener Tombol Out-of-Bounds Smart Simulation Teleport
  document.getElementById('btn-oob-north-gate')?.addEventListener('click', () => {
    if (RAGUNAN_ROAD_NODES && RAGUNAN_ROAD_NODES.n_pintu_utara) {
      const node = RAGUNAN_ROAD_NODES.n_pintu_utara;
      state.isUsingRealGPS = false;
      state.isFollowMode = false;
      updateUserPosition(node.coords, 'Pintu Masuk Utama (Utara) - Simulasi');
      state.map.flyTo(node.coords, 17, { duration: 1.2 });
      const oob = document.getElementById('out-of-bounds-banner');
      if (oob) oob.style.display = 'none';
      showGpsLiveToast('Titik awal simulasi aktif di Pintu Masuk Utama (Utara)', 'place', 4000);
      if (window.self !== window.top) {
        try {
          parent.postMessage({
            type: 'GPS_STATUS_UPDATE',
            data: {
              isRealGps: false,
              isInsideZoo: true,
              latitude: node.coords[0],
              longitude: node.coords[1],
              accuracy: 15,
              selectedLocationLabel: 'Pintu Masuk Utama (Utara)'
            }
          }, '*');
        } catch (e) {}
      }
    }
  });

  document.getElementById('btn-oob-west-gate')?.addEventListener('click', () => {
    if (RAGUNAN_ROAD_NODES && RAGUNAN_ROAD_NODES.n_pintu_barat) {
      const node = RAGUNAN_ROAD_NODES.n_pintu_barat;
      state.isUsingRealGPS = false;
      state.isFollowMode = false;
      updateUserPosition(node.coords, 'Pintu Barat (Kav. Polri) - Simulasi');
      state.map.flyTo(node.coords, 17, { duration: 1.2 });
      const oob = document.getElementById('out-of-bounds-banner');
      if (oob) oob.style.display = 'none';
      showGpsLiveToast('Titik awal simulasi aktif di Pintu Barat', 'place', 4000);
      if (window.self !== window.top) {
        try {
          parent.postMessage({
            type: 'GPS_STATUS_UPDATE',
            data: {
              isRealGps: false,
              isInsideZoo: true,
              latitude: node.coords[0],
              longitude: node.coords[1],
              accuracy: 15,
              selectedLocationLabel: 'Pintu Masuk Barat'
            }
          }, '*');
        } catch (e) {}
      }
    }
  });

  document.getElementById('btn-oob-dismiss')?.addEventListener('click', () => {
    state.isOobDismissed = true;
    const oob = document.getElementById('out-of-bounds-banner');
    if (oob) oob.style.display = 'none';
  });

  // =====================================================================
  // EVENT LISTENERS: MODE KURATOR & POI STUDIO
  // =====================================================================

  // Tampilkan tombol Studio HANYA jika parameter ?curator=true aktif di URL (Admin / Kurator internal)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('curator') === 'true') {
      const curatorBtn = document.getElementById('btn-header-curator');
      if (curatorBtn) curatorBtn.style.display = 'inline-flex';
    }
  } catch (e) {}

  // Tombol Studio di Header (Akses Cepat 1-Klik jika diizinkan)
  document.getElementById('btn-header-curator')?.addEventListener('click', () => toggleCuratorMode());

  // Tombol Tag Posisi HP di Banner (Kalibrasi Multi-Sampel Sinyal Satelit)
  document.getElementById('btn-curator-tag-my-gps')?.addEventListener('click', startGpsMultiSamplingSurvey);

  // Banner Actions
  document.getElementById('btn-curator-manager-banner')?.addEventListener('click', openPOIManagerModal);
  document.getElementById('btn-curator-exit-banner')?.addEventListener('click', () => toggleCuratorMode(false));

  // Floating Card Actions (Buka Form Lengkap / Batalkan Draft)
  document.getElementById('btn-open-curator-form')?.addEventListener('click', () => {
    openCuratorModal(null, state.curatorDraftCoords, state.curatorDraftSnappedNode);
  });
  document.getElementById('btn-cancel-curator-draft')?.addEventListener('click', cancelCuratorDraft);

  // Kontrol Modal Kalibrasi GPS Multi-Sampel
  document.getElementById('btn-force-use-cal-gps')?.addEventListener('click', finishGpsMultiSampling);
  document.getElementById('btn-cancel-gps-calibration')?.addEventListener('click', () => {
    stopGpsMultiSamplingSurvey();
    document.getElementById('gps-calibration-modal')?.classList.remove('open');
  });

  // Kamera HP Lapangan - Satwa & Fasilitas
  const btnCameraAnimal = document.getElementById('btn-trigger-camera-animal');
  const inputCameraAnimal = document.getElementById('input-camera-animal');
  btnCameraAnimal?.addEventListener('click', () => inputCameraAnimal?.click());
  inputCameraAnimal?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFieldCameraCapture(e.target.files[0], 'animal');
    }
  });

  const btnCameraFacility = document.getElementById('btn-trigger-camera-facility');
  const inputCameraFacility = document.getElementById('input-camera-facility');
  btnCameraFacility?.addEventListener('click', () => inputCameraFacility?.click());
  inputCameraFacility?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFieldCameraCapture(e.target.files[0], 'facility');
    }
  });

  // Curator Modal Tabs
  document.querySelectorAll('.curator-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchCuratorTab(btn.dataset.tab);
    });
  });

  // Curator Photo Select & Live Thumbnail Preview
  const animalPhotoSelect = document.getElementById('select-animal-photo');
  const customPhotoInput = document.getElementById('input-animal-custom-photo');
  const previewAnimalImg = document.getElementById('preview-animal-photo');

  animalPhotoSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (customPhotoInput) {
      customPhotoInput.style.display = val === 'custom' ? 'block' : 'none';
    }
    if (previewAnimalImg) {
      if (val === 'camera_shot') {
        previewAnimalImg.src = state.curatorCapturedAnimalPhoto || 'assets/giraffe.jpg';
      } else {
        previewAnimalImg.src = val === 'custom' ? (customPhotoInput?.value.trim() || 'assets/giraffe.jpg') : val;
      }
    }
  });

  customPhotoInput?.addEventListener('input', () => {
    if (previewAnimalImg && customPhotoInput.value.trim()) {
      previewAnimalImg.src = customPhotoInput.value.trim();
    }
  });

  // Curator Facility Icon & Live Icon Preview
  const facIconSelect = document.getElementById('select-fac-icon');
  const facIconSymbol = document.getElementById('preview-fac-icon-symbol');
  facIconSelect?.addEventListener('change', (e) => {
    if (facIconSymbol) facIconSymbol.textContent = e.target.value;
  });

  // Kalibrasi GPS Saya di Form Kurator (Panggil mesin multi-sampel)
  document.getElementById('btn-curator-use-gps')?.addEventListener('click', () => {
    startGpsMultiSamplingSurvey();
  });

  // Tombol Simpan POI Kurator (Simpan Biasa)
  document.getElementById('btn-save-curator-poi')?.addEventListener('click', () => saveCuratorPOI(false));

  // Tombol Simpan & Survei Titik Berikutnya (Estafet)
  document.getElementById('btn-save-and-next-poi')?.addEventListener('click', () => saveCuratorPOI(true));

  // Tombol Hapus POI Kurator
  document.getElementById('btn-delete-curator-poi')?.addEventListener('click', deleteCuratorPOI);

  // Tombol Tutup / Batal Modal Kurator
  document.getElementById('btn-close-curator-modal')?.addEventListener('click', closeCuratorModal);
  const curatorModal = document.getElementById('curator-modal');
  curatorModal?.addEventListener('click', (e) => {
    if (e.target === curatorModal) closeCuratorModal();
  });

  // POI Manager Modal
  document.getElementById('btn-close-poi-manager')?.addEventListener('click', closePOIManagerModal);
  const poiManagerModal = document.getElementById('poi-manager-modal');
  poiManagerModal?.addEventListener('click', (e) => {
    if (e.target === poiManagerModal) closePOIManagerModal();
  });

  // POI Manager Filter & Search
  document.getElementById('input-poi-manager-search')?.addEventListener('input', (e) => {
    state.poiManagerSearchQuery = e.target.value;
    renderPOIManagerList();
  });

  document.querySelectorAll('.btn-poi-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-poi-filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.poiManagerFilterType = btn.dataset.type;
      renderPOIManagerList();
    });
  });

  // Ekspor & Impor POI
  document.getElementById('btn-export-json')?.addEventListener('click', exportPOIToJSON);
  document.getElementById('btn-export-geojson')?.addEventListener('click', exportPOIToGeoJSON);
  document.getElementById('btn-copy-js-code')?.addEventListener('click', copyPOIToClipboard);

  const importBtn = document.getElementById('btn-trigger-import-file');
  const importInput = document.getElementById('input-file-poi-import');
  importBtn?.addEventListener('click', () => importInput?.click());
  importInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importPOIFromFile(e.target.files[0]);
    }
  });

  // Code Preview Modal
  document.getElementById('btn-close-code-preview')?.addEventListener('click', () => {
    document.getElementById('code-preview-modal')?.classList.remove('open');
  });

  document.getElementById('btn-copy-preview-clipboard')?.addEventListener('click', () => {
    const txt = document.getElementById('textarea-code-preview')?.value;
    if (txt && navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => {
        showGpsLiveToast('Berhasil menyalin kode ke clipboard!', 'content_copy');
      });
    }
  });

  const codePreviewModal = document.getElementById('code-preview-modal');
  codePreviewModal?.addEventListener('click', (e) => {
    if (e.target === codePreviewModal) codePreviewModal.classList.remove('open');
  });

  // Setup swipe-to-dismiss touch gestures for mobile bottom sheets
  setupDrawerTouchGestures();
}

// Inisialisasi saat window/DOM dimuat (tahan uji modul asinkron & iframe)
function bootMap() {
  if (state.map) return;
  initMap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMap);
  window.addEventListener('load', bootMap);
} else {
  bootMap();
}
