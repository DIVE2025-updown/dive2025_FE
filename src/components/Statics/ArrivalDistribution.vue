<script setup>
import Icon from './Icons.vue';

const DonutChart = {
    template: `
    <div class="relative w-48 h-48 md:w-56 md:h-56">
        <svg viewBox="0 0 120 120" class="transform -rotate-90">
            <circle cx="60" cy="60" r="54" fill="transparent" stroke="#333333" stroke-width="12" />
            <circle
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="#D9534F"
                stroke-width="12"
                stroke-dasharray="339.292"
                stroke-dashoffset="137.413"
                stroke-linecap="round"
            />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
             <div class="bg-[#D9534F] w-24 h-24 rounded-full flex items-center justify-center">
                <Icon name="house" class="w-12 h-12 text-white" />
             </div>
        </div>
    </div>
  `,
    components: {
        Icon,
    },
};
</script>

<template>
    <section class="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
        <h2 class="text-xl md:text-2xl font-bold mb-1">
            보호소에는 몇 마리의 개와 고양이가 들어올까요?
        </h2>
        <p class="text-gray-600 mb-6">
            아래와 같이 보호소에 들어오는 동물의 수와 특징을 확인할 수 있어요.
        </p>
        <p class="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            2024년 보호된 동물은 아래와 같아요.
        </p>

        <div
            class="flex flex-col md:flex-row justify-around items-center gap-8"
        >
            <!-- Dogs -->
            <div class="flex flex-col items-center">
                <Icon name="dog-silhouette" class="w-48 h-48 text-gray-200" />
                <div class="mt-4 text-center">
                    <p class="text-3xl font-bold text-[#D9534F]">59.5%</p>
                    <p class="font-semibold text-[#D9534F]">173,867 개</p>
                </div>
                <div
                    class="flex items-center gap-3 mt-4 bg-gray-100 px-4 py-2 rounded-full"
                >
                    <div class="bg-[#D9534F] p-2 rounded-full">
                        <Icon
                            name="dog-silhouette"
                            class="w-6 h-6 text-white"
                        />
                    </div>
                    <span class="font-bold">개</span>
                </div>
            </div>

            <!-- Chart -->
            <div class="order-first md:order-none">
                <DonutChart />
            </div>

            <!-- Cats -->
            <div class="flex flex-col items-center">
                <Icon name="cat-silhouette" class="w-48 h-48 text-gray-200" />
                <div class="mt-4 text-center">
                    <p class="text-3xl font-bold text-gray-700">40.5%</p>
                    <p class="font-semibold text-gray-700">118,151 고양이</p>
                </div>
                <div
                    class="flex items-center gap-3 mt-4 bg-gray-100 px-4 py-2 rounded-full"
                >
                    <div class="bg-gray-400 p-2 rounded-full">
                        <Icon
                            name="cat-silhouette"
                            class="w-6 h-6 text-white"
                        />
                    </div>
                    <span class="font-bold text-gray-700">고양이</span>
                </div>
            </div>
        </div>
    </section>
</template>
