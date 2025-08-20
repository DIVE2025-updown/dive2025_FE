<template>
  <div class="right-modal-backdrop" @click.self="$emit('close')">
    <div class="right-modal-panel">
      <div class="right-modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="right-modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
});

defineEmits(['close']);
</script>

<style scoped>
.right-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.right-modal-panel {
  width: 420px;
  max-width: 90vw;
  height: 100%;
  background: #f9fafb;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.22s ease-out;
}

.right-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.right-modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.right-modal-body {
  padding: 12px 12px 16px 12px;
  overflow: auto;
  height: 100%;
}

@keyframes slideIn {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
