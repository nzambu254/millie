<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <svg class="login-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
        <h2>{{ isRegistering ? 'Create an Account' : 'Login to Your Account' }}</h2>
        <p>{{ isRegistering ? 'Please fill in your details' : 'Please enter your email and password' }}</p>
      </div>

      <form @submit.prevent="isRegistering ? register() : login()">
        <div class="input-group">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <input type="email" v-model="email" placeholder="Email" required />
        </div>
        
        <div class="input-group">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <input type="password" v-model="password" placeholder="Password" required />
        </div>

        <div class="input-group" v-if="isRegistering">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <select v-model="role" class="role-select" required>
            <option value="" disabled selected>Select your role</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="!loading">{{ isRegistering ? 'Register' : 'Login' }}</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="login-footer">
        <div class="toggle-auth" @click="isRegistering = !isRegistering">
          {{ isRegistering ? 'Already have an account? Login' : "Don't have an account? Register" }}
        </div>

        <button v-if="!isRegistering" class="forgot-password" @click="forgotPassword" :disabled="loading">
          Forgot Password?
        </button>
        
        <p class="message error" v-if="error">{{ error }}</p>
        <p class="message success" v-if="success">{{ success }}</p>
        
        <RouterLink to="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Landing
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const role = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const isRegistering = ref(false)
const router = useRouter()

const login = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    
    // Redirect based on role stored in Firestore
    const userDocRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userDocRef)

    if (!userSnap.exists()) {
      error.value = 'User data not found. Please contact administrator.'
      return
    }

    const userData = userSnap.data()
    const userRole = userData.role || 'student'
    
    if (userRole === 'admin') {
      await router.push('/admin')
    } else {
      await router.push('/dashboard')
    }
    
  } catch (err) {
    console.error('Login error:', err)
    handleAuthError(err)
  } finally {
    loading.value = false
  }
}

const register = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    
    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email.value,
      role: role.value,
      createdAt: new Date()
    })

    // Redirect based on role
    if (role.value === 'admin') {
      await router.push('/admin')
    } else {
      await router.push('/dashboard')
    }
    
  } catch (err) {
    console.error('Registration error:', err)
    handleAuthError(err)
  } finally {
    loading.value = false
  }
}

const forgotPassword = async () => {
  error.value = ''
  success.value = ''
  
  if (!email.value) {
    error.value = 'Please enter your email address first to reset password.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  
  try {
    await sendPasswordResetEmail(auth, email.value)
    success.value = `Password reset link sent to ${email.value}. Please check your inbox and spam folder.`
  } catch (err) {
    console.error('Password reset error:', err)
    handleAuthError(err)
  } finally {
    loading.value = false
  }
}

const handleAuthError = (err) => {
  switch (err.code) {
    case 'auth/user-not-found':
      error.value = 'No account found with this email address.'
      break
    case 'auth/wrong-password':
      error.value = 'Incorrect password. Please try again.'
      break
    case 'auth/invalid-email':
      error.value = 'Please enter a valid email address.'
      break
    case 'auth/email-already-in-use':
      error.value = 'This email is already registered. Please login instead.'
      break
    case 'auth/weak-password':
      error.value = 'Password should be at least 6 characters.'
      break
    case 'auth/user-disabled':
      error.value = 'This account has been disabled. Please contact administrator.'
      break
    case 'auth/too-many-requests':
      error.value = 'Too many failed attempts. Please try again later.'
      break
    case 'auth/network-request-failed':
      error.value = 'Network error. Please check your internet connection.'
      break
    default:
      error.value = err.message || (isRegistering.value ? 'Registration failed.' : 'Login failed.')
  }
}
</script>

<style scoped>
.toggle-auth {
  color: #4facfe;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-decoration: underline;
}

.toggle-auth:hover {
  color: #3a9bf7;
}

.role-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  appearance: none;
  background-color: white;
  color: #333;
}

.role-select:focus {
  border-color: #4facfe;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2);
}


* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.login-box {
  background-color: white;
  color: #333;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  box-sizing: border-box;
}

.login-header {
  margin-bottom: 2rem;
}

.login-icon {
  width: 60px;
  height: 60px;
  fill: #4facfe;
  margin-bottom: 1rem;
}

.login-box h2 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.8rem;
}

.login-box p {
  margin-bottom: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.input-group {
  position: relative;
  margin-bottom: 1.25rem;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: #7f8c8d;
  z-index: 1;
}

.login-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-box input:focus {
  border-color: #4facfe;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2);
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4facfe;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  box-sizing: border-box;
}

.login-btn:hover:not(:disabled) {
  background-color: #3a9bf7;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-btn:disabled {
  background-color: #b0d4ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 1.5rem;
}

.forgot-password {
  background: transparent;
  border: none;
  color: #4facfe;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  text-decoration: underline;
  margin-bottom: 1rem;
}

.forgot-password:hover:not(:disabled) {
  color: #3a9bf7;
}

.forgot-password:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.message {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  word-wrap: break-word;
}

.error {
  color: #e74c3c;
  background-color: #fdecea;
}

.success {
  color: #2ecc71;
  background-color: #e8f8f0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #7f8c8d;
  text-decoration: none;
  margin-top: 1rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #4facfe;
}

.back-link svg {
  margin-right: 6px;
  fill: currentColor;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-box {
    padding: 1.5rem;
  }
  
  .login-box h2 {
    font-size: 1.5rem;
  }
  
  .login-box input {
    padding: 0.75rem 1rem 0.75rem 40px;
  }
  
  .input-icon {
    left: 12px;
  }
}
</style>