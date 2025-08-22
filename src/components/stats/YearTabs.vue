<script setup>
const props = defineProps({
    modelValue: { type: [String, Number], required: true },
    items: { type: Array, required: true }, // e.g. [2019, 2020, ...]
    accent: { type: String, default: '#2c7be5' },
});
const emit = defineEmits(['update:modelValue']);
const onSelect = (v) => emit('update:modelValue', v);
</script>

<template>
    <div class="tabs" :style="{ '--accent': accent }" role="tablist">
        <button v-for="y in items" :key="y" class="tab" :class="{ active: y === modelValue }" role="tab" :aria-selected="y === modelValue" @click="onSelect(y)">
            {{ y }}
            <span class="underline" />
        </button>
    </div>
</template>

<style scoped>
.tabs {
    display: inline-flex;
    gap: 8px;
    padding: 6px;
    background: #f4f8ff;
    border-radius: 999px;
}
.tab {
    position: relative;
    padding: 10px 18px;
    border-radius: 999px;
    background: transparent;
    border: 0;
    cursor: pointer;
    font-weight: 600;
    color: #2a3650;
}
.tab.active {
    background: #fff;
    box-shadow: 0 6px 18px rgba(32, 73, 133, 0.12);
}
.tab .underline {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 6px;
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease;
}
.tab.active .underline {
    transform: scaleX(1);
}
</style>
