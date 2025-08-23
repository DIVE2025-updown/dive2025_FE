<script setup>
import Icon from './Icons.vue';

const StatCard = {
    props: ['iconName', 'value', 'label', 'highlight'],
    components: { Icon },
    template: `
    <div class="flex flex-col items-center text-center p-4">
      <div class="bg-[#FDE8E3] p-4 rounded-full mb-4">
        <Icon :name="iconName" class="h-8 w-8 text-[#D9534F]" />
      </div>
      <p class="text-4xl font-bold text-gray-800">{{ value }}</p>
      <p class="text-gray-600">
        {{ label }} <span class="text-[#D9534F] font-semibold">{{ highlight }}</span>
      </p>
    </div>
  `,
};
</script>

<template>
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        <StatCard iconName="hourglass" value="33" label="dogs and cats" highlight="every hour" />
        <StatCard iconName="24h" value="800" label="dogs and cats" highlight="collected every day" />
        <StatCard iconName="calendar" value="24,335" label="dogs and cats" highlight="collected every month" />
    </section>
</template>
