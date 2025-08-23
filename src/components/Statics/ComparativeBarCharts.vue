<script setup>
const DogBar = {
    props: ['value'],
    template: `
    <div class="flex items-center justify-end w-full h-8 bg-gradient-to-r from-[#FADBD5] to-[#D9534F] rounded-md">
      <span class="text-sm font-bold text-gray-800 pr-2">{{ value }}%</span>
    </div>
  `,
};

const CatBar = {
    props: ['value'],
    template: `
    <div class="flex items-center justify-end w-full h-8 bg-gradient-to-r from-[#D1D5DB] to-[#6B7280] rounded-md">
      <span class="text-sm font-bold text-white pr-2">{{ value }}%</span>
    </div>
  `,
};

const DogOnlyBar = {
    props: ['value', 'colorFrom', 'colorTo'],
    template: `
  <div :style="{ background: 'linear-gradient(to right, ' + colorFrom + ', ' + colorTo + ')' }" class="flex items-center justify-end w-full h-8 rounded-md">
      <span class="text-sm font-bold text-gray-800 pr-2">{{ value }}%</span>
    </div>
  `,
};

const BarChartSection = {
    props: ['title', 'data'],
    components: { DogBar, CatBar },
    template: `
    <div class="py-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-center mb-6">{{ title }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        <div>
          <div v-for="item in data" :key="item.label" class="flex items-center gap-4 mb-2">
            <div class="w-1/3 text-right">
              <span class="font-semibold text-gray-600 text-sm">{{ item.dogValue }}%</span>
            </div>
            <div class="w-2/3" :style="{ width: item.dogValue + '%' }">
              <DogBar :value="item.dogValue" />
            </div>
          </div>
        </div>
        <div>
          <div v-for="item in data" :key="item.label" class="flex items-center gap-4 mb-2">
            <div class="w-2/3" :style="{ width: item.catValue + '%' }">
              <CatBar :value="item.catValue" />
            </div>
            <div class="w-1/3 text-left">
              <span class="font-semibold text-gray-600 text-sm">{{ item.catValue }}%</span>
            </div>
            <span class="w-24 text-gray-500 text-xs font-medium uppercase">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

const DogSizeChart = {
    props: ['title', 'data'],
    components: { DogOnlyBar },
    setup() {
        const dogColors = [
            { from: '#FADBD5', to: '#D9534F' },
            { from: '#F8C4B4', to: '#E87068' },
            { from: '#F6AD9E', to: '#F28B82' },
        ];
        return { dogColors };
    },
    template: `
    <div class="py-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-center mb-6">{{ title }}</h3>
        <div class="flex justify-center">
             <div class="w-full md:w-1/2">
                <div v-for="(item, index) in data" :key="item.label" class="flex items-center gap-4 mb-2">
                     <div class="w-1/3 text-right">
                        <span class="font-semibold text-gray-600 text-sm">{{ item.value }}%</span>
                     </div>
                     <div class="w-2/3" :style="{ width: item.value + '%' }">
                        <DogOnlyBar :value="item.value" :color-from="dogColors[index].from" :color-to="dogColors[index].to" />
                     </div>
                      <span class="w-24 text-gray-500 text-xs font-medium uppercase">{{ item.label }}</span>
                </div>
             </div>
        </div>
    </div>
  `,
};
</script>

<template>
    <section class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <BarChartSection title="What breed are the animals?" :data="BREED_DATA" />
        <BarChartSection title="At what age do they arrive?" :data="AGE_DATA" />
        <BarChartSection title="What is their health condition when they arrive?" :data="HEALTH_DATA" />
        <DogSizeChart title="What size are the dogs?" :data="DOG_SIZE_DATA" />
        <BarChartSection title="In which season do most animals arrive?" :data="SEASON_DATA" />
    </section>
</template>
