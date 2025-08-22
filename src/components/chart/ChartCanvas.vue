<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const props = defineProps({
    type: { type: String, required: true },
    data: { type: Object, required: true },
    options: { type: Object, default: () => ({}) },
    plugins: { type: Array, default: () => [] },
    // 숫자(px) 또는 '180px' 등 문자열 허용
    height: { type: [Number, String], default: 220 },
});

const canvasRef = ref(null);
let chart;

const boxStyle = computed(() => ({
    position: 'relative',
    width: '100%',
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}));

onMounted(() => {
    chart = new Chart(canvasRef.value.getContext('2d'), {
        type: props.type,
        data: props.data,
        options: { responsive: true, maintainAspectRatio: false, ...props.options },
        plugins: props.plugins,
    });
});

onBeforeUnmount(() => chart?.destroy());

watch(
    () => [props.data, props.options],
    () => {
        if (!chart) return;
        chart.data = props.data;
        chart.options = { responsive: true, maintainAspectRatio: false, ...props.options };
        chart.update();
    },
    { deep: true }
);
</script>

<template>
    <div class="chart-box" :style="boxStyle">
        <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block"></canvas>
    </div>
</template>

<style scoped>
.chart-box {
    display: block;
}
</style>
