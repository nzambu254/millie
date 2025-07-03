<template>
  <div class="login-container">
    <div class="login-illustration">
      <img src="/images/pic1.jpeg" alt="Geometry Learning Illustration" class="login-image">
      <div class="image-overlay">
        <h2>Master Geometry with Interactive Tools</h2>
        <p>Visualize concepts, solve problems, and track your progress</p>
      </div>
    </div>
    
    <div class="login-box">
      <div class="login-header">
        <svg class="login-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
        <h2>{{ isRegistering ? 'Create an Account' : 'Welcome Back' }}</h2>
        <p>{{ isRegistering ? 'Join our geometry learning community' : 'Continue your geometry learning journey' }}</p>
      </div>

      <form @submit.prevent="isRegistering ? register() : login()">
        <div class="input-group" v-if="isRegistering">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          <input type="text" v-model="fullName" placeholder="Full Name" required />
        </div>

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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <select v-model="role" class="role-select" required>
            <option value="" disabled selected>Select your role</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="!loading">{{ isRegistering ? 'Create Account' : 'Sign In' }}</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="login-footer">
        <div class="toggle-auth" @click="isRegistering = !isRegistering">
          {{ isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register" }}
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
          Back to Home
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
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const fullName = ref('')
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
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: fullName.value
    })
    
    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email.value,
      displayName: fullName.value,
      role: role.value,
      status: 'active',
      createdAt: new Date().toISOString()
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
.login-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.login-illustration {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  text-align: center;
}

.image-overlay h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.image-overlay p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.login-box {
  width: 450px;
  background-color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
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
  font-weight: 700;
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

.login-box input, .role-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #f8fafc;
}

.login-box input:focus, .role-select:focus {
  border-color: #4facfe;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2);
  background-color: white;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  box-sizing: border-box;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(74, 172, 254, 0.4);
}

.login-btn:disabled {
  background: #b0d4ff;
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
  text-align: center;
}

.toggle-auth {
  color: #4facfe;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.toggle-auth:hover {
  color: #3a9bf7;
  text-decoration: underline;
}

.forgot-password {
  background: transparent;
  border: none;
  color: #4facfe;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  font-weight: 500;
  transition: color 0.3s ease;
  margin-bottom: 1rem;
}

.forgot-password:hover:not(:disabled) {
  color: #3a9bf7;
  text-decoration: underline;
}

.forgot-password:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.message {
  font-size: 0.9rem;
  margin: 0.5rem 0;
  padding: 0.75rem;
  border-radius: 8px;
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

@media (max-width: 1024px) {
  .login-illustration {
    display: none;
  }
  
  .login-box {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    box-shadow: none;
  }
}

@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }
  
  .login-box h2 {
    font-size: 1.5rem;
  }
  
  .login-box input, .role-select {
    padding: 0.75rem 1rem 0.75rem 40px;
  }
  
  .input-icon {
    left: 12px;
  }
}
</style>