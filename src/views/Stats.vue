<template>
    <div class="min-h-screen bg-[#FAF7F5] text-[#333] p-4 sm:p-8 md:p-12">
        <main class="max-w-4xl mx-auto space-y-12">
            <Header />
            <StatCards />

            <section class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 class="text-xl md:text-2xl font-bold text-center mb-2">Evolution of the data on the entry and destination of animals</h2>
                <EvolutionChart />
            </section>

            <ArrivalDistribution />

            <ComparativeBarCharts />

            <MicrochipStats />
        </main>
    </div>
</template>
<script setup>
import Header from '@/components/Statics/Header.vue';
import StatCards from '@/components/Statics/StatCards.vue';
import EvolutionChart from '@/components/Statics/EvolutionChart.vue';
import ArrivalDistribution from '@/components/Statics/ArrivalDistribution.vue';
import ComparativeBarCharts from '@/components/Statics/ComparativeBarCharts.vue';
import MicrochipStats from '@/components/Statics/MicrochipStats.vue';
</script>
