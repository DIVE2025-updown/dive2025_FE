<template>
  <component :is="viewComponent" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import MyPageShelter from './ShelterPage.vue';
import MyPageTransporter from './TransporterPage.vue';

const auth = useAuthStore();

// role 우선, 없으면 stype으로 보조 판정
const isTransporter = computed(
  () => auth.role === 'ROLE_TRANSPORTER' || auth.stype === 'TRANSPORTER'
);

const viewComponent = computed(() => (isTransporter.value ? MyPageTransporter : MyPageShelter));
</script>
