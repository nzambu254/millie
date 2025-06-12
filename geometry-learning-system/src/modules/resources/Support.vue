<template>
  <div>
    <h2>Learning Resources</h2>
    <ul>
      <li v-for="res in resources" :key="res.id">
        <a :href="res.link" target="_blank">{{ res.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, collection, getDocs } from '@/firebase'

const resources = ref([])

onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'resources'))
  resources.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})
</script>
