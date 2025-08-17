<template>
  <div class="side-bar">
    <RouterLink class="btn" to="/map">Map</RouterLink>
    <RouterLink class="btn" to="/apply">Apply</RouterLink>
    <RouterLink class="btn" to="/stats">Stats</RouterLink>
    <RouterLink class="btn" to="/mypage">Mypage</RouterLink>
  </div>
</template>

<script setup></script>

<style scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  width: 160px;
  background: #f5f5f5;
  padding: 20px 0;
}
.btn {
  margin: 10px 0;
  padding: 12px;
  font-size: 16px;
  text-decoration: none;
  color: #111;
  border-radius: 8px;
}
.btn:hover {
  background: #e0e0e0;
}
.router-link-active {
  background: #0ea5e9;
  color: #fff;
}
</style>
