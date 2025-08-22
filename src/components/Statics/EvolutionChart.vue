<script setup>
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { EVOLUTION_DATA } from '@/components/Statics/constants';

// Chart.js 플러그인 등록
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const selectedYear = ref('2024');

const chartData = computed(() => ({
    labels: EVOLUTION_DATA.map((d) => d.year),
    datasets: [
        {
            label: 'Total dogs and cats',
            data: EVOLUTION_DATA.map((d) => d.total),
            borderColor: '#4F46E5',
            backgroundColor: '#4F46E5',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        },
        {
            label: 'Dogs',
            data: EVOLUTION_DATA.map((d) => d.dogs),
            borderColor: '#D9534F',
            backgroundColor: '#D9534F',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        },
        {
            label: 'Cats',
            data: EVOLUTION_DATA.map((d) => d.cats),
            borderColor: '#10B981',
            backgroundColor: '#10B981',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#ccc',
            borderWidth: 1,
            padding: 10,
            callbacks: {
                title: (context) => `Year: ${context[0].label}`,
                label: (context) => {
                    let label = context.dataset.label || '';
                    if (label) label += ': ';
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                    }
                    return label;
                },
            },
        },
    },
    scales: {
        x: {
            ticks: { color: '#6B7280' },
            grid: { display: false },
        },
        y: {
            ticks: { color: '#6B7280' },
            grid: {
                drawBorder: false,
                color: '#E5E7EB',
                borderDash: [3, 3],
            },
        },
    },
};

const legendItems = computed(() =>
    chartData.value.datasets.map((dataset) => ({
        label: dataset.label,
        color: dataset.backgroundColor,
    }))
);
</script>

<template>
    <div>
        <!-- 차트 -->
        <div class="h-80 w-full">
            <Line :data="chartData" :options="chartOptions" />
        </div>

        <!-- 범례 -->
        <ul class="flex justify-center items-center gap-6 mt-4">
            <li v-for="(item, index) in legendItems" :key="index" class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
                <span class="text-sm text-gray-600">{{ item.label }}</span>
            </li>
        </ul>

        <!-- 연도 선택 버튼 -->
        <div class="flex justify-center mt-6">
            <div class="flex bg-gray-100 rounded-full p-1">
                <button
                    v-for="d in EVOLUTION_DATA"
                    :key="d.year"
                    @click="selectedYear = d.year"
                    :class="[
                        'px-4 py-1 rounded-full text-sm font-semibold transition-colors duration-200',
                        selectedYear === d.year ? 'bg-white text-[#D9534F] shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200',
                    ]"
                >
                    {{ d.year }}
                </button>
            </div>
        </div>
    </div>
</template>
