// ===== 散歩ルート自動生成アプリ =====

(function () {
  'use strict';

  // --- 定数 ---
  const DEFAULT_CENTER = [35.6812, 139.7671]; // 東京駅
  const DEFAULT_ZOOM = 15;
  const WALKING_SPEED_KMH = 4.5; // 平均歩行速度 km/h
  const STORAGE_KEY = 'walking-route-history';

  // --- DOM要素 ---
  const distanceSlider = document.getElementById('distance');
  const distanceValue = document.getElementById('distance-value');
  const routeTypeSelect = document.getElementById('route-type');
  const waypointsSlider = document.getElementById('waypoints');
  const waypointsValue = document.getElementById('waypoints-value');
  const generateBtn = document.getElementById('generate-btn');
  const locateBtn = document.getElementById('locate-btn');
  const clearBtn = document.getElementById('clear-btn');
  const routeInfo = document.getElementById('route-info');
  const totalDistanceEl = document.getElementById('total-distance');
  const estimatedTimeEl = document.getElementById('estimated-time');
  const waypointCountEl = document.getElementById('waypoint-count');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');

  // --- 地図の初期化 ---
  const map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // --- 状態管理 ---
  let currentPosition = null;
  let startMarker = null;
  let routePolyline = null;
  let waypointMarkers = [];

  // --- スライダー更新 ---
  distanceSlider.addEventListener('input', function () {
    distanceValue.textContent = this.value + ' km';
  });

  waypointsSlider.addEventListener('input', function () {
    waypointsValue.textContent = this.value + ' 地点';
  });

  // --- 現在地取得 ---
  locateBtn.addEventListener('click', function () {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    locateBtn.disabled = true;
    locateBtn.textContent = '取得中...';

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setStartPosition(lat, lng);
        locateBtn.disabled = false;
        locateBtn.textContent = '現在地を取得';
      },
      function (err) {
        let msg = '位置情報の取得に失敗しました。';
        if (err.code === 1) msg = '位置情報の使用が許可されていません。';
        if (err.code === 2) msg = '位置情報を取得できませんでした。';
        if (err.code === 3) msg = '位置情報の取得がタイムアウトしました。';
        alert(msg);
        locateBtn.disabled = false;
        locateBtn.textContent = '現在地を取得';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // --- 地図クリックで出発地点を設定 ---
  map.on('click', function (e) {
    setStartPosition(e.latlng.lat, e.latlng.lng);
  });

  function setStartPosition(lat, lng) {
    currentPosition = [lat, lng];

    if (startMarker) {
      startMarker.setLatLng(currentPosition);
    } else {
      startMarker = L.marker(currentPosition, {
        icon: createIcon('start'),
      })
        .addTo(map)
        .bindPopup('出発地点')
        .openPopup();
    }

    map.setView(currentPosition, DEFAULT_ZOOM);
    generateBtn.disabled = false;
  }

  // --- カスタムアイコン ---
  function createIcon(type) {
    const colors = {
      start: '#3182ce',
      waypoint: '#ed8936',
      end: '#38a169',
    };
    const color = colors[type] || '#3182ce';

    return L.divIcon({
      className: 'custom-marker',
      html: '<div style="'
        + 'width:16px;height:16px;border-radius:50%;'
        + 'background:' + color + ';'
        + 'border:3px solid #fff;'
        + 'box-shadow:0 2px 6px rgba(0,0,0,0.3);'
        + '"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12],
    });
  }

  // --- ルート生成 ---
  generateBtn.addEventListener('click', function () {
    if (!currentPosition) {
      alert('まず出発地点を設定してください。\n地図をクリックするか「現在地を取得」ボタンを押してください。');
      return;
    }
    generateRoute();
  });

  function generateRoute() {
    clearRoute();

    const targetDistance = parseFloat(distanceSlider.value);
    const routeType = routeTypeSelect.value;
    const numWaypoints = parseInt(waypointsSlider.value);

    var points;
    switch (routeType) {
      case 'loop':
        points = generateLoopRoute(currentPosition, targetDistance, numWaypoints);
        break;
      case 'out-and-back':
        points = generateOutAndBackRoute(currentPosition, targetDistance, numWaypoints);
        break;
      case 'random':
        points = generateRandomRoute(currentPosition, targetDistance, numWaypoints);
        break;
      default:
        points = generateLoopRoute(currentPosition, targetDistance, numWaypoints);
    }

    drawRoute(points);
    showRouteInfo(points);
    saveRoute(points, targetDistance, routeType);
  }

  // --- 周回コース生成 ---
  function generateLoopRoute(start, distanceKm, numPoints) {
    // 周回なので、出発地点を中心とした多角形状のルートを生成
    var radius = distanceKm / (2 * Math.PI) ; // おおよその半径 (km)
    var points = [];
    // ランダムにオフセット角度を設定して毎回異なるルートにする
    var angleOffset = Math.random() * 2 * Math.PI;

    for (var i = 0; i < numPoints; i++) {
      var angle = angleOffset + (2 * Math.PI * i) / numPoints;
      // 少しランダム性を加える（半径の±30%）
      var r = radius * (0.7 + Math.random() * 0.6);
      var point = offsetPosition(start, r, angle);
      points.push(point);
    }

    // 出発地点に戻る
    points.push([start[0], start[1]]);
    // 先頭に出発地点を追加
    points.unshift([start[0], start[1]]);

    return points;
  }

  // --- 往復コース生成 ---
  function generateOutAndBackRoute(start, distanceKm, numPoints) {
    // 片道の距離
    var halfDistance = distanceKm / 2;
    // ランダムな方角を決定
    var mainAngle = Math.random() * 2 * Math.PI;

    var outPoints = [start.slice()];
    var segmentDistance = halfDistance / Math.ceil(numPoints / 2);

    for (var i = 1; i <= Math.ceil(numPoints / 2); i++) {
      // 少し蛇行させる
      var angleVariation = mainAngle + (Math.random() - 0.5) * 0.5;
      var point = offsetPosition(outPoints[outPoints.length - 1], segmentDistance, angleVariation);
      outPoints.push(point);
    }

    // 復路は往路を逆順
    var returnPoints = outPoints.slice(0, -1).reverse();

    return outPoints.concat(returnPoints);
  }

  // --- ランダム探索コース生成 ---
  function generateRandomRoute(start, distanceKm, numPoints) {
    var points = [start.slice()];
    var segmentDistance = distanceKm / numPoints;
    var currentAngle = Math.random() * 2 * Math.PI;

    for (var i = 0; i < numPoints; i++) {
      // 前の方角を基準にランダムに曲がる
      currentAngle += (Math.random() - 0.5) * Math.PI;
      var point = offsetPosition(points[points.length - 1], segmentDistance, currentAngle);
      points.push(point);
    }

    // 最後に出発地点に戻る線を追加
    points.push([start[0], start[1]]);

    return points;
  }

  // --- 座標をオフセットする（距離 km, 角度 rad） ---
  function offsetPosition(origin, distanceKm, angleRad) {
    // 緯度1度 ≒ 111km, 経度1度 ≒ 111km * cos(lat)
    var dLat = (distanceKm * Math.cos(angleRad)) / 111;
    var dLng = (distanceKm * Math.sin(angleRad)) / (111 * Math.cos((origin[0] * Math.PI) / 180));
    return [origin[0] + dLat, origin[1] + dLng];
  }

  // --- ルート描画 ---
  function drawRoute(points) {
    // ポリラインを描画
    routePolyline = L.polyline(points, {
      color: '#3182ce',
      weight: 4,
      opacity: 0.8,
      smoothFactor: 1,
      dashArray: '10, 6',
    }).addTo(map);

    // 経由地点のマーカーを配置（始点と終点以外）
    for (var i = 1; i < points.length - 1; i++) {
      var marker = L.marker(points[i], {
        icon: createIcon('waypoint'),
      })
        .addTo(map)
        .bindPopup('経由地点 ' + i);
      waypointMarkers.push(marker);
    }

    // 出発地点マーカーを更新
    if (startMarker) {
      startMarker.setIcon(createIcon('start'));
      startMarker.setPopupContent('出発地点 / ゴール');
    }

    // 地図の表示範囲を調整
    map.fitBounds(routePolyline.getBounds().pad(0.1));
  }

  // --- ルート情報の表示 ---
  function showRouteInfo(points) {
    var totalDist = calculateTotalDistance(points);
    var timeMinutes = (totalDist / WALKING_SPEED_KMH) * 60;

    totalDistanceEl.textContent = totalDist.toFixed(2) + ' km';
    estimatedTimeEl.textContent = formatTime(timeMinutes);
    waypointCountEl.textContent = (points.length - 2) + ' 地点';

    routeInfo.classList.remove('hidden');
  }

  // --- 総距離を計算 ---
  function calculateTotalDistance(points) {
    var total = 0;
    for (var i = 0; i < points.length - 1; i++) {
      total += haversineDistance(points[i], points[i + 1]);
    }
    return total;
  }

  // --- Haversine公式で2点間の距離を計算 (km) ---
  function haversineDistance(p1, p2) {
    var R = 6371;
    var dLat = toRad(p2[0] - p1[0]);
    var dLng = toRad(p2[1] - p1[1]);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  // --- 時間フォーマット ---
  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    if (h > 0) {
      return h + '時間' + m + '分';
    }
    return m + '分';
  }

  // --- ルートをクリア ---
  clearBtn.addEventListener('click', clearRoute);

  function clearRoute() {
    if (routePolyline) {
      map.removeLayer(routePolyline);
      routePolyline = null;
    }
    waypointMarkers.forEach(function (m) {
      map.removeLayer(m);
    });
    waypointMarkers = [];
    routeInfo.classList.add('hidden');
  }

  // --- ルート履歴の保存 ---
  function saveRoute(points, distance, type) {
    var history = loadHistory();
    var typeLabels = {
      loop: '周回コース',
      'out-and-back': '往復コース',
      random: 'ランダム探索',
    };

    var entry = {
      id: Date.now(),
      date: new Date().toLocaleString('ja-JP'),
      points: points,
      distance: calculateTotalDistance(points).toFixed(2),
      type: typeLabels[type] || type,
      start: points[0],
    };

    history.unshift(entry);
    // 最大10件まで保存
    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      // localStorage が使えない場合は無視
    }

    renderHistory();
  }

  function loadHistory() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // --- 履歴の表示 ---
  function renderHistory() {
    var history = loadHistory();

    if (history.length === 0) {
      historySection.classList.add('hidden');
      return;
    }

    historySection.classList.remove('hidden');
    historyList.innerHTML = '';

    history.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML =
        '<div class="history-item-info">' +
        '<span class="history-item-date">' + escapeHtml(entry.date) + '</span>' +
        '<span class="history-item-detail">' + escapeHtml(entry.type) + ' - ' + escapeHtml(entry.distance) + ' km</span>' +
        '</div>' +
        '<button class="history-item-delete" data-id="' + entry.id + '" title="削除">&times;</button>';

      // ルートを復元
      item.querySelector('.history-item-info').addEventListener('click', function () {
        restoreRoute(entry);
      });

      // 削除
      item.querySelector('.history-item-delete').addEventListener('click', function (e) {
        e.stopPropagation();
        deleteHistoryEntry(entry.id);
      });

      historyList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function restoreRoute(entry) {
    clearRoute();
    setStartPosition(entry.start[0], entry.start[1]);
    drawRoute(entry.points);

    var totalDist = calculateTotalDistance(entry.points);
    var timeMinutes = (totalDist / WALKING_SPEED_KMH) * 60;
    totalDistanceEl.textContent = totalDist.toFixed(2) + ' km';
    estimatedTimeEl.textContent = formatTime(timeMinutes);
    waypointCountEl.textContent = (entry.points.length - 2) + ' 地点';
    routeInfo.classList.remove('hidden');
  }

  function deleteHistoryEntry(id) {
    var history = loadHistory().filter(function (e) {
      return e.id !== id;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      // ignore
    }
    renderHistory();
  }

  // --- 初期化 ---
  renderHistory();

  // 初期状態では地図をクリックして出発地点を設定するよう案内
  L.popup()
    .setLatLng(DEFAULT_CENTER)
    .setContent('地図をクリックして出発地点を選ぶか、<br>「現在地を取得」ボタンを押してください')
    .openOn(map);
})();
