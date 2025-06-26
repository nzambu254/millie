<template>
  <div class="practice-container">
    <h2>Practice: Rectangles</h2>

    <!-- Questions -->
    <div v-for="(q, index) in questions" :key="q.id" class="question-card">
      <p><strong>Q{{ index + 1 }}:</strong> {{ q.question }}</p>

      <!-- MCQ -->
      <div v-if="q.type === 'mcq'">
        <div v-for="(option, i) in q.options" :key="i">
          <label>
            <input
              type="radio"
              :name="'q' + q.id"
              :value="option"
              v-model="userAnswers[q.id]"
            />
            {{ option }}
          </label>
        </div>
      </div>

      <!-- Short Answer -->
      <div v-else>
        <input
          type="text"
          v-model="userAnswers[q.id]"
          placeholder="Type your answer..."
        />
      </div>

      <p
        v-if="submitted && feedback[q.id]"
        :class="{ correct: feedback[q.id].isCorrect, wrong: !feedback[q.id].isCorrect }"
      >
        {{ feedback[q.id].message }}
      </p>
    </div>

    <!-- Submit Button -->
    <button class="submit-all-btn" @click="submitAll">Submit All</button>

    <!-- Score Feedback -->
    <div v-if="submitted" class="overall-result">
      <h3>Your Score: {{ score }}/{{ questions.length }}</h3>
      <p>Your results have been saved ✅</p>
    </div>

    <!-- Past Results -->
    <div class="past-results" v-if="pastResults.length">
      <h3>📊 Past Attempts</h3>
      <ul>
        <li v-for="(result, i) in pastResults" :key="i">
          <strong>{{ formatDate(result.timestamp) }}</strong> — Score: {{ result.score }}/{{ result.total }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'

const questions = [
  {
    id: 'q1',
    type: 'mcq',
    question: 'Which of the following is not a property of a rectangle?',
    options: ['All sides are equal', 'Opposite sides are equal', 'All angles are 90°', 'Diagonals are equal'],
    correctAnswer: 'All sides are equal',
    topic: 'Rectangles',
  },
  {
    id: 'q2',
    type: 'mcq',
    question: 'The diagonals of a rectangle:',
    options: ['Are unequal', 'Bisect each other', 'Are perpendicular', 'Do not intersect'],
    correctAnswer: 'Bisect each other',
    topic: 'Rectangles',
  },
  {
    id: 'q3',
    type: 'mcq',
    question: 'A square is a rectangle because:',
    options: ['It has curved sides', 'It has four unequal sides', 'It has four right angles and equal opposite sides', 'It has four right angles and all sides equal'],
    correctAnswer: 'It has four right angles and all sides equal',
    topic: 'Rectangles',
  },
  {
    id: 'q4',
    type: 'short-answer',
    question: 'A rectangle has .............right angles.',
    correctAnswer: 'four',
    topic: 'Rectangles',
  },
  {
    id: 'q5',
    type: 'short-answer',
    question: 'The formula for the area of a rectangle is ...............',
    correctAnswer: 'length × width',
    topic: 'Rectangles',
  },
  {
    id: 'q6',
    type: 'short-answer',
    question: 'The diagonals of a rectangle are .............in length.',
    correctAnswer: 'equal',
    topic: 'Rectangles',
  },
  {
    id: 'q7',
    type: 'short-answer',
    question: 'Define a rectangle.',
    correctAnswer: 'A rectangle is a quadrilateral with four right angles and opposite sides equal.',
    topic: 'Rectangles',
  },
  {
    id: 'q8',
    type: 'short-answer',
    question: 'List three properties of a rectangle.',
    correctAnswer: 'Opposite sides are equal, all angles are 90°, diagonals are equal in length.',
    topic: 'Rectangles',
  },
  {
    id: 'q9',
    type: 'short-answer',
    question: 'Is every square a rectangle? Explain why or why not.',
    correctAnswer: 'Yes, because a square has all properties of a rectangle: four right angles and opposite sides equal.',
    topic: 'Rectangles',
  },
  {
    id: 'q10',
    type: 'short-answer',
    question: 'A rectangle has a length of 10 cm and a width of 6 cm. (a) Find its area. (b) Find its perimeter. (c) Find the length of its diagonal.',
    correctAnswer: '(a) 60 cm² (b) 32 cm (c) approximately 11.66 cm',
    topic: 'Rectangles',
  },
  {
    id: 'q11',
    type: 'short-answer',
    question: 'A rectangular playground is 25 m long and 18 m wide. How much fencing is needed to enclose it?',
    correctAnswer: '86 meters',
    topic: 'Rectangles',
  },
]

const userAnswers = ref({})
const feedback = ref({})
const submitted = ref(false)
const score = ref(0)
const pastResults = ref([])

const submitAll = async () => {
  let totalScore = 0

  questions.forEach((q) => {
    const userInput = (userAnswers.value[q.id] || '').trim().toLowerCase()
    const correct = q.correctAnswer.trim().toLowerCase()

    const isCorrect = userInput === correct

    feedback.value[q.id] = {
      isCorrect,
      message: isCorrect ? '✅ Correct!' : `❌ Incorrect. Correct Answer: ${q.correctAnswer}`,
    }

    if (isCorrect) totalScore++
  })

  score.value = totalScore
  submitted.value = true

  await saveResultsToFirestore()
  await fetchPastResults()
}

const saveResultsToFirestore = async () => {
  const result = {
    score: score.value,
    total: questions.length,
    answers: userAnswers.value,
    feedback: feedback.value,
    timestamp: serverTimestamp(),
    topic: 'Rectangles',
  }

  try {
    await addDoc(collection(db, 'practice_results'), result)
    console.log('Results saved to Firestore')
  } catch (error) {
    console.error('Error saving results:', error)
  }
}

const fetchPastResults = async () => {
  const resultsQuery = query(
    collection(db, 'practice_results'),
    orderBy('timestamp', 'desc')
  )

  const querySnapshot = await getDocs(resultsQuery)
  pastResults.value = querySnapshot.docs.map((doc) => doc.data())
}

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return ''
  const date = timestamp.toDate()
  return date.toLocaleString()
}

onMounted(() => {
  fetchPastResults()
})
</script>

<style scoped>
.practice-container {
  padding: 2rem;
  max-width: 800px;
  margin: auto;
}

.question-card {
  background: #f9f9f9;
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

input[type="text"] {
  padding: 8px;
  margin-top: 0.5rem;
  width: 100%;
  max-width: 400px;
}

.submit-all-btn {
  margin-top: 2rem;
  padding: 10px 20px;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.submit-all-btn:hover {
  background: #3756d8;
}

.correct {
  color: green;
  font-weight: bold;
}

.wrong {
  color: red;
  font-weight: bold;
}

.overall-result {
  margin-top: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.past-results {
  margin-top: 3rem;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 6px;
}

.past-results h3 {
  margin-bottom: 10px;
}

.past-results ul {
  list-style: none;
  padding: 0;
}

.past-results li {
  padding: 4px 0;
  border-bottom: 1px dashed #ccc;
}
</style>
