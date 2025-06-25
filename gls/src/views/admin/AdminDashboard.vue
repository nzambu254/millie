<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="admin-stats">
      <div class="stat-card">
        <h3>Total users</h3>
        <p>{{ totalStudents }}</p>
      </div>
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

const totalStudents = ref(0)
const beginnerCount = ref(0)
const intermediateCount = ref(0)
const advancedCount = ref(0)

// Fetch total students count
const fetchStudentsCount = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    totalStudents.value = querySnapshot.size
  } catch (error) {
    console.error('Error fetching students count:', error)
    totalStudents.value = 0
  }
}

// Fetch content module counts by difficulty
const fetchModuleCounts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'geometry_contents'))
    const contents = querySnapshot.docs.map(doc => doc.data())
    
    beginnerCount.value = contents.filter(c => c.difficulty === 'Beginner').length
    intermediateCount.value = contents.filter(c => c.difficulty === 'Intermediate').length
    advancedCount.value = contents.filter(c => c.difficulty === 'Advanced').length
  } catch (error) {
    console.error('Error fetching module counts:', error)
    beginnerCount.value = 0
    intermediateCount.value = 0
    advancedCount.value = 0
  }
}

// Load data when component mounts
onMounted(async () => {
  await Promise.all([
    fetchStudentsCount(),
    fetchModuleCounts()
  ])
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
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
