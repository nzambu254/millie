<template>
  <div class="admin-dashboard">
    <h2>Admin Dashboard</h2>

    <section class="upload-section">
      <h3>Upload New Assessment Question</h3>
      <form @submit.prevent="addQuestion">
        <input v-model="newQuestion.text" placeholder="Question" required />
        <input v-model.number="newQuestion.answer" type="number" placeholder="Correct Answer" required />
        <button type="submit">Add Question</button>
      </form>
    </section>

    <section class="register-section">
      <h3>Create New User</h3>
      <form @submit.prevent="register">
        <input v-model="email" type="email" placeholder="User Email" required />
        <select v-model="role" required>
          <option disabled value="">Select Role</option>
          <option value="student">Student</option>
          <option value="admin">Teacher/Admin</option>
        </select>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : 'Register & Send Reset Link' }}
        </button>
      </form>
      <p class="success" v-if="successMessage">{{ successMessage }}</p>
      <p class="error" v-if="errorMessage">{{ errorMessage }}</p>
    </section>

    <section class="scores-section">
      <h3>Student Assessment Scores</h3>
      <ul>
        <li v-for="result in results" :key="result.id">
          {{ result.email }}: {{ result.score }}/{{ result.total }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

const newQuestion = ref({ text: '', answer: null })
const results = ref([])

const email = ref('')
const role = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const tempPassword = 'TempUser@123' // Consider generating a random password

const addQuestion = async () => {
  await addDoc(collection(db, 'assessments'), newQuestion.value)
  newQuestion.value = { text: '', answer: null }
  alert('Question added')
}

const register = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Create the user
    const cred = await createUserWithEmailAndPassword(auth, email.value, tempPassword)

    // Add user data to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: email.value,
      role: role.value,
      createdAt: serverTimestamp()
    })

    // Add a small delay before sending the reset email
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Send password reset email
    await sendPasswordResetEmail(auth, email.value)

    successMessage.value = `User registered and password reset email sent to ${email.value}.`
    email.value = ''
    role.value = ''
  } catch (err) {
    errorMessage.value = err.message
    console.error('Registration error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const resultSnap = await getDocs(collection(db, 'assessmentResults'))
  const usersSnap = await getDocs(collection(db, 'users'))

  const userMap = Object.fromEntries(usersSnap.docs.map(doc => [doc.id, doc.data().email]))

  results.value = resultSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    email: userMap[doc.id] || 'Unknown'
  }))
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f1f1f1;
  border-radius: 12px;
}

section {
  margin-bottom: 2rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input, select {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

button {
  padding: 0.75rem;
  background-color: #4facfe;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background-color: #00c6ff;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>