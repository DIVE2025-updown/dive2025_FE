<template>
  <div class="dashboard">
    <Sidebar />
    <div class="main-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 97vh;
}
.main-content {
  flex: 1;
  background: #fff;
}
</style>
