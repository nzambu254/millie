<template>
  <div>
    <h2>Real World Examples</h2>
    <div v-for="example in examples" :key="example.id">
      <h3>{{ example.title }}</h3>
      <img :src="example.image" alt="" width="300" />
      <p>{{ example.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, collection, getDocs } from '@/firebase'

const examples = ref([])

onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'applications'))
  examples.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})
</script>
