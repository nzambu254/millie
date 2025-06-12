<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="register-container">
    <h2>Create New User</h2>
    <form @submit.prevent="register">
      <input v-model="email" placeholder="User Email" type="email" required />
      <select v-model="role" required>
        <option disabled value="">Select Role</option>
        <option value="student">Student</option>
        <option value="admin">Teacher/Admin</option>
      </select>
      <button type="submit">Register & Send Reset Link</button>
    </form>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'

const email = ref('')
const role = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const tempPassword = 'TempUser@123'

const register = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, tempPassword)

    await setDoc(doc(db, 'users', cred.user.uid), {
      email: email.value,
      role: role.value,
      createdAt: serverTimestamp()
    })

    await sendPasswordResetEmail(auth, email.value)

    successMessage.value = `User registered. A password reset link has been sent to ${email.value}.`
    email.value = ''
    role.value = ''
  } catch (err) {
    errorMessage.value = err.message
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

input, select {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #4facfe;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.success {
  color: green;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
