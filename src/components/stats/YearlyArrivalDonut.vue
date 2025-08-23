<script setup>
import { computed, ref, watch } from 'vue';
import YearTabs from '@/components/stats/YearTabs.vue';
import AnimatedCounter from '@/components/stats/AnimatedCounter.vue';
import ChartCanvas from '@/components/chart/ChartCanvas.vue';

const props = defineProps({
    years: { type: Array, required: true }, // [2019, 2020, ...]
    dataByYear: {
        // { 2019: { dogs, cats }, ... }
        type: Object,
        required: true,
    },
    modelValue: { type: [String, Number], default: null }, // 외부 제어 가능
    colors: {
        type: Object,
        default: () => ({
            dog: '#2c7be5',
            cat: '#6c8cff',
            neutral: '#eaf2ff',
            title: '#183a66',
        }),
    },
});

const emit = defineEmits(['update:modelValue']);
const selected = ref(props.modelValue ?? props.years[0]);
watch(
    () => props.modelValue,
    (v) => {
        if (v !== null) selected.value = v;
    }
);
watch(selected, (v) => emit('update:modelValue', v));

/** 계산 데이터 */
const current = computed(
    () => props.dataByYear[selected.value] || { dogs: 0, cats: 0 }
);
const totals = computed(() => current.value.dogs + current.value.cats);
const dogPct = computed(() =>
    totals.value ? (current.value.dogs / totals.value) * 100 : 0
);
const catPct = computed(() => 100 - dogPct.value);

/** 차트 플러그인: 중앙 아이콘/텍스트 */
const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        const {
            ctx,
            chartArea: { width, height },
        } = chart;
        ctx.save();
        ctx.font = '800 24px system-ui';
        ctx.fillStyle = '#27405f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐾', width / 2, height / 2);
        ctx.restore();
    },
};

const donutData = computed(() => ({
    labels: ['Dogs', 'Cats'],
    datasets: [
        {
            data: [dogPct.value, catPct.value],
            backgroundColor: [props.colors.dog, props.colors.cat],
            borderWidth: 0,
            cutout: '64%',
        },
    ],
}));

const donutOptions = {
    animation: { duration: 600, easing: 'easeOutCubic' },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (c) => `${c.label}: ${c.raw.toFixed(1)}%` },
        },
    },
};
</script>

<template>
    <section class="yearly">
        <!-- 연도 탭 -->
        <div class="tabs-wrap">
            <YearTabs v-model="selected" :items="years" :accent="colors.dog" />
        </div>

        <!-- 타이틀/설명 -->
        <h2 class="title">보호소에는 몇 마리의 개와 고양이가 들어올까요?</h2>
        <p class="desc">
            보호소에 들어오는 동물의 수와 그들의 특징이 어떻게 분포되어 있는지
            확인할 수 있습니다.
        </p>

        <!-- "In {year} were taken in..." -->
        <div class="subhead">
            <span class="year">{{ selected }}</span> 년에 보호된 동물은 아래와
            같아요.
        </div>

        <!-- 본문: 왼쪽(개), 도넛, 오른쪽(고양이) -->
        <div class="ring-row">
            <div class="side left" :style="{ '--c': colors.dog }">
                <div class="pct">
                    <AnimatedCounter :value="dogPct" :decimals="1" suffix="%" />
                </div>
                <div class="count">
                    <AnimatedCounter :value="current.dogs" :duration="800" />
                </div>
                <div class="label">개</div>
            </div>

            <div class="ring">
                <ChartCanvas
                    type="doughnut"
                    :data="donutData"
                    :options="donutOptions"
                    :plugins="[centerTextPlugin]"
                    :height="240"
                />
            </div>

            <div class="side right" :style="{ '--c': colors.cat }">
                <div class="pct">
                    <AnimatedCounter :value="catPct" :decimals="1" suffix="%" />
                </div>
                <div class="count">
                    <AnimatedCounter :value="current.cats" :duration="800" />
                </div>
                <div class="label">고양이</div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.yearly {
    background: #ffffff;
    border-radius: 18px;
    padding: 28px 26px 30px;
    box-shadow: 0 10px 30px rgba(16, 44, 84, 0.08);
    margin-top: 30px;
}
.tabs-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
}

.title {
    text-align: center;
    font-size: 28px;
    line-height: 1.2;
    color: v-bind('colors.title');
    margin: 4px 0 10px;
}
.desc {
    text-align: center;
    color: #5a6b85;
    margin-bottom: 18px;
}
.subhead {
    text-align: center;
    font-size: 26px;
    margin-bottom: 14px;
}
.subhead .year {
    font-weight: 800;
}

.ring-row {
    display: grid;
    grid-template-columns: 1fr 300px 1fr;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
}
.ring {
    display: grid;
    place-items: center;
}

.side {
    text-align: center;
}
.side .pct {
    font-size: 40px;
    font-weight: 800;
    color: var(--c);
}
.side .count {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 800;
    color: var(--c);
}
.side .label {
    color: #5a6b85;
    margin-top: 4px;
    letter-spacing: 0.5px;
}

@media (max-width: 960px) {
    .ring-row {
        grid-template-columns: 1fr;
    }
}
</style>
