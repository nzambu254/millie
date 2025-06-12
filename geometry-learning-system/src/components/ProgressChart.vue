<template>
  <div>
    <h2>Progress Overview</h2>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { ref, onMounted } from 'vue'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale
} from 'chart.js'
import { db, auth } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = ref({
  labels: ['Assessment'],
  datasets: [{
    label: 'Score',
    backgroundColor: '#42A5F5',
    data: [0]
  }]
})

const chartOptions = ref({
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 10
    }
  }
})

onMounted(async () => {
  const userId = auth.currentUser.uid
  const docSnap = await getDoc(doc(db, 'assessmentResults', userId))
  if (docSnap.exists()) {
    chartData.value.datasets[0].data[0] = docSnap.data().score
  }
})
</script>
