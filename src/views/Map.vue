<template>
  <div id="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import papa from 'papaparse';
import normalIcon from '@/assets/images/normal.png';
import injuredIcon from '@/assets/images/injured.png';
import emd from '@/assets/emd.json';

// 지도 중심
const props = defineProps({
  centerCoords: {
    type: Object,
    default: () => ({
      lat: 35.154914,
      lng: 129.012,
    }),
  },
});

// 각 구역 색
const colorMap = {
  '중, 서, 영도, 북': '#800080', // 보라색
  부산진: '#008000', // 초록색
  '해운대, 수영, 동래, 남, 금정, 기장군': '#0000FF', // 파란색
  연제: '#FF0000', // 빨간색
  '사하, 강서, 사상': '#FFA500', // 주황색
  동: '#4B0082', // 남색
};

// 각 구역 그룹의 Polygon 객체를 저장할 객체
const polygons = {};
// 현재 하이라이트된 구역 그룹을 추적하기 위한 변수
const activeDistrictGroup = ref(null);

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=xy94wd1rn4';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = async () => {
    const map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(props.centerCoords.lat, props.centerCoords.lng),
      zoom: 11,
    });

    let isOpenInfo = null;

    naver.maps.Event.addListener(map, 'click', () => {
      if (isOpenInfo) {
        isOpenInfo.close();
        isOpenInfo = null;
      }
    });

    // 폴리곤 하이라이트 함수
    const highlightPolygon = (groupName) => {
      // 이전에 하이라이트된 구역이 있다면 원래 색상으로 되돌리기
      if (activeDistrictGroup.value && polygons[activeDistrictGroup.value]) {
        polygons[activeDistrictGroup.value].forEach((polygon) => {
          const originalColor = colorMap[activeDistrictGroup.value];
          polygon.setOptions({
            fillColor: originalColor,
            fillOpacity: 0.3,
          });
        });
      }

      // 새로 선택된 구역 하이라이트
      if (polygons[groupName]) {
        polygons[groupName].forEach((polygon) => {
          const newColor = colorMap[groupName];
          polygon.setOptions({
            fillColor: newColor,
            fillOpacity: 0.8, // 불투명하게 변경
          });
        });
      }
      activeDistrictGroup.value = groupName;
    };

    const fetchShelter = async () => {
      try {
        const response = await fetch('/shelters.csv');
        const csvText = await response.text();
        const parsedData = papa.parse(csvText, { header: true }).data;
        const items = parsedData.filter((item) => item.careNm);
        console.log('Shelter Items:', items);

        // 폴리곤
        const cityGroups = [...new Set(items.map((item) => item.city))];

        emd.features.forEach((feature) => {
          const districtName = feature.properties.SIG_KOR_NM;
          cityGroups.forEach((cityGroup) => {
            const districtsInGroup = cityGroup
              .replace(/"/g, '')
              .split(',')
              .map((d) => d.trim() + (d.trim().endsWith('구') ? '' : '구'));
            if (districtsInGroup.includes(districtName)) {
              let coordinates;
              if (feature.geometry.type === 'Polygon') {
                coordinates = feature.geometry.coordinates;
              } else if (feature.geometry.type === 'MultiPolygon') {
                coordinates = feature.geometry.coordinates.flat();
              }

              if (coordinates) {
                coordinates.forEach((path) => {
                  const polygonPath = path.map(
                    (coord) => new naver.maps.LatLng(coord[1], coord[0])
                  );
                  const groupColor = colorMap[cityGroup] || '#FF0000';

                  const polygon = new naver.maps.Polygon({
                    map: map,
                    paths: polygonPath,
                    fillColor: groupColor,
                    fillOpacity: 0.3,
                    strokeColor: groupColor,
                    strokeOpacity: 0.2,
                    strokeWeight: 1,
                  });

                  // Polygon 객체를 polygons 객체에 저장
                  if (!polygons[cityGroup]) {
                    polygons[cityGroup] = [];
                  }
                  polygons[cityGroup].push(polygon);
                });
              }
            }
          });
        });

        // 마커
        items.forEach((item) => {
          let iconImage = injuredIcon;
          if (item.careNm === '(사)유기동물 및 동물보호관리협회') {
            iconImage = normalIcon;
          }

          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(item.lat, item.lng),
            map: map,
            icon: {
              url: iconImage,
              size: new naver.maps.Size(50, 50),
              origin: new naver.maps.Point(0, 2),
              anchor: new naver.maps.Point(27, 30),
            },
          });

          // info 창
          const contentString = `
             <div class="info-card">
               <div class="info-header">
                 <h4 class="care-name">${item.careNm}</h4>
                 <div class="heart-container">
                   <i class="fa-regular fa-heart"></i>
                   <i class="fa-solid fa-heart heart-fill"></i>
                   <span class="heart-text">70%</span>
                 </div>
               </div>
               <div class="info-body">
                 <p class="info-line">${item.careAddr}</p>
                 <p class="info-line">전화번호: ${item.careTel}</p>
                 <p class="info-line">수용현황: 7 / 10</p>
               </div>
             </div>
           `;

          const infowindow = new naver.maps.InfoWindow({
            content: contentString,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
          });

          // 마커 클릭 이벤트에 highlightPolygon 함수 연결
          naver.maps.Event.addListener(marker, 'click', () => {
            if (isOpenInfo) {
              isOpenInfo.close();
              if (isOpenInfo === infowindow) {
                isOpenInfo = null;
                // 동일한 마커를 다시 클릭하면 하이라이트 해제
                if (activeDistrictGroup.value) {
                  highlightPolygon(null);
                }
                return;
              }
            }
            highlightPolygon(item.city);

            infowindow.open(map, marker);
            isOpenInfo = infowindow;
          });
        });
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    await fetchShelter();
  };
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
