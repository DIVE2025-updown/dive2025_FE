<script setup>
import { computed } from 'vue';
import Icon from './Icons.vue';

const MiniDonutChart = {
    props: ['percentage', 'color', 'iconName'],
    components: { Icon },
    setup(props) {
        const circumference = 2 * Math.PI * 45;
        const offset = computed(() => circumference - (props.percentage / 100) * circumference);
        return { circumference, offset };
    },
    template: `
    <div class="flex flex-col items-center gap-4">
        <div class="relative w-32 h-32">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    class="text-gray-200"
                    stroke-width="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    :style="{ color: color }"
                    stroke-width="10"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="offset"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-700">{{ percentage }}%</span>
            </div>
        </div>
         <div :style="{ backgroundColor: color }" class="p-3 rounded-full">
            <Icon :name="iconName" class="w-8 h-8 text-white"/>
         </div>
    </div>
  `,
};
</script>

<template>
    <section class="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
        <h3 class="text-lg font-semibold text-center mb-6">Animals collected that had a microchip</h3>
        <div class="flex justify-center items-center gap-12 md:gap-24">
            <MiniDonutChart :percentage="25" color="#D9534F" iconName="dog-silhouette" />
            <MiniDonutChart :percentage="5" color="#6B7280" iconName="cat-silhouette" />
        </div>
    </section>
</template>
