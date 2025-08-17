<template>
  <div id="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import papa from 'papaparse';
import normalIcon from '@/assets/images/normal.png';
import injuredIcon from '@/assets/images/injured.png';

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=xy94wd1rn4';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = async () => {
    const map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(35.154914, 129.117059),
      zoom: 15,
    });

    let isOpenInfo = null;

    naver.maps.Event.addListener(map, 'click', () => {
      if (isOpenInfo) {
        isOpenInfo.close();
        isOpenInfo = null;
      }
    });

    let shelters = [];

    const fetchShelter = async () => {
      try {
        const response = await fetch('/shelters.csv');
        const csvText = await response.text();
        const parsedData = papa.parse(csvText, { header: true });
        const items = parsedData.data;
        console.log('Shelter Items:', items);

        shelters = [];

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

          naver.maps.Event.addListener(marker, 'click', () => {
            if (isOpenInfo) {
              isOpenInfo.close();
              if (isOpenInfo === infowindow) {
                isOpenInfo = null;
                return;
              }
            }

            infowindow.open(map, marker);
            isOpenInfo = infowindow;
          });

          shelters.push(marker);
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

/* 카드 전체 */
:deep(.info-card) {
  min-width: 240px;
  width: fit-content;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  background: #fff;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 상단 헤더: 좌측 이름, 우측 하트 */
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

/* 본문 줄 */
:deep(.info-body .info-line) {
  font-size: 13px;
  color: #333;
  margin: 4px 0;
}

/* 하트 아이콘 */
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
