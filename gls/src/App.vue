<template>
  <div class="app-container">
    <!-- Sidebar - only show when not on landing/login pages -->
    <Sidebar 
      v-if="showSidebar"
      :isAdmin="isAdmin" 
      :currentUserEmail="currentUserEmail" 
      :currentUserRole="currentUserRole" 
      :unreadNotifications="unreadNotifications"
    />

    <!-- Main content area -->
    <div class="main-content-wrapper" :class="{ 'no-sidebar': !showSidebar }">
      <!-- Header with user info and logout -->
      <header v-if="showHeader" class="app-header" :class="{ 'admin-header': isAdmin }">
        <div class="header-content">
          <!-- Admin Header -->
          <div v-if="isAdmin" class="admin-controls">
            <span class="admin-badge">ADMIN</span>
            <button @click="logout" class="logout-btn" title="Logout">
              <svg class="logout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span class="logout-text">Logout</span>
            </button>
          </div>

          <!-- Regular User Header -->
          <div v-else class="user-profile-section">
            <div class="user-profile">
              <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34 3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <div class="user-info">
                <span class="user-email">{{ currentUserEmail }}</span>
                <span v-if="currentUserRole" class="user-role">{{ currentUserRole }}</span>
              </div>
            </div>
            <button @click="logout" class="logout-btn" title="Logout">
              <svg class="logout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span class="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="main-content">
        <div class="system-container" :class="{ 'full-width': !showSidebar }">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentUserRole = ref('')
const isRegistering = ref(false)
const unreadNotifications = ref(0)

const isAdmin = computed(() => currentUserRole.value === 'admin')
const currentUserEmail = computed(() => authStore.user?.email || '')

const noSidebarRoutes = ['/', '/login']
const noHeaderRoutes = ['/', '/login']

const showSidebar = computed(() => !!authStore.user && !noSidebarRoutes.includes(route.path))
const showHeader = computed(() => !!authStore.user && !noHeaderRoutes.includes(route.path))

async function checkUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    return userDoc.exists() ? userDoc.data().role || 'user' : 'user'
  } catch (error) {
    console.error('Role check failed:', error)
    return 'user'
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    currentUserRole.value = ''
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(() => {
  authStore.fetchUser()
})

// Watch user changes
watch(
  () => authStore.user,
  async (user) => {
    if (isRegistering.value) return

    if (user) {
      const role = await checkUserRole(user.uid)
      currentUserRole.value = role

      if (['/', '/login'].includes(route.path)) {
        router.push(role === 'admin' ? '/admin' : '/dashboard')
      }
    } else {
      currentUserRole.value = ''
      if (!noHeaderRoutes.includes(route.path)) {
        router.push('/login')
      }
    }
  },
  { immediate: true }
)

// Optional: expose to registration flow
const setRegistrationFlag = (value) => {
  isRegistering.value = value
  if (!value) authStore.fetchUser()
}
window.setRegistrationFlag = setRegistrationFlag
</script>


<style>
/* Layout and container styles */
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content-wrapper {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content-wrapper.no-sidebar {
  margin-left: 0;
}

/* Header */
.app-header {
  padding: 0.5rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 90;
}

.admin-header {
  background-color: #f8f0ff;
}

.header-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* User profile */
.user-profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background-color: #ebeff5;
}

.user-icon {
  width: 20px;
  height: 20px;
  fill: #4a6cf7;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-email {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #fdecea;
}

.logout-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.logout-text {
  font-size: 0.9rem;
}

.admin-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-badge {
  background-color: #6a0dad;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  font-weight: bold;
}

/* Content */
.main-content {
  flex: 1;
  padding: 1rem;
}

.system-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.system-container.full-width {
  max-width: none;
  margin: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content-wrapper {
    margin-left: 70px;
  }

  .main-content-wrapper.no-sidebar {
    margin-left: 0;
  }

  .app-header {
    padding: 0.5rem 1rem;
  }

  .main-content {
    padding: 0.5rem;
  }

  .user-profile-section,
  .admin-controls {
    gap: 0.75rem;
  }

  .user-profile {
    padding: 0.4rem 0.8rem;
    gap: 0.5rem;
  }

  .user-email {
    font-size: 0.8rem;
    max-width: 150px;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
  }

  .logout-text {
    display: none;
  }

  .user-icon,
  .logout-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .main-content-wrapper {
    margin-left: 0;
  }

  .user-email {
    max-width: 120px;
  }

  .user-profile-section,
  .admin-controls {
    gap: 0.5rem;
  }

  .user-profile {
    padding: 0.3rem 0.6rem;
  }

  .logout-btn {
    padding: 0.3rem;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    justify-content: center;
  }

  .user-icon,
  .logout-icon {
    width: 16px;
    height: 16px;
  }

  .admin-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }
}
</style>