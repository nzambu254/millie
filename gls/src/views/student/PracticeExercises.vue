<template>
  <div class="practice-container">
    <!-- Last Performance Section (Always Visible) -->
    <div class="last-performance-section">
      <h2>📊 Your Last Performance</h2>
      <div v-if="lastPerformance" class="last-performance-card">
        <div class="performance-header">
          <h3>Last Attempt Results</h3>
          <p class="attempt-date">{{ formatDate(lastPerformance.timestamp) }}</p>
        </div>
        
        <div class="performance-summary">
          <div class="score-display">
            <div class="score-circle" :class="getScoreClass(lastPerformance.score, lastPerformance.total)">
              <span class="score-text">{{ lastPerformance.score }}/{{ lastPerformance.total }}</span>
              <span class="percentage">{{ Math.round((lastPerformance.score / lastPerformance.total) * 100) }}%</span>
            </div>
          </div>
          
          <div class="performance-details">
            <div class="detail-item">
              <span class="label">Topic:</span>
              <span class="value">{{ lastPerformance.topic }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Correct Answers:</span>
              <span class="value correct">{{ lastPerformance.score }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Wrong Answers:</span>
              <span class="value wrong">{{ lastPerformance.total - lastPerformance.score }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Performance:</span>
              <span class="value" :class="getPerformanceClass(lastPerformance.score, lastPerformance.total)">
                {{ getPerformanceLabel(lastPerformance.score, lastPerformance.total) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Review of Wrong Answers -->
        <div v-if="lastPerformance.wrongAnswers && lastPerformance.wrongAnswers.length" class="wrong-answers-review">
          <h4>❌ Questions You Got Wrong:</h4>
          <div class="wrong-answer-item" v-for="(item, index) in lastPerformance.wrongAnswers" :key="index">
            <p class="question-text">{{ item.question }}</p>
            <p class="your-answer">Your Answer: <span class="wrong">{{ item.yourAnswer || 'Not answered' }}</span></p>
            <p class="correct-answer">Correct Answer: <span class="correct">{{ item.correctAnswer }}</span></p>
          </div>
        </div>

        <div class="performance-actions">
          <button @click="retakeTest" class="retake-btn">🔄 Retake Test</button>
          <button @click="clearLastPerformance" class="clear-btn">🗑️ Clear History</button>
        </div>
      </div>
      
      <div v-else class="no-performance">
        <div class="no-performance-content">
          <h3>🎯 Ready to Start?</h3>
          <p>You haven't taken any practice tests yet. Your last performance will be saved here for quick review.</p>
          <button @click="scrollToPractice" class="start-btn">Start Practice Test</button>
        </div>
      </div>
    </div>

    <!-- Practice Section -->
    <div class="practice-section">
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
    </div>

    <!-- Assignment Submission Section -->
    <div class="assignment-section">
      <h2>Submit Assignment</h2>
      <div class="assignment-card">
        <textarea
          v-model="assignmentText"
          placeholder="Type your assignment here..."
          rows="6"
        ></textarea>
        <button @click="submitAssignment" :disabled="!assignmentText.trim()">
          Submit Assignment
        </button>
        <p v-if="assignmentSubmitted" class="success-message">
          Assignment submitted successfully! Admin will review it.
        </p>
      </div>

      <!-- Past Assignments with Feedback -->
      <div v-if="pastAssignments.length" class="past-assignments">
        <h3>📝 Your Past Assignments</h3>
        <div v-for="(assignment, index) in pastAssignments" :key="index" class="assignment-item">
          <div class="assignment-content">
            <p><strong>Submitted:</strong> {{ formatDate(assignment.timestamp) }}</p>
            <p><strong>Your Work:</strong> {{ assignment.content }}</p>
            <p v-if="assignment.feedback" class="feedback">
              <strong>Admin Feedback:</strong> {{ assignment.feedback }}
            </p>
            <p v-else class="pending">Pending review by admin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Past Results Section -->
    <div class="results-section">
      <h2>Your Performance History</h2>
      
      <!-- Past Attempts Summary -->
      <div class="past-results" v-if="pastResults.length">
        <h3>📊 Past Attempts Summary</h3>
        <div class="attempts-chart">
          <div 
            v-for="(result, i) in pastResults" 
            :key="i" 
            class="attempt-bar"
            :style="{ height: (result.score / result.total * 100) + 'px' }"
            :title="`Score: ${result.score}/${result.total}`"
          >
            <span>{{ result.score }}/{{ result.total }}</span>
          </div>
        </div>
      </div>

      <!-- Detailed Question History -->
      <div class="question-history" v-if="submitted || pastResults.length">
        <h3>📋 Question-by-Question Performance</h3>
        <div v-for="(q, index) in questions" :key="q.id" class="history-item">
          <p><strong>Q{{ index + 1 }}:</strong> {{ q.question }}</p>
          <p v-if="feedback[q.id]">
            <span :class="{ correct: feedback[q.id].isCorrect, wrong: !feedback[q.id].isCorrect }">
              {{ feedback[q.id].isCorrect ? '✅ Correct' : '❌ Incorrect' }}
            </span>
            <span v-if="!feedback[q.id].isCorrect"> - Correct answer: {{ q.correctAnswer }}</span>
          </p>
          <p v-else>Not attempted yet</p>
        </div>
      </div>

      <!-- Performance Report Section -->
      <div class="performance-report" v-if="submitted || pastResults.length">
        <h3>📈 Performance Report</h3>
        
        <div class="report-summary">
          <h4>Overall Performance</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-value">{{ calculateAverageScore() }}%</span>
              <span class="stat-label">Average Score</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ highestScore() }}</span>
              <span class="stat-label">Highest Score</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalAttempts }}</span>
              <span class="stat-label">Total Attempts</span>
            </div>
          </div>
        </div>

        <div class="strengths-weaknesses">
          <div class="strengths">
            <h4>✅ Your Strengths</h4>
            <ul v-if="strengths.length">
              <li v-for="(strength, index) in strengths" :key="'strength-'+index">
                {{ strength }}
              </li>
            </ul>
            <p v-else>No consistent strengths identified yet.</p>
          </div>
          
          <div class="weaknesses">
            <h4>❌ Areas Needing Improvement</h4>
            <ul v-if="weaknesses.length">
              <li v-for="(weakness, index) in weaknesses" :key="'weakness-'+index">
                {{ weakness }}
              </li>
            </ul>
            <p v-else>No consistent weaknesses identified yet.</p>
          </div>
        </div>

        <div class="progress-trend">
          <h4>📅 Progress Over Time</h4>
          <div class="trend-chart">
            <div 
              v-for="(result, index) in pastResults" 
              :key="'trend-'+index"
              class="trend-point"
              :style="{ left: (index * 30) + 'px', bottom: (result.score / result.total * 100) + 'px' }"
              :title="`Attempt ${index + 1}: ${result.score}/${result.total}`"
            ></div>
          </div>
          <div class="trend-labels">
            <span>First Attempt</span>
            <span>Latest Attempt</span>
          </div>
        </div>

        <div class="topic-mastery">
          <h4>📚 Topic Mastery Breakdown</h4>
          <div class="mastery-item" v-for="(topic, index) in topicPerformance" :key="'topic-'+index">
            <div class="topic-name">{{ topic.name }}</div>
            <div class="mastery-bar">
              <div 
                class="mastery-level" 
                :style="{ width: topic.accuracy + '%' }"
                :class="getMasteryClass(topic.accuracy)"
              ></div>
              <span class="mastery-percent">{{ topic.accuracy }}%</span>
            </div>
          </div>
        </div>

        <button class="print-report-btn" @click="printReport">Print Performance Report</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  orderBy, 
  query, 
  serverTimestamp,
  where 
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const auth = getAuth()
const userId = ref(auth.currentUser?.uid || '')

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
const assignmentText = ref('')
const assignmentSubmitted = ref(false)
const pastAssignments = ref([])
const lastPerformance = ref(null)

// Performance report computed properties
const totalAttempts = computed(() => pastResults.value.length)

const strengths = computed(() => {
  if (!pastResults.value.length) return []
  
  // Identify questions that were consistently answered correctly
  const correctCounts = {}
  questions.forEach(q => {
    correctCounts[q.id] = 0
  })
  
  pastResults.value.forEach(result => {
    questions.forEach(q => {
      if (result.feedback[q.id]?.isCorrect) {
        correctCounts[q.id]++
      }
    })
  })
  
  const strongQuestions = questions.filter(q => {
    return correctCounts[q.id] === pastResults.value.length
  })
  
  return strongQuestions.map(q => q.question.substring(0, 50) + (q.question.length > 50 ? '...' : ''))
})

const weaknesses = computed(() => {
  if (!pastResults.value.length) return []
  
  // Identify questions that were consistently answered incorrectly
  const incorrectCounts = {}
  questions.forEach(q => {
    incorrectCounts[q.id] = 0
  })
  
  pastResults.value.forEach(result => {
    questions.forEach(q => {
      if (result.feedback[q.id] && !result.feedback[q.id].isCorrect) {
        incorrectCounts[q.id]++
      }
    })
  })
  
  const weakQuestions = questions.filter(q => {
    return incorrectCounts[q.id] === pastResults.value.length
  })
  
  return weakQuestions.map(q => q.question.substring(0, 50) + (q.question.length > 50 ? '...' : ''))
})

const topicPerformance = computed(() => {
  const topics = {}
  
  // Group questions by topic
  questions.forEach(q => {
    if (!topics[q.topic]) {
      topics[q.topic] = {
        total: 0,
        correct: 0
      }
    }
    topics[q.topic].total++
  })
  
  // Calculate correct answers per topic across all attempts
  pastResults.value.forEach(result => {
    questions.forEach(q => {
      if (result.feedback[q.id]?.isCorrect) {
        topics[q.topic].correct++
      }
    })
  })
  
  // Convert to array with accuracy percentages
  return Object.keys(topics).map(topic => {
    const accuracy = totalAttempts.value > 0 
      ? Math.round((topics[topic].correct / (topics[topic].total * totalAttempts.value)) * 100)
      : 0
    return {
      name: topic,
      accuracy: accuracy,
      totalQuestions: topics[topic].total
    }
  })
})

const calculateAverageScore = () => {
  if (pastResults.value.length === 0) return 0
  const total = pastResults.value.reduce((sum, result) => sum + result.score, 0)
  return Math.round((total / (pastResults.value.length * questions.length)) * 100)
}

const highestScore = () => {
  if (pastResults.value.length === 0) return '0/' + questions.length
  const max = Math.max(...pastResults.value.map(result => result.score))
  return max + '/' + questions.length
}

const getMasteryClass = (accuracy) => {
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 60) return 'good'
  if (accuracy >= 40) return 'fair'
  return 'poor'
}

// New functions for last performance
const loadLastPerformance = () => {
  try {
    const saved = localStorage.getItem('lastPerformance')
    if (saved) {
      lastPerformance.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading last performance:', error)
  }
}

const saveLastPerformance = (performanceData) => {
  try {
    localStorage.setItem('lastPerformance', JSON.stringify(performanceData))
    lastPerformance.value = performanceData
  } catch (error) {
    console.error('Error saving last performance:', error)
  }
}

const getScoreClass = (score, total) => {
  const percentage = (score / total) * 100
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

const getPerformanceClass = (score, total) => {
  const percentage = (score / total) * 100
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

const getPerformanceLabel = (score, total) => {
  const percentage = (score / total) * 100
  if (percentage >= 80) return 'Excellent'
  if (percentage >= 60) return 'Good'
  if (percentage >= 40) return 'Fair'
  return 'Needs Improvement'
}

const clearLastPerformance = () => {
  localStorage.removeItem('lastPerformance')
  lastPerformance.value = null
}

const retakeTest = () => {
  // Reset the current test
  userAnswers.value = {}
  feedback.value = {}
  submitted.value = false
  score.value = 0
  
  // Scroll to practice section
  scrollToPractice()
}

const scrollToPractice = () => {
  const practiceSection = document.querySelector('.practice-section')
  if (practiceSection) {
    practiceSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const submitAll = async () => {
  let totalScore = 0
  const wrongAnswers = []

  questions.forEach((q) => {
    const userInput = (userAnswers.value[q.id] || '').trim().toLowerCase()
    const correct = q.correctAnswer.trim().toLowerCase()

    const isCorrect = userInput === correct

    feedback.value[q.id] = {
      isCorrect,
      message: isCorrect ? '✅ Correct!' : `❌ Incorrect. Correct Answer: ${q.correctAnswer}`,
    }

    if (isCorrect) {
      totalScore++
    } else {
      wrongAnswers.push({
        question: q.question,
        yourAnswer: userAnswers.value[q.id] || '',
        correctAnswer: q.correctAnswer
      })
    }
  })

  score.value = totalScore
  submitted.value = true

  // Save last performance to localStorage
  const performanceData = {
    score: totalScore,
    total: questions.length,
    timestamp: new Date().toISOString(),
    topic: 'Rectangles',
    wrongAnswers: wrongAnswers,
    answers: userAnswers.value,
    feedback: feedback.value
  }
  
  saveLastPerformance(performanceData)

  await saveResultsToFirestore()
  await fetchPastResults()
}

const saveResultsToFirestore = async () => {
  const result = {
    userId: userId.value,
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
  if (!userId.value) return

  const resultsQuery = query(
    collection(db, 'practice_results'),
    where('userId', '==', userId.value),
    orderBy('timestamp', 'desc')
  )

  try {
    const querySnapshot = await getDocs(resultsQuery)
    pastResults.value = querySnapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching past results:', error)
  }
}

const submitAssignment = async () => {
  if (!assignmentText.value.trim()) return

  const assignment = {
    userId: userId.value,
    content: assignmentText.value,
    timestamp: serverTimestamp(),
    feedback: '',
    status: 'submitted',
    topic: 'Rectangles'
  }

  try {
    await addDoc(collection(db, 'assignments'), assignment)
    assignmentSubmitted.value = true
    assignmentText.value = ''
    setTimeout(() => assignmentSubmitted.value = false, 3000)
    fetchPastAssignments()
  } catch (error) {
    console.error('Error submitting assignment:', error)
  }
}

const fetchPastAssignments = async () => {
  if (!userId.value) return

  const assignmentsQuery = query(
    collection(db, 'assignments'),
    where('userId', '==', userId.value),
    orderBy('timestamp', 'desc')
  )

  try {
    const querySnapshot = await getDocs(assignmentsQuery)
    pastAssignments.value = querySnapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching past assignments:', error)
  }
}

const formatDate = (timestamp) => {
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString()
  }
  if (!timestamp?.toDate) return ''
  const date = timestamp.toDate()
  return date.toLocaleString()
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  userId.value = auth.currentUser?.uid || ''
  
  // Load last performance from localStorage
  loadLastPerformance()
  
  if (userId.value) {
    fetchPastResults()
    fetchPastAssignments()
  }
})
</script>

<style scoped>
.practice-container {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.last-performance-section {
  grid-column: 1 / -1;
  margin-bottom: 2rem;
}

.last-performance-card {
  background: linear-gradient(135deg, #070707 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.performance-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.attempt-date {
  opacity: 0.9;
  margin: 0;
}

.performance-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.score-display {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.score-circle.excellent {
  border-color: #4caf50;
  background: rgba(76,175,80,0.2);
}

.score-circle.good {
  border-color: #2196f3;
  background: rgba(33,150,243,0.2);
}

.score-circle.fair {
  border-color: #ff9800;
  background: rgba(255,152,0,0.2);
}

.score-circle.poor {
  border-color: #f44336;
  background: rgba(244,67,54,0.2);
}

.score-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.percentage {
  font-size: 1rem;
  opacity: 0.9;
}

.performance-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.value {
  font-size: 1.1rem;
  font-weight: bold;
}

.value.excellent {
  color: #4caf50;
}

.value.good {
  color: #2196f3;
}

.value.fair {
  color: #ff9800;
}

.value.poor {
  color: #f44336;
}

.wrong-answers-review {
  background: rgba(255,255,255,0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.wrong-answers-review h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.wrong-answer-item {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #f44336;
}

.question-text {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.your-answer, .correct-answer {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.performance-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.retake-btn {
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.retake-btn:hover {
  background: #45a049;
}

.clear-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 12px 24px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;

}

.clear-btn:hover {
  background: rgba(255,255,255,0.3);
}

.no-performance {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #dee2e6;
}

.no-performance-content {
  max-width: 600px;
  margin: 0 auto;
}

.start-btn {
  background: #2196f3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  transition: background 0.3s;
}

.start-btn:hover {
  background: #0b7dda;
}

.practice-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.question-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2196f3;
}

.submit-all-btn {
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: block;
  margin: 2rem auto 0;
  transition: background 0.3s;
}

.submit-all-btn:hover {
  background: #45a049;
}

.overall-result {
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;
}

.assignment-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.assignment-card {
  margin-bottom: 2rem;
}

.assignment-card textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-family: inherit;
}

.assignment-card button {
  background: #2196f3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.assignment-card button:hover {
  background: #0b7dda;
}

.assignment-card button:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}

.success-message {
  color: #4caf50;
  font-weight: bold;
  margin-top: 1rem;
}

.past-assignments {
  margin-top: 2rem;
}

.assignment-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.feedback {
  color: #2196f3;
  font-weight: bold;
}

.pending {
  color: #ff9800;
  font-weight: bold;
}

.results-section {
  grid-column: 1 / -1;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.past-results {
  margin-bottom: 2rem;
}

.attempts-chart {
  display: flex;
  gap: 1rem;
  height: 200px;
  align-items: flex-end;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.attempt-bar {
  flex: 1;
  background: #2196f3;
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 0.5rem;
  color: white;
  font-size: 0.8rem;
  min-width: 40px;
  transition: height 0.5s ease;
}

.question-history {
  margin-bottom: 2rem;
}

.history-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.correct {
  color: #4caf50;
  font-weight: bold;
}

.wrong {
  color: #f44336;
  font-weight: bold;
}

.performance-report {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.report-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.strengths-weaknesses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.strengths, .weaknesses {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.strengths h4 {
  color: #4caf50;
}

.weaknesses h4 {
  color: #f44336;
}

.progress-trend {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.trend-chart {
  position: relative;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 1rem 0;
}

.trend-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #2196f3;
  border-radius: 50%;
  transform: translate(-6px, 6px);
  transition: all 0.5s ease;
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.topic-mastery {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.mastery-item {
  margin-bottom: 1rem;
}

.topic-name {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.mastery-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.mastery-level {
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease;
}

.mastery-level.excellent {
  background: #4caf50;
}

.mastery-level.good {
  background: #2196f3;
}

.mastery-level.fair {
  background: #ff9800;
}

.mastery-level.poor {
  background: #f44336;
}

.mastery-percent {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.print-report-btn {
  background: #2196f3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: block;
  margin: 2rem auto 0;
  transition: background 0.3s;
}

.print-report-btn:hover {
  background: #0b7dda;
}

@media print {
  .practice-container {
    grid-template-columns: 1fr;
    padding: 0;
  }
  
  .last-performance-section,
  .assignment-section,
  .performance-actions,
  .submit-all-btn,
  .assignment-card button {
    display: none;
  }
  
  .performance-report {
    break-inside: avoid;
  }
}

@media (max-width: 768px) {
  .practice-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .performance-summary {
    grid-template-columns: 1fr;
  }
  
  .strengths-weaknesses {
    grid-template-columns: 1fr;
  }
  
  .performance-details {
    grid-template-columns: 1fr;
  }
}
</style>
