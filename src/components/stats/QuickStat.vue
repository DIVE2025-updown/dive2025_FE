<script setup>
const props = defineProps({
    icon: { type: String, default: '🔷' },
    value: { type: [Number, String], required: true },
    lines: { type: Array, default: () => [] },
    accentColor: { type: String, default: '#2c7be5' }, // 블루 포인트
});
</script>

<template>
    <div class="q-item" :style="{ '--accent': accentColor }">
        <div class="q-icon">{{ icon }}</div>
        <div class="q-num">{{ value }}</div>
        <div class="q-text">
            <span v-for="(l, i) in lines" :key="i"> {{ l }}<br v-if="i !== lines.length - 1" /> </span>
        </div>
    </div>
</template>

<style scoped>
.q-item {
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border-top: 3px solid var(--accent); /* 블루 포인트 라인 */
}
.q-icon {
    font-size: 18px;
    margin-bottom: 6px;
    color: var(--accent);
}
.q-num {
    font-size: 28px;
    font-weight: 800;
    color: var(--accent);
}
.q-text {
    color: #57607a;
    line-height: 1.32;
    margin-top: 4px;
}
</style>
