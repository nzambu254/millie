<template>
  <div>
    <h2>Assessment</h2>
    <div v-if="!submitted && currentQuestion">
      <p><strong>Question {{ currentIndex + 1 }}:</strong> {{ currentQuestion.text }}</p>
      <input v-model="userAnswer" placeholder="Your answer" />
      <button @click="nextQuestion">Next</button>
    </div>
    <div v-else-if="submitted">
      <p>✅ Assessment Complete!</p>
      <p>Your Score: {{ score }}/{{ questions.length }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'

const questions = ref([])
const currentIndex = ref(0)
const userAnswer = ref('')
const score = ref(0)
const submitted = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])

onMounted(async () => {
  const snap = await getDocs(collection(db, 'assessments'))
  questions.value = snap.docs.map(doc => doc.data())
})

function nextQuestion() {
  if (parseFloat(userAnswer.value) === currentQuestion.value.answer) {
    score.value++
  }
  userAnswer.value = ''
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    submitted.value = true
    saveResult()
  }
}

async function saveResult() {
  const userId = auth.currentUser.uid
  await setDoc(doc(db, 'assessmentResults', userId), {
    score: score.value,
    total: questions.value.length,
    timestamp: new Date()
  })
}
</script>
