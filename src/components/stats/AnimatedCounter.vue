<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    value: { type: Number, required: true },
    duration: { type: Number, default: 700 }, // ms
    decimals: { type: Number, default: 0 },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    locale: { type: String, default: 'en-US' },
    format: { type: Function, default: null }, // custom formatter(v)
});

const display = ref(props.value);
let raf, startTime, from;

const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

function animate(to) {
    cancelAnimationFrame(raf);
    startTime = performance.now();
    from = display.value;
    const step = (now) => {
        const p = Math.min(1, (now - startTime) / props.duration);
        display.value = from + (to - from) * ease(p);
        if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
}

watch(
    () => props.value,
    (to) => animate(to)
);
onMounted(() => (display.value = props.value));

const formatted = () => {
    const v = Number(display.value.toFixed(props.decimals));
    if (props.format) return props.format(v);
    return `${props.prefix}${v.toLocaleString(props.locale, { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })}${props.suffix}`;
};
</script>

<template>
    <span>{{ formatted() }}</span>
</template>
