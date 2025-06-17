<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <p class="welcome-message">Manage students, assignments, and content</p>
    </header>

    <div class="dashboard-grid">
      <!-- Quick Stats Section -->
      <section class="quick-stats card">
        <h2 class="section-title">
          <span class="icon">📊</span> Student Overview
        </h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ averageScore }}%</div>
            <div class="stat-label">Avg. Score</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activeAssignments }}</div>
            <div class="stat-label">Active Assignments</div>
          </div>
        </div>
        
        <div class="student-list">
          <h3>Recent Students</h3>
          <ul>
            <li v-for="student in recentStudents" :key="student.id" @click="viewStudentProgress(student.id)">
              <span class="student-name">{{ student.name || student.email }}</span>
              <span class="student-score">{{ student.score || '--' }}/{{ student.total || '--' }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- User Registration Section -->
      <section class="register-section card">
        <h2 class="section-title">
          <span class="icon">👥</span> Create New User
        </h2>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input v-model="name" type="text" id="name" placeholder="Mildred Awino" required />
          </div>
          <div class="form-group">
            <label for="email">User Email</label>
            <input v-model="email" type="email" id="email" placeholder="student@example.com" required />
          </div>
          <div class="form-group">
            <label for="role">User Role</label>
            <select v-model="role" id="role" required>
              <option disabled value="">Select Role</option>
              <option value="student">Student</option>
              <option value="admin">Teacher/Admin</option>
            </select>
          </div>
          <button type="submit" :disabled="isLoading" class="primary-button">
            {{ isLoading ? 'Processing...' : 'Register User' }}
          </button>
        </form>
        <div class="status-message">
          <p class="success" v-if="successMessage">{{ successMessage }}</p>
          <p class="error" v-if="errorMessage">{{ errorMessage }}</p>
        </div>
      </section>

      <!-- Assign Practice Section -->
      <section class="assign-practice card">
        <h2 class="section-title">
          <span class="icon">📅</span> Assign Practice
        </h2>
        <form @submit.prevent="assignPractice">
          <div class="form-group">
            <label for="topic">Topic</label>
            <select v-model="practice.topic" id="topic" required>
              <option value="rectangles">Rectangles</option>
              <option value="triangles">Triangles</option>
              <option value="circles">Circles</option>
            </select>
          </div>
          <div class="form-group">
            <label for="deadline">Deadline</label>
            <input v-model="practice.deadline" type="datetime-local" id="deadline" required />
          </div>
          <div class="form-group">
            <label>Assign To</label>
            <div class="student-checkboxes">
              <label v-for="student in allStudents" :key="student.id">
                <input type="checkbox" v-model="practice.assignedStudents" :value="student.id" />
                {{ student.name || student.email }}
              </label>
            </div>
          </div>
          <button type="submit" class="primary-button">Assign Practice</button>
        </form>
      </section>

      <!-- Upload Quiz Section -->
      <section class="upload-quiz card">
        <h2 class="section-title">
          <span class="icon">📝</span> Upload Quiz
        </h2>
        <form @submit.prevent="addQuestion">
          <div class="form-group">
            <label for="question">Question</label>
            <textarea v-model="newQuestion.text" id="question" placeholder="Enter the question..." required></textarea>
          </div>
          <div class="form-group">
            <label for="answer">Correct Answer</label>
            <input v-model.number="newQuestion.answer" type="number" id="answer" placeholder="Numerical answer" required />
          </div>
          <div class="form-group">
            <label for="topic">Question Topic</label>
            <select v-model="newQuestion.topic" id="topic" required>
              <option value="rectangles">Rectangles</option>
              <option value="triangles">Triangles</option>
              <option value="circles">Circles</option>
            </select>
          </div>
          <button type="submit" class="primary-button">Add Question</button>
        </form>
      </section>

      <!-- Custom Lessons Section -->
      <section class="custom-lessons card">
        <h2 class="section-title">
          <span class="icon">🎨</span> Custom Lessons
        </h2>
        <form @submit.prevent="createLesson">
          <div class="form-group">
            <label for="lessonTitle">Lesson Title</label>
            <input v-model="lesson.title" type="text" id="lessonTitle" placeholder="Introduction to Rectangles" required />
          </div>
          <div class="form-group">
            <label for="lessonTopic">Topic</label>
            <select v-model="lesson.topic" id="lessonTopic" required>
              <option value="rectangles">Rectangles</option>
              <option value="triangles">Triangles</option>
              <option value="circles">Circles</option>
            </select>
          </div>
          <div class="form-group">
            <label for="lessonContent">Visual Guide Content</label>
            <textarea v-model="lesson.content" id="lessonContent" placeholder="Enter your lesson content..." required></textarea>
          </div>
          <button type="submit" class="primary-button">Create Lesson</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  collection, getDocs, addDoc, doc, setDoc, 
  serverTimestamp, query, where 
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail
} from 'firebase/auth'

// User Registration
const name = ref('')
const email = ref('')
const role = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const tempPassword = generateRandomPassword()

function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Quiz Questions
const newQuestion = ref({ 
  text: '', 
  answer: null, 
  topic: 'rectangles' 
})

// Practice Assignment
const practice = ref({
  topic: 'rectangles',
  deadline: '',
  assignedStudents: []
})

// Custom Lessons
const lesson = ref({
  title: '',
  topic: 'rectangles',
  content: ''
})

// Student Data
const allStudents = ref([])
const recentStudents = ref([])
const assessmentResults = ref([])

// Stats
const totalStudents = computed(() => allStudents.value.length)
const averageScore = computed(() => {
  if (assessmentResults.value.length === 0) return 0
  const total = assessmentResults.value.reduce((sum, result) => sum + (result.score || 0), 0)
  const max = assessmentResults.value.reduce((sum, result) => sum + (result.total || 0), 0)
  return max > 0 ? Math.round((total / max) * 100) : 0
})
const activeAssignments = ref(0)

// Fetch data on mount
onMounted(async () => {
  try {
    // Fetch all students
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'student'))
    const usersSnap = await getDocs(usersQuery)
    allStudents.value = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    recentStudents.value = [...allStudents.value].slice(0, 5)

    // Fetch assessment results
    const resultsSnap = await getDocs(collection(db, 'assessmentResults'))
    assessmentResults.value = resultsSnap.docs.map(doc => doc.data())

    // TODO: Fetch active assignments count
    activeAssignments.value = 3 // Placeholder - implement actual count

  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})

// Simplified user registration without sign-out
const register = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Validate name
    if (!name.value.trim()) {
      throw new Error('Please enter a valid name')
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      throw new Error('Please enter a valid email address')
    }

    // Create the user account
    const cred = await createUserWithEmailAndPassword(auth, email.value, tempPassword)
    console.log('User created successfully:', cred.user.uid)

    // Add user data to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: name.value.trim(),
      email: email.value,
      role: role.value,
      createdAt: serverTimestamp()
    })
    console.log('User data saved to Firestore')

    // Send password reset email
    try {
      await sendPasswordResetEmail(auth, email.value, {
        url: window.location.origin,
        handleCodeInApp: false
      })
      console.log('Password reset email sent successfully')
    } catch (emailError) {
      console.error('Password reset email failed:', emailError)
      // Continue with success message even if email fails
    }

    successMessage.value = `User ${name.value} registered successfully! Password reset email sent to ${email.value}.`
    
    // Clear form
    name.value = ''
    email.value = ''
    role.value = ''
    
    // Refresh student list if a student was created
    if (role.value === 'student') {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')))
      allStudents.value = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      recentStudents.value = [...allStudents.value].slice(0, 5)
    }

  } catch (err) {
    console.error('Registration error:', err)
    
    // Provide more specific error messages
    let errorMsg = 'Failed to register user. Please try again.'
    
    if (err.code === 'auth/email-already-in-use') {
      errorMsg = 'This email is already registered. Please use a different email.'
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.'
    } else if (err.code === 'auth/weak-password') {
      errorMsg = 'Password is too weak. Please use a stronger password.'
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = 'Too many attempts. Please wait a few minutes before trying again.'
    } else if (err.code === 'auth/network-request-failed') {
      errorMsg = 'Network error. Please check your internet connection and try again.'
    } else if (err.message) {
      errorMsg = err.message
    }
    
    errorMessage.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

// Add new question
const addQuestion = async () => {
  try {
    await addDoc(collection(db, 'assessments'), {
      ...newQuestion.value,
      createdAt: serverTimestamp()
    })
    alert('Question added successfully!')
    newQuestion.value = { text: '', answer: null, topic: 'rectangles' }
  } catch (error) {
    console.error('Error adding question:', error)
    alert('Failed to add question. Please check console for details.')
  }
}

// Assign practice to students
const assignPractice = async () => {
  try {
    await addDoc(collection(db, 'assignments'), {
      topic: practice.value.topic,
      deadline: new Date(practice.value.deadline),
      assignedStudents: practice.value.assignedStudents,
      createdAt: serverTimestamp(),
      status: 'active'
    })
    alert('Practice assigned successfully!')
    practice.value = {
      topic: 'rectangles',
      deadline: '',
      assignedStudents: []
    }
    activeAssignments.value += 1
  } catch (error) {
    console.error('Error assigning practice:', error)
    alert('Failed to assign practice. Please check console for details.')
  }
}

// Create custom lesson
const createLesson = async () => {
  try {
    await addDoc(collection(db, 'lessons'), {
      title: lesson.value.title,
      topic: lesson.value.topic,
      content: lesson.value.content,
      createdAt: serverTimestamp(),
      author: auth.currentUser?.email || 'Unknown'
    })
    alert('Lesson created successfully!')
    lesson.value = {
      title: '',
      topic: 'rectangles',
      content: ''
    }
  } catch (error) {
    console.error('Error creating lesson:', error)
    alert('Failed to create lesson. Please check console for details.')
  }
}

// View student progress
const viewStudentProgress = (studentId) => {
  // TODO: Implement navigation to student progress view
  alert(`Viewing progress for student: ${studentId}`)
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.welcome-message {
  color: #7f8c8d;
  font-size: 1.2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.card {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title .icon {
  font-size: 1.2em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.student-list {
  margin-top: 1.5rem;
}

.student-list h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.student-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.student-list li {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.student-list li:hover {
  background-color: #f8f9fa;
}

.student-name {
  font-weight: 500;
}

.student-score {
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.primary-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-button:hover {
  background-color: #2980b9;
}

.primary-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.status-message {
  margin-top: 1rem;
}

.success {
  color: #27ae60;
  padding: 0.5rem;
  background-color: #e8f5e9;
  border-radius: 4px;
}

.error {
  color: #e74c3c;
  padding: 0.5rem;
  background-color: #fdedec;
  border-radius: 4px;
}

.student-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 6px;
}

.student-checkboxes label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>