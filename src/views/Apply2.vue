<script setup>
import { reactive, computed } from 'vue';
import ChartCanvas from '@/components/chart/ChartCanvas.vue';
import QuickStat from '@/components/stats/QuickStat.vue';
import DonutBlock from '@/components/stats/DonutBlock.vue';
import YearlyArrivalDonut from '@/components/stats/YearlyArrivalDonut.vue';

const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const arrivals = {
    2018: { dogs: 4366, cats: 3042 },
    2019: { dogs: 4206, cats: 3763 },
    2020: { dogs: 3534, cats: 3848 },
    2021: { dogs: 3085, cats: 3600 },
    2022: { dogs: 2764, cats: 3219 },
    2023: { dogs: 2327, cats: 2912 },
    2024: { dogs: 2169, cats: 2739 },
    2025: { dogs: 1127, cats: 1795 },
};

const colors = {
    dog: '#2c7be5',
    cat: '#6c8cff',
    neutral: '#eaf2ff',
    title: '#183a66',
};

/** ===== 블루 테마 팔레트 ===== */
const theme = reactive({
    accent: '#2c7be5', // 히어로 배경
    dog: '#2c7be5', // Dogs
    cat: '#6c8cff', // Cats (인디고 톤)
    neutral: '#eaf2ff', // 연한 하늘색
    lineTotal: '#123d6a', // 네이비 계열 (총합)
    lineDog: '#2c7be5',
    lineCat: '#6c8cff',
    bar1: '#7fb3ff', // 막대 1
    bar2: '#b9d2ff', // 막대 2
    bar3: '#d9e7ff', // 막대 3
});

/** ===== 상단 수치 / 분할 ===== */
const totals = { total: 48496, perHour: 0.7, perDay: 17.4, perMonth: 527.1 };
const split = { dogs: 2169, cats: 2739, dogPct: 44.2, catPct: 55.8 };
/** ===== 1) 라인 차트 ===== */
const lineYears = [
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
];
const lineTotals = [7408, 7969, 7382, 6685, 5983, 5239, 4908, 2922];
const lineDogs = [4366, 4206, 3534, 3085, 2764, 2327, 2169, 1127];
const lineCats = [3042, 3763, 3848, 3600, 3219, 2912, 2739, 1795];

const lineData = computed(() => ({
    labels: lineYears,
    datasets: [
        {
            label: '개와 고양이',
            data: lineTotals,
            borderColor: theme.lineTotal,
            backgroundColor: theme.lineTotal,
            pointRadius: 3,
            tension: 0.3,
        },
        {
            label: '개',
            data: lineDogs,
            borderColor: theme.lineDog,
            backgroundColor: theme.lineDog,
            pointRadius: 3,
            tension: 0.3,
        },
        {
            label: '고양이',
            data: lineCats,
            borderColor: theme.lineCat,
            backgroundColor: theme.lineCat,
            pointRadius: 3,
            tension: 0.3,
        },
    ],
}));
const lineOptions = {
    scales: {
        y: {
            ticks: { callback: (v) => Number(v).toLocaleString() },
            grid: { color: '#edf2f9' },
        },
        x: { grid: { display: false } },
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: { usePointStyle: true },
        },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`,
            },
        },
    },
};

/** ===== 공통: 가로 스택 바 옵션 ===== */
const stackedHBar = (showLegend = false) => ({
    indexAxis: 'y',
    scales: {
        x: {
            stacked: true,
            max: 100,
            ticks: { callback: (v) => `${v}%` },
            grid: { color: '#edf2f9' },
        },
        y: { stacked: true, grid: { display: false } },
    },
    plugins: {
        legend: { display: showLegend },
        tooltip: {
            callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}%` },
        },
    },
});

/** ===== 3) 품종 ===== */
const breedData = computed(() => ({
    labels: ['개', '고양이'],
    datasets: [
        {
            label: '순종',
            data: [27, 5],
            backgroundColor: theme.bar1,
            borderRadius: 8,
            barThickness: 24,
        },
        {
            label: '믹스견',
            data: [73, 95],
            backgroundColor: theme.bar2,
            borderRadius: 8,
            barThickness: 24,
        },
    ],
}));

/** ===== 4) 나이 ===== */
const ageData = computed(() => ({
    labels: ['개', '고양이'],
    datasets: [
        {
            label: '새끼',
            data: [24, 49],
            backgroundColor: theme.bar1,
            borderRadius: 8,
            barThickness: 24,
        },
        {
            label: '성체',
            data: [60, 43],
            backgroundColor: theme.bar2,
            borderRadius: 8,
            barThickness: 24,
        },
        {
            label: '노령',
            data: [16, 8],
            backgroundColor: theme.bar3,
            borderRadius: 8,
            barThickness: 24,
        },
    ],
}));

/** ===== 5) 건강 상태 ===== */
const healthData = computed(() => ({
    labels: ['개', '고양이'],
    datasets: [
        {
            label: '부상',
            data: [14, 15],
            backgroundColor: theme.bar1,
            borderRadius: 8,
            barThickness: 24,
        },
        {
            label: '건강',
            data: [59, 48],
            backgroundColor: theme.bar2,
            borderRadius: 8,
            barThickness: 24,
        },
        {
            label: '질병',
            data: [28, 38],
            backgroundColor: theme.bar3,
            borderRadius: 8,
            barThickness: 24,
        },
    ],
}));

/** ===== 6) 크기(개) - 단일 가로 바 ===== */
const sizeDogData = computed(() => ({
    labels: ['소형', '중형', '대형'],
    datasets: [
        {
            label: '개',
            data: [18, 53, 29],
            backgroundColor: [theme.bar1, theme.bar2, theme.bar3],
            borderRadius: 8,
            barThickness: 24,
        },
    ],
}));
const hBar = {
    indexAxis: 'y',
    scales: {
        x: {
            max: 100,
            ticks: { callback: (v) => `${v}%` },
            grid: { color: '#edf2f9' },
        },
        y: { grid: { display: false } },
    },
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.raw}%` } },
    },
};

/** ===== 7) 계절 + 값 라벨 플러그인 ===== */
const seasonLabels = ['1월 - 3월', '4월 - 6월', '7월 - 9월', '10월 - 12월'];
const seasonData = computed(() => ({
    labels: seasonLabels,
    datasets: [
        {
            label: '개',
            data: [26, 24, 28, 23],
            backgroundColor: theme.dog,
            borderRadius: 6,
            barThickness: 26,
        },
        {
            label: '고양이',
            data: [19, 33, 31, 17],
            backgroundColor: theme.cat,
            borderRadius: 6,
            barThickness: 26,
        },
    ],
}));
const valueLabelPlugin = {
    id: 'valueLabel',
    afterDatasetsDraw(chart, args, opts) {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = opts?.color || '#1f2d3d';
        ctx.font = opts?.font || '600 12px system-ui';
        ctx.textAlign = 'center';
        chart.data.datasets.forEach((ds, di) => {
            const meta = chart.getDatasetMeta(di);
            meta.data.forEach((el, i) => {
                const val = ds.data[i];
                if (val == null) return;
                const pos = el.tooltipPosition();
                ctx.fillText(`${val}%`, pos.x, pos.y - 10);
            });
        });
        ctx.restore();
    },
};
const seasonOptions = {
    scales: {
        y: {
            max: 40,
            ticks: { callback: (v) => `${v}%` },
            grid: { color: '#edf2f9' },
        },
        x: { grid: { display: false } },
    },
    plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: {
            callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}%` },
        },
        valueLabel: { color: '#233549' },
    },
};

/** ===== 8) 마이크로칩 미니 도넛 ===== */
const chipDogs = computed(() => ({
    labels: ['With chip', 'No chip'],
    datasets: [
        {
            data: [25, 75],
            backgroundColor: [theme.dog, theme.neutral],
            cutout: '72%',
        },
    ],
}));
const chipCats = computed(() => ({
    labels: ['With chip', 'No chip'],
    datasets: [
        {
            data: [5, 95],
            backgroundColor: [theme.cat, theme.neutral],
            cutout: '72%',
        },
    ],
}));

/** 미니 도넛 중앙 텍스트 플러그인 */
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
        ctx.font = '800 18px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
    },
};
</script>

<template>
    <div class="stats-page">
        <!-- 헤더 -->
        <section class="hero" :style="{ backgroundColor: theme.accent }">
            <div class="hero-inner">
                <div class="hero-icon">🐶🐱</div>
                <div class="hero-text">
                    <div class="hero-desc">
                        2018년부터 지금까지 부산시에서 구조된 개와 고양이 수
                    </div>
                    <div class="hero-number">
                        +{{ totals.total.toLocaleString() }}
                    </div>
                </div>
            </div>
        </section>

        <!-- 요약 수치 (블루 포인트) -->
        <section class="quick">
            <QuickStat
                icon="🕑"
                :value="totals.perHour"
                :lines="['개와 고양이', '시간당 유입']"
                :accentColor="theme.dog"
            />
            <QuickStat
                icon="📆"
                :value="totals.perDay"
                :lines="['개와 고양이', '일간 유입']"
                :accentColor="theme.dog"
            />
            <QuickStat
                icon="🗓️"
                :value="totals.perMonth.toLocaleString()"
                :lines="['개와 고양이', '월간 유입']"
                :accentColor="theme.cat"
            />
        </section>

        <!-- 라인 차트 -->
        <section class="panel">
            <h3>연도별 보호 현황 추이</h3>
            <div class="card tall">
                <ChartCanvas
                    type="line"
                    :data="lineData"
                    :options="lineOptions"
                    :height="340"
                />
            </div>
        </section>

        <!-- 도넛 + 캡션 2개 (블루 톤) -->
        <section class="panel">
            <h3>보호소 유입 현황</h3>
            <p class="sub">2024년 유입 현황</p>
            <div class="two">
                <DonutBlock
                    :pct="split.dogPct"
                    :totalText="`${split.dogs.toLocaleString()} 개`"
                    :mainColor="theme.dog"
                    :neutralColor="theme.neutral"
                    height="200"
                />
                <DonutBlock
                    :pct="split.catPct"
                    :totalText="`${split.cats.toLocaleString()} 고양이`"
                    :mainColor="theme.cat"
                    :neutralColor="theme.neutral"
                    height="200"
                    align="right"
                />
            </div>
        </section>

        <!-- 중간 3개 (블루 막대 + 고정 높이) -->
        <section class="grid3">
            <div class="card">
                <h4>품종 분포</h4>
                <ChartCanvas
                    type="bar"
                    :data="breedData"
                    :options="stackedHBar(true)"
                    :height="170"
                />
            </div>
            <div class="card">
                <h4>나이 분포</h4>
                <ChartCanvas
                    type="bar"
                    :data="ageData"
                    :options="stackedHBar(true)"
                    :height="170"
                />
            </div>
            <div class="card">
                <h4>입소시 건강 상태</h4>
                <ChartCanvas
                    type="bar"
                    :data="healthData"
                    :options="stackedHBar(true)"
                    :height="170"
                />
            </div>
        </section>

        <YearlyArrivalDonut
            :years="years"
            :dataByYear="arrivals"
            :colors="colors"
        />

        <!-- 크기(개) -->
        <section class="panel">
            <div class="card">
                <h4>개 체구 분포</h4>
                <ChartCanvas
                    type="bar"
                    :data="sizeDogData"
                    :options="hBar"
                    :height="180"
                />
            </div>
        </section>

        <!-- 계절 -->
        <section class="panel">
            <div class="card tall">
                <h4>계절별 유입 현황</h4>
                <ChartCanvas
                    type="bar"
                    :data="seasonData"
                    :options="seasonOptions"
                    :plugins="[valueLabelPlugin]"
                    :height="260"
                />
            </div>
        </section>

        <!-- 마이크로칩 -->
        <section class="panel">
            <h4>마이크로칩 등록 현황</h4>
            <div class="two">
                <div class="mini-donut">
                    <ChartCanvas
                        type="doughnut"
                        :data="chipDogs"
                        :options="{
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false },
                                centerText: { text: '25%', color: theme.dog },
                            },
                        }"
                        :plugins="[centerTextPlugin]"
                        :height="140"
                    />
                    <div class="mini-label">개</div>
                </div>
                <div class="mini-donut">
                    <ChartCanvas
                        type="doughnut"
                        :data="chipCats"
                        :options="{
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false },
                                centerText: { text: '5%', color: theme.cat },
                            },
                        }"
                        :plugins="[centerTextPlugin]"
                        :height="140"
                    />
                    <div class="mini-label">고양이</div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.stats-page {
    --radius: 14px;
    --shadow: 0 8px 24px rgba(16, 44, 84, 0.08);
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, 'Noto Sans';
    color: #1f2d3d;
    max-width: 1040px;
    margin: 0 auto;
    padding: 28px 16px 64px;
    background: linear-gradient(180deg, #f7fbff 0%, #ffffff 120%);
}
.hero {
    color: #fff;
    border-radius: var(--radius);
    padding: 28px 24px;
    box-shadow: var(--shadow);
}
.hero-inner {
    display: flex;
    align-items: center;
    gap: 16px;
}
.hero-icon {
    font-size: 42px;
}
.hero-number {
    font-size: 40px;
    font-weight: 800;
    line-height: 1;
}
.hero-desc {
    opacity: 0.98;
    margin-top: 6px;
}

.quick {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin: 18px 0 26px;
}

.panel {
    margin: 24px 0;
}
.panel > h3 {
    font-size: 18px;
    margin: 0 0 10px;
    color: #183a66;
}
.sub {
    color: #5a6b85;
    margin: 0 0 12px;
}

.card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 16px 16px 10px;
    border: 1px solid #e6efff;
}
.card.tall {
    padding: 12px 12px 6px;
    height: 390px;
}
.card h4 {
    margin: 6px 8px 12px;
    color: #183a66;
}

.two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.grid3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.mini-donut {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 12px;
    text-align: center;
    border: 1px solid #e6efff;
}
.mini-label {
    margin-top: 6px;
    color: #5a6b85;
}

@media (max-width: 980px) {
    .grid3 {
        grid-template-columns: 1fr;
    }
    .two {
        grid-template-columns: 1fr;
    }
    .card.tall {
        height: 420px;
    }
}
</style>
