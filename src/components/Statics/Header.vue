<script setup>
import Icon from './Icons.vue';
</script>

<template>
    <header class="text-center">
        <div class="bg-[#D9534F] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <Icon name="dog-cat" class="absolute -top-4 -right-4 w-40 h-40 text-white opacity-20" />
            <div class="relative">
                <p class="text-5xl md:text-6xl font-bold">+292,018</p>
                <p class="text-lg md:text-xl mt-2">Dogs and cats collected by shelters in Spain during 2024</p>
            </div>
        </div>
    </header>
</template>
