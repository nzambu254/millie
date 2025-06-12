<template>
  <div>
    <h2>Welcome, {{ user?.email }}</h2>
    <p>Your Progress:</p>
    <ul>
      <li v-for="module in progress" :key="module.id">
        {{ module.moduleName }} – {{ module.completion }}%
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

const user = auth.currentUser
const progress = ref([])

onMounted(async () => {
  const docSnap = await getDoc(doc(db, 'progress', user.uid))
  progress.value = docSnap.exists() ? docSnap.data().modules : []
})
</script>
