<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login to Your Account</h2>
      <p>Please enter your email and password</p>

      <form @submit.prevent="login">
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <button class="forgot-password" @click="forgotPassword" :disabled="loading">
        Forgot Password?
      </button>

      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-if="success">{{ success }}</p>

      <RouterLink to="/">← Back to Landing</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const router = useRouter()

const ADMIN_EMAIL = 'awinomillie22@gmail.com'
const ADMIN_PASSWORD = '1234567'

const login = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    if (email.value === ADMIN_EMAIL && password.value === ADMIN_PASSWORD) {
      router.push('/admin')
      return
    }

    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    const userDocRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userDocRef)

    if (!userSnap.exists()) {
      error.value = 'User data not found.'
      return
    }

    const role = userSnap.data().role
    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'student') {
      router.push('/Dashboard')
    } else {
      error.value = 'Role not recognized.'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const forgotPassword = async () => {
  error.value = ''
  success.value = ''
  if (!email.value) {
    error.value = 'Please enter your email first to reset password.'
    return
  }

  loading.value = true
  try {
    if (email.value === ADMIN_EMAIL) {
      success.value = `Password reset link sent to ${email.value} (simulate).`
      return
    }
    await sendPasswordResetEmail(auth, email.value)
    success.value = `Password reset link sent to ${email.value}. Check your inbox.`
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  color: white;
}

.login-box {
  background-color: white;
  color: #333;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-box h2 {
  margin-bottom: 0.5rem;
}

.login-box p {
  margin-bottom: 1.5rem;
}

.login-box input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.login-box button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4facfe;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-box button:hover {
  background-color: #00c6ff;
}

.forgot-password {
  margin-top: 1rem;
  background: transparent;
  border: none;
  color: #4facfe;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
}

.forgot-password:disabled {
  cursor: not-allowed;
  color: #ccc;
}

.register-link {
  margin-top: 1rem;
  font-size: 0.95rem;
}

.register-link a {
  color: #4facfe;
  text-decoration: underline;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success {
  color: green;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
