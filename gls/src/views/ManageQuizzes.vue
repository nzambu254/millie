<template>
  <div>
    <h2>Quiz Manager</h2>

    <form @submit.prevent="addQuiz">
      <input v-model="quiz.text" placeholder="Enter question" required />
      <input v-model.number="quiz.answer" placeholder="Enter correct answer" type="number" required />
      <button type="submit">Add Question</button>
    </form>

    <hr />

    <h3>All Quiz Questions</h3>
    <ul>
      <li v-for="q in quizzes" :key="q.id">
        {{ q.text }} — Answer: {{ q.answer }}
        <button @click="deleteQuiz(q.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'

const quizzes = ref([])
const quiz = ref({ text: '', answer: null })

const fetchQuizzes = async () => {
  const snap = await getDocs(collection(db, 'quizzes'))
  quizzes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const addQuiz = async () => {
  await addDoc(collection(db, 'quizzes'), quiz.value)
  quiz.value = { text: '', answer: null }
  await fetchQuizzes()
}

const deleteQuiz = async (id) => {
  await deleteDoc(doc(db, 'quizzes', id))
  await fetchQuizzes()
}

onMounted(fetchQuizzes)
</script>
