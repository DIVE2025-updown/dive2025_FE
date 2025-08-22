<template>
  <div id="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAllShelters } from '@/api/shelter';
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
  부산동물보호센터: '#800080', // 보라색
  동물보호관리협회: '#008000', // 초록색
  '(사)동부동물보호협회': '#0000FF', // 파란색
  청조동물병원: '#FF0000', // 빨간색
  '(사)하얀비둘기': '#FFA500', // 주황색
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

// 각 구역 그룹의 Polygon 객체를 저장할 객체
const polygons = {};
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
      highlightPolygon(null); // 클릭 시 하이라이트 해제
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
            fillOpacity: 0.8,
          });
        });
      }
      activeDistrictGroup.value = groupName;
    };

    const fetchShelters = async () => {
      try {
        const shelters = await getAllShelters();

        // 폴리곤 렌더링 (username → 담당 구)
        emd.features.forEach((feature) => {
          const districtName = feature?.properties?.SIG_KOR_NM;
          if (!districtName) return;

          Object.entries(usernameToDistricts).forEach(([username, districts]) => {
            if (!Array.isArray(districts)) return;
            if (!districts.includes(districtName)) return;

            let coordinates = null;
            if (feature.geometry.type === 'Polygon') {
              coordinates = feature.geometry.coordinates;
            } else if (feature.geometry.type === 'MultiPolygon') {
              coordinates = feature.geometry.coordinates.flat();
            }

            if (!coordinates) return;

            coordinates.forEach((path) => {
              const polygonPath = path.map((coord) => new naver.maps.LatLng(coord[1], coord[0]));
              const groupColor = colorMap[username] || '#FF0000';

              const polygon = new naver.maps.Polygon({
                map: map,
                paths: polygonPath,
                fillColor: groupColor,
                fillOpacity: 0.3,
                strokeColor: groupColor,
                strokeOpacity: 0.2,
                strokeWeight: 1,
              });

              if (!polygons[username]) polygons[username] = [];
              polygons[username].push(polygon);
            });
          });
        });

        // 마커 + 인포윈도우 렌더링
        shelters.forEach((item) => {
          const {
            id,
            username,
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

          // 특징 라벨 가공(표시용)
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
            map: map,
            icon: {
              url: iconImage,
              size: new naver.maps.Size(50, 50),
              origin: new naver.maps.Point(0, 2),
              anchor: new naver.maps.Point(27, 30),
            },
            title: username,
          });

          // 인포윈도우
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

          // 인포윈도우 생성
          const infowindow = new naver.maps.InfoWindow({
            content: contentString,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            disableAnchor: false,
          });

          // 마커 클릭 시: 인포윈도우 토글 + 폴리곤 하이라이트(username 기준)
          naver.maps.Event.addListener(marker, 'click', () => {
            if (isOpenInfo) {
              if (isOpenInfo === infowindow) {
                isOpenInfo.close();
                isOpenInfo = null;
                highlightPolygon(null);
                return;
              } else {
                isOpenInfo.close();
                isOpenInfo = null;
              }
            }

            // username 기준 하이라이트 시도(매핑이 없으면 무시)
            if (username && polygons[username]) {
              highlightPolygon(username);
            } else {
              highlightPolygon(null);
            }

            // 인포윈도우 열기
            infowindow.open(map, marker);
            isOpenInfo = infowindow;
          });
        });
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    await fetchShelters();
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
