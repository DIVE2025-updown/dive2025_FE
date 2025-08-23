<template>
  <div id="map"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAllShelters } from '@/api/shelter';
import { hoveredShelterId } from '@/stores/applications';
import normalIcon from '@/assets/images/normal.png';
import injuredIcon from '@/assets/images/injured.png';
import emd from '@/assets/emd.json';

const props = defineProps({
  centerCoords: {
    type: Object,
    default: () => ({
      lat: 35.1895543,
      lng: 129.0606416,
    }),
  },
});

const colorMap = {
  부산동물보호센터: '#800080', // 보라색
  동물보호관리협회: '#008000', // 초록색
  '(사)동부동물보호협회': '#0000FF', // 파란색
  청조동물병원: '#FF0000', // 빨간색
  '(사)하얀비둘기': '#000000', // 검정색
  동구종합동물병원: '#4B0082', // 남색
};

const usernameToDistricts = {
  부산동물보호센터: ['중구', '서구', '영도구', '북구'],
  동물보호관리협회: ['부산진구'],
  '(사)동부동물보호협회': ['해운대구', '수영구', '동래구', '남구', '금정구', '기장군'],
  청조동물병원: ['연제구'],
  '(사)하얀비둘기': ['사하구', '강서구', '사상구'],
  동구종합동물병원: ['동구'],
};

const polygons = {};
const activeDistrictGroup = ref(null);

let map = null;
let isOpenInfo = null;

const markersById = {};
const infoById = {};
const usernameById = {};

const highlightPolygon = (groupName) => {
  if (activeDistrictGroup.value && polygons[activeDistrictGroup.value]) {
    polygons[activeDistrictGroup.value].forEach((polygon) => {
      const originalColor = colorMap[activeDistrictGroup.value] || '#999999';
      polygon.setOptions({
        fillColor: originalColor,
        fillOpacity: 0.1,
      });
    });
  }
  if (polygons[groupName]) {
    polygons[groupName].forEach((polygon) => {
      const newColor = colorMap[groupName];
      polygon.setOptions({
        fillColor: newColor,
        fillOpacity: 0.3,
      });
    });
  }
  activeDistrictGroup.value = groupName;
};

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=xy94wd1rn4';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = async () => {
    map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(props.centerCoords.lat, props.centerCoords.lng),
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
    });

    naver.maps.Event.addListener(map, 'click', () => {
      if (isOpenInfo) {
        isOpenInfo.close();
        isOpenInfo = null;
      }
      highlightPolygon(null);
    });

    const pathByDistrict = {};
    emd.features.forEach((feature) => {
      const districtName = feature?.properties?.SIG_KOR_NM;
      if (!districtName) return;
      const geom = feature?.geometry;
      if (!geom) return;
      if (!pathByDistrict[districtName]) pathByDistrict[districtName] = [];
      if (geom.type === 'Polygon') {
        const rings = geom.coordinates[0] || [];
        const path = rings.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
        pathByDistrict[districtName].push(path);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly) => {
          const rings = poly[0] || [];
          const path = rings.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
          pathByDistrict[districtName].push(path);
        });
      }
    });

    Object.entries(usernameToDistricts).forEach(([username, districts]) => {
      const paths = [];
      districts.forEach((d) => {
        const ps = pathByDistrict[d];
        if (ps && ps.length) ps.forEach((p) => paths.push(p));
      });
      if (!paths.length) return;
      const polyList = paths.map(
        (p) =>
          new naver.maps.Polygon({
            map,
            paths: p,
            strokeColor: colorMap[username],
            strokeOpacity: 0.2,
            strokeWeight: 1,
            fillColor: colorMap[username],
            fillOpacity: 0.1,
          })
      );
      polygons[username] = polyList;
    });

    const fetchShelters = async () => {
      try {
        const shelters = await getAllShelters();
        shelters.forEach((item) => {
          const {
            id,
            username,
            description,
            tel,
            latitude,
            longitude,
            addr,
            shelterFeature,
            totalCapacity,
            curCapacity,
          } = item || {};

          if (latitude == null || longitude == null) return;

          const total = Number(totalCapacity) || 0;
          const curr = Number(curCapacity) || 0;
          const utilization = total > 0 ? Math.round((curr / total) * 100) : 0;

          const featureLabel = (() => {
            const raw = String(shelterFeature ?? '').toUpperCase();
            if (raw.includes('HOSPITAL')) return '병원 연계';
            if (raw.includes('CLINIC')) return '동물병원';
            if (raw.includes('CENTER')) return '보호센터';
            if (raw.includes('VET')) return '수의사 상주';
            return raw || '정보 없음';
          })();

          const iconImage = injuredIcon;

          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(Number(latitude), Number(longitude)),
            map,
            icon: {
              url: iconImage,
              size: new naver.maps.Size(50, 50),
              origin: new naver.maps.Point(0, 2),
              anchor: new naver.maps.Point(27, 30),
            },
            title: username,
          });

          const contentString = `
            <div class="info-card">
              <div class="info-header">
                <h4 class="care-name">${username ?? '보호소'}</h4>
                <div class="heart-container">
                  <i class="fa-regular fa-heart"></i>
                  <i class="fa-solid fa-heart heart-fill" style="clip-path: inset(calc(100% - ${utilization}%) 0 0 0);"></i>
                  <span class="heart-text">${utilization}%</span>
                </div>
              </div>
              <div class="info-body">
                <p class="info-line">${addr ?? '주소 정보 없음'}</p>
                <p class="info-line">전화번호: ${tel ?? '미등록'}</p>
                <p class="info-line">특징: ${featureLabel}</p>
                <p class="info-line">수용현황: ${curr} / ${total}</p>
              </div>
            </div>
          `;

          const infowindow = new naver.maps.InfoWindow({
            content: contentString,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            disableAnchor: false,
          });

          naver.maps.Event.addListener(marker, 'mouseover', () => {
            if (isOpenInfo && isOpenInfo !== infowindow) {
              isOpenInfo.close();
            }
            infowindow.open(map, marker);
            isOpenInfo = infowindow;
            if (username && polygons[username]) {
              highlightPolygon(username);
            } else {
              highlightPolygon(null);
            }
            marker.setAnimation(naver.maps.Animation.BOUNCE);
          });

          naver.maps.Event.addListener(marker, 'mouseout', () => {
            marker.setAnimation(null);
            highlightPolygon(null);
            infowindow.close();
          });

          if (id != null) {
            markersById[id] = marker;
            infoById[id] = infowindow;
            usernameById[id] = username || null;
          }
        });
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    await fetchShelters();

    const specialCoords = [
      {
        id: 7,
        name: '반려동물복지문화센터',
        addr: '부산광역시 연제구 거제시장로 18-6 6층',
        tel: '051-853-1335',
        lat: 35.181284145012,
        lng: 129.07183578763,
      },
      {
        id: 8,
        name: '유기동물입양센터',
        addr: '부산광역시 해운대구 해운대로 1187',
        tel: '051-749-5680',
        lat: 35.1795543,
        lng: 129.0756416,
      },
    ];

    specialCoords.forEach((c, idx) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(Number(c.lat), Number(c.lng)),
        map,
        icon: {
          url: normalIcon,
          size: new naver.maps.Size(50, 50),
          origin: new naver.maps.Point(0, 2),
          anchor: new naver.maps.Point(27, 30),
        },
        title: `입양센터 ${idx + 1}`,
      });

      const content = `
        <div class="info-card">
          <div class="info-header">
            <h4 class="care-name">${c.name}</h4>
          </div>
          <div class="info-body">
            <p class="info-line">${c.addr}</p>
            <p class="info-line">전화번호: ${c.tel}</p>
          </div>
        </div>
      `;

      const infowindow = new naver.maps.InfoWindow({
        content,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        disableAnchor: false,
      });

      naver.maps.Event.addListener(marker, 'mouseover', () => {
        if (isOpenInfo && isOpenInfo !== infowindow) isOpenInfo.close();
        infowindow.open(map, marker);
        isOpenInfo = infowindow;
        highlightPolygon(null);
        marker.setAnimation(naver.maps.Animation.BOUNCE);
      });

      naver.maps.Event.addListener(marker, 'mouseout', () => {
        marker.setAnimation(null);
        infowindow.close();
        highlightPolygon(null);
      });

      markersById[c.id] = marker;
      infoById[c.id] = infowindow;
      usernameById[c.id] = c.name;
    });
    highlightPolygon(null);
  };
});

watch(hoveredShelterId, (newId, oldId) => {
  if (!map || typeof naver === 'undefined') return;
  if (oldId && markersById[oldId]) {
    markersById[oldId].setAnimation(null);
    if (infoById[oldId]) infoById[oldId].close();
  }
  if (newId && markersById[newId]) {
    const marker = markersById[newId];
    const info = infoById[newId];
    if (isOpenInfo && isOpenInfo !== info) {
      isOpenInfo.close();
    }
    if (info) {
      info.open(map, marker);
      isOpenInfo = info;
    }
    const uname = usernameById[newId];
    if (uname && polygons[uname]) {
      highlightPolygon(uname);
    } else {
      highlightPolygon(null);
    }
    marker.setAnimation(naver.maps.Animation.BOUNCE);
  } else {
    highlightPolygon(null);
    if (isOpenInfo) {
      isOpenInfo.close();
      isOpenInfo = null;
    }
  }
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 97vh;
}

:deep(.info-card) {
  min-width: 240px;
  width: fit-content;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  background: #fff;
  font-family: 'Noto Sans KR', sans-serif;
}

:deep(.info-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
:deep(.care-name) {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0077cc;
}

:deep(.info-body .info-line) {
  font-size: 13px;
  color: #333;
  margin: 4px 0;
}

:deep(.heart-container) {
  position: relative;
  width: 40px;
  height: 40px;
}
:deep(.heart-container i) {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 40px;
  color: #ff6b6b;
}
:deep(.heart-fill) {
  clip-path: inset(calc(100% - 70%) 0 0 0);
}
:deep(.heart-text) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 2px #000;
}
</style>
