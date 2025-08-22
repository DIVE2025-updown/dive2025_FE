<script setup>
import { computed } from 'vue';
import ChartCanvas from '@/components/chart/ChartCanvas.vue';

const props = defineProps({
    pct: { type: Number, required: true }, // 59.5
    totalText: { type: String, required: true }, // "173,867 DOGS"
    mainColor: { type: String, default: '#2c7be5' }, // 기본 블루
    neutralColor: { type: String, default: '#eaf2ff' },
    height: { type: [Number, String], default: 200 },
    align: { type: String, default: 'left' }, // "left" | "right"
});

const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        const {
            ctx,
            chartArea: { width, height },
        } = chart;
        const text = chart.options?.plugins?.centerText?.text;
        if (!text) return;
        ctx.save();
        ctx.fillStyle = chart.options?.plugins?.centerText?.color || '#1e2a3a';
        ctx.font = chart.options?.plugins?.centerText?.font || '800 22px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
    },
};

const donutData = computed(() => ({
    labels: ['Part', 'Rest'],
    datasets: [
        {
            data: [props.pct, 100 - props.pct],
            backgroundColor: [props.mainColor, props.neutralColor],
            cutout: '68%',
        },
    ],
}));

const donutOptions = computed(() => ({
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        centerText: { text: `${props.pct}%`, color: props.mainColor },
    },
}));
</script>

<template>
    <div class="donut-block" :class="align">
        <div class="donut-figure">
            <ChartCanvas type="doughnut" :data="donutData" :options="donutOptions" :plugins="[centerTextPlugin]" :height="height" />
        </div>
        <div class="donut-caption" :style="{ '--main': mainColor }">
            <div class="pct">{{ pct }}%</div>
            <div class="num">{{ totalText }}</div>
        </div>
    </div>
</template>

<style scoped>
.donut-block {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    padding: 14px;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 14px;
    align-items: center;
}
.donut-block.right {
    grid-template-columns: 1fr 200px;
}
.donut-caption .pct {
    font-weight: 800;
    font-size: 22px;
    color: var(--main);
}
.donut-caption .num {
    color: #5a6b85;
    margin-top: 4px;
}
@media (max-width: 980px) {
    .donut-block,
    .donut-block.right {
        grid-template-columns: 1fr;
    }
}
</style>
