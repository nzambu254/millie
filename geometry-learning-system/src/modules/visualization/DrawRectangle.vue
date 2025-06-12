<template>
  <div>
    <canvas ref="canvas" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const canvas = ref(null);

onMounted(() => {
  const ctx = canvas.value.getContext('2d');
  ctx.fillStyle = 'blue';
  ctx.fillRect(50, 50, 200, 100);
});
</script>

