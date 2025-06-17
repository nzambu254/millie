<template>
  <div>
    <h2>Practice Rectangle Problems</h2>
    <p>{{ question.text }}</p>
    <input v-model="userAnswer" type="number" placeholder="Enter your answer" />
    <button @click="checkAnswer">Check</button>
    <p v-if="feedback">{{ feedback }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

const question = ref({})
const userAnswer = ref('')
const feedback = ref('')

onMounted(async () => {
  const snap = await getDoc(doc(db, 'quizzes', 'rectangle1'))
  question.value = snap.data()
})

function checkAnswer() {
  const correct = parseFloat(userAnswer.value) === question.value.answer
  feedback.value = correct ? '✅ Correct!' : '❌ Try again.'
}
</script>
