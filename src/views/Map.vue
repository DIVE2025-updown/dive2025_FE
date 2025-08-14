<template>
  <div id="map"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import papa from 'papaparse';

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
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(item.lat, item.lng),
            map: map,
          });

          const contentString = `
            <div>
              <h4>${item.careNm}</h4>
              <p>${item.careAddr}</p>
              <p>전화번호: ${item.careTel}</p>
            </div>
          `;

          const infowindow = new naver.maps.InfoWindow({
            content: contentString,
          });

          naver.maps.Event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
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
</style>
