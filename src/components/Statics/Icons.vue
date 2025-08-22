<script setup>
defineProps({
    name: String,
});
</script>

<template>
    <svg v-if="name === 'dog-cat'" viewBox="0 0 100 50" fill="currentColor">
        <path
            d="M70,45 C70,45 60,48 55,42 C50,36 52,28 52,28 L50,22 C50,22 45,20 42,25 C39,30 40,38 40,38 L30,45 L25,35 L20,38 L15,30 C15,30 5,20 10,10 C15,0 25,5 25,5 L30,15 L38,12 C38,12 40,5 45,5 C50,5 52,12 52,12 L58,15 L62,10 L70,12 L75,20 L78,15 L85,20 L80,30 L85,38 L80,42 L70,45Z"
        />
        <path d="M75,48 C75,48 78,45 80,45 C82,45 85,48 85,48 L88,40 C88,40 90,35 85,35 C80,35 80,40 80,40 L78,45 L75,48Z" />
        <path d="M82,30 C82,30 80,25 85,25 C90,25 90,30 90,30 L88,35 L82,30Z" />
        <path d="M88,28 C88,28 92,25 95,28 C98,31 95,35 95,35 L90,32 L88,28Z" />
    </svg>
    <svg v-else-if="name === 'hourglass'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 22h14" />
        <path d="M5 2h14" />
        <path d="M17 2v6.5L9.5 12 17 15.5V22" />
        <path d="M7 2v6.5L14.5 12 7 15.5V22" />
    </svg>
    <svg v-else-if="name === '24h'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <path d="M16 2.5V5.5" stroke-linecap="round" />
        <path d="M8 2.5V5.5" stroke-linecap="round" />
        <path d="M2.5 8H5.5" stroke-linecap="round" />
        <path d="M2.5 16H5.5" stroke-linecap="round" />
        <path d="M18.5 8H21.5" stroke-linecap="round" />
        <path d="M18.5 16H21.5" stroke-linecap="round" />
    </svg>
    <svg v-else-if="name === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <rect x="7" y="14" width="2" height="2" />
        <rect x="11" y="14" width="2" height="2" />
        <rect x="15" y="14" width="2" height="2" />
    </svg>
    <svg v-else-if="name === 'dog-silhouette'" viewBox="0 0 200 200" fill="currentColor">
        <path
            d="M121.7,92.5c-3.4,0-6.2,2.8-6.2,6.2s2.8,6.2,6.2,6.2s6.2-2.8,6.2-6.2S125.1,92.5,121.7,92.5z M183.1,108.3 c-4.5-1.5-9.6-2.4-15-2.4c-4.4,0-8.6,0.6-12.5,1.7v-1.1c0-11.8-9.6-21.4-21.4-21.4c-1,0-2-0.1-3-0.2c-1.3-15.6-14.7-27.9-30.8-27.9 c-17,0-30.8,13.8-30.8,30.8c0,0.9,0,1.7,0.1,2.6c-2.6-1.1-5.4-1.7-8.4-1.7c-13.7,0-24.9,11.2-24.9,24.9v23.5 c0,1.9-0.5,3.8-1.5,5.5c-3,5.2-4.7,11.2-4.7,17.5c0,16.5,13.4,29.9,29.9,29.9h12.5v-18.7c0-6.9,5.6-12.5,12.5-12.5h2.9v-21.9 c0-6.9,5.6-12.5,12.5-12.5h3.1v-9.4c0-6.9,5.6-12.5,12.5-12.5h3.1v-6.2c0-5.8,4.7-10.5,10.5-10.5s10.5,4.7,10.5,10.5v18.7 c0,6.9,5.6,12.5,12.5,12.5h3.1v15.6c0,6.9,5.6-12.5,12.5-12.5h18.7c8,0,14.8-3.1,20-8.3c-1-0.7-1.9-1.5-2.8-2.5 C190.4,124.9,189,116.3,183.1,108.3z"
        />
    </svg>
    <svg v-else-if="name === 'cat-silhouette'" viewBox="0 0 200 200" fill="currentColor">
        <path
            d="M152.8,168.8H78.4c-1.4,0-2.5-1.1-2.5-2.5v-10.3c0-1.4,1.1-2.5,2.5-2.5h74.5c1.4,0,2.5,1.1,2.5,2.5v10.3 C155.3,167.6,154.2,168.8,152.8,168.8z M175,98.8c0,0-5.3-2.9-9-0.3c-3.8,2.6-1.2,8.1,0,10.1c1.2,2,0.6,9.1-3.6,11.3 c-4.2,2.2-10-1.2-12-2.1c-2-0.9-9.1-3.1-11.1,2.9s1.5,10.6,2.3,12.4c0.8,1.8,4,10.6-2.5,14.8C132.5,152,115,145,115,145v-22.5 c0-6.9-5.6-12.5-12.5-12.5H84.1c-6.9,0-12.5,5.6-12.5,12.5V145c0,0-2.3,15.8-19.1,14.9c-16.8-0.9-16.6-14.8-16.6-14.8v-20 c0-1.6,0-8.6-4.6-11.8c-4.6-3.2-9.6,0.3-9.6,0.3s-10,7.1-10.3-4.5c-0.3-11.6,1.2-22,1.2-22s-2-21.1,17.3-26.6 C60.2,54.6,70,68.8,70,68.8s4-15.3,19.3-17.3c15.3-2,20.5,12.8,20.5,12.8s7.1-12.3,17.8-12.3c10.8,0,14,8.1,14,8.1 s5.5-7.8,13.8-5.3c8.3,2.5,7.1,12.1,7.1,12.1S175,87.1,175,98.8z"
        />
    </svg>
    <svg v-else-if="name === 'house'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.69L17.31 10H6.69L12 4.69zM8 18v-6h8v6H8z" />
        <path d="M10 12h4v4h-4z" />
    </svg>
    <svg v-else-if="name === 'microchip'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12s2.545-5 7-5c4.455 0 7 5 7 5s-2.545 5-7 5c-4.455 0-7-5-7-5z" />
        <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
    </svg>
</template>
