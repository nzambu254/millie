<template>
  <div class="student-dashboard">
    <h1>Student Dashboard</h1>
    <div class="welcome-message">
      <p>Welcome to your Geometry Learning System dashboard!</p>
    </div>
    <div class="quick-stats">
      <div class="stat-card">
        <h3>Beginner Modules</h3>
        <p>{{ beginnerCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Intermediate Modules</h3>
        <p>{{ intermediateCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Advanced Modules</h3>
        <p>{{ advancedCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const beginnerCount = ref(0)
const intermediateCount = ref(0)
const advancedCount = ref(0)

onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'geometry_contents'))
  const contents = snapshot.docs.map(doc => doc.data())

  beginnerCount.value = contents.filter(c => c.difficulty === 'Beginner').length
  intermediateCount.value = contents.filter(c => c.difficulty === 'Intermediate').length
  advancedCount.value = contents.filter(c => c.difficulty === 'Advanced').length
})
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
}

.welcome-message {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0 0;
}
</style>
