<template>
  <div class="app-container">
    <!-- Header with user info and logout (only when authenticated) -->
    <header v-if="showHeader" class="app-header">
      <div class="header-content">
        <div class="user-profile">
          <button @click="logout" class="logout-btn">
            <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34 3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span class="user-email">{{ currentUserEmail }}</span>
            <svg class="logout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content container -->
    <main class="main-content">
      <div class="system-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '@/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()
const currentUserEmail = ref('')

// List of routes where header should be hidden
const noHeaderRoutes = ['/', '/login']

// Flag to prevent auth state changes during user registration
const isRegistering = ref(false)

// Compute whether to show header - show if user is authenticated, regardless of route
const showHeader = computed(() => {
  const shouldShow = !!currentUserEmail.value
  console.log('Header visibility check:', {
    currentPath: route.path,
    hasUserEmail: !!currentUserEmail.value,
    userEmail: currentUserEmail.value,
    shouldShow
  })
  return shouldShow
})

// Check auth state
const checkAuthState = () => {
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', { user: user?.email, isRegistering: isRegistering.value })
    
    // If we're in the middle of user registration, ignore auth state changes
    if (isRegistering.value) {
      console.log('Ignoring auth state change during user registration')
      return
    }

    if (user && user.email) {
      console.log('User logged in:', user.email)
      // Strictly set the currently logged-in user's email
      currentUserEmail.value = user.email
      
      // Redirect from auth pages if logged in
      if (['/', '/login'].includes(route.path)) {
        console.log('Redirecting to dashboard from auth page')
        router.push('/dashboard')
      }
    } else {
      console.log('No user logged in')
      // Clear the email when no user is logged in
      currentUserEmail.value = ''
      
      // Redirect to login if trying to access protected pages
      if (!noHeaderRoutes.includes(route.path)) {
        console.log('Redirecting to login from protected page')
        router.push('/login')
      }
    }
  })
}

// Logout function
const logout = async () => {
  try {
    await signOut(auth)
    // Immediately clear the current user email
    currentUserEmail.value = ''
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Expose the registration flag to child components
const setRegistrationFlag = (value) => {
  isRegistering.value = value
}

// Make the function available globally
window.setRegistrationFlag = setRegistrationFlag

// Initialize auth state on mount
onMounted(() => {
  console.log('Initializing auth state...')
  checkAuthState()
  
  // Additional check to ensure we have the current user's email
  if (auth.currentUser && auth.currentUser.email) {
    currentUserEmail.value = auth.currentUser.email
  }
})
</script>

<style>
/* Base styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header styles */
.app-header {
  padding: 0.5rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-icon {
  width: 20px;
  height: 20px;
  fill: #4facfe;
  margin-right: 0.5rem;
}

.user-email {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  margin-right: 0.75rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  min-width: fit-content;
}

.logout-btn:hover {
  background-color: #fdecea;
}

.logout-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  margin-left: 0.5rem;
}

/* Main content styles */
.main-content {
  flex: 1;
  padding: 1rem;
}

.system-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
  box-sizing: border-box;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header {
    padding: 0.5rem 1rem;
  }
  
  .main-content {
    padding: 0.5rem;
  }
  
  .system-container {
    padding: 0.75rem;
  }
  
  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .user-email {
    font-size: 0.8rem;
    max-width: 150px;
    margin-right: 0.5rem;
  }
  
  .user-icon {
    width: 18px;
    height: 18px;
  }
  
  .logout-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .user-email {
    max-width: 120px;
  }
  
  .logout-btn {
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.3rem 0.6rem;
  }
  
  .user-icon,
  .logout-icon {
    width: 16px;
    height: 16px;
  }
}
</style>