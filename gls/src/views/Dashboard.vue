<template>
  <div class="student-dashboard">
    <div class="dashboard-header">
      <h2>Welcome back, {{ userName }}</h2>
      <p class="welcome-message">Track your learning journey and continue where you left off</p>
    </div>

    <div class="progress-summary">
      <div class="overall-progress">
        <h3>Your Overall Progress</h3>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
        <p class="progress-percentage">{{ overallProgress }}% Complete</p>
      </div>
    </div>

    <div class="modules-grid">
      <div 
        v-for="module in unlockedModules" 
        :key="module.id"
        class="module-card"
      >
        <div class="module-icon">
          <span>{{ getModuleIcon(module.id) }}</span>
        </div>
        <h3 class="module-title">{{ module.name }}</h3>
        <div class="module-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: module.completion + '%' }"
            ></div>
          </div>
          <span class="completion-text">{{ module.completion }}%</span>
        </div>
        <router-link 
          :to="getModuleRoute(module.id)"
          class="action-button"
        >
          {{ module.completion === 0 ? 'Start' : module.completion === 100 ? 'Review' : 'Continue' }}
        </router-link>
      </div>
    </div>

    <div class="recent-activity" v-if="recentActivity.length > 0">
      <h3>Recent Activity</h3>
      <ul>
        <li v-for="activity in recentActivity" :key="activity.timestamp">
          <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          <span class="activity-text">{{ activity.message }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

// User data
const userName = ref('')
const progressData = ref([])
const recentActivity = ref([])

// All possible modules - all set to unlocked: true
const allModules = ref([
  { id: 'learn', name: 'Learn', completion: 0, unlocked: true },
  { id: 'visualize', name: 'Visualize', completion: 0, unlocked: true },
  { id: 'practice', name: 'Practice', completion: 0, unlocked: true },
  { id: 'assessment', name: 'Assessment', completion: 0, unlocked: true },
  { id: 'review', name: 'Review', completion: 0, unlocked: true },
  { id: 'apply', name: 'Apply', completion: 0, unlocked: true },
  { id: 'support', name: 'Support', completion: 0, unlocked: true },
  { id: 'progress', name: 'Progress Tracked', completion: 0, unlocked: true }
])

// Computed property to filter only unlocked modules
const unlockedModules = computed(() => {
  return allModules.value.filter(module => module.unlocked)
})

// Computed overall progress based on unlocked modules only
const overallProgress = computed(() => {
  if (unlockedModules.value.length === 0) return 0
  const completedModules = unlockedModules.value.filter(m => m.completion === 100)
  return Math.round((completedModules.length / unlockedModules.value.length) * 100)
})

// Helper functions
const getModuleIcon = (moduleId) => {
  const icons = {
    learn: '📚',
    visualize: '📊',
    practice: '✍️',
    assessment: '📝',
    review: '🔍',
    apply: '🛠️',
    support: '❓',
    progress: '📈'
  }
  return icons[moduleId] || '📁'
}

const getModuleRoute = (moduleId) => {
  return `/modules/${moduleId}`
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Fetch data on mount
onMounted(async () => {
  try {
    // Fetch user profile to get name from 'users' collection
    const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      userName.value = userData.name || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Student'
    } else {
      // Fallback to auth displayName or email if no name found
      userName.value = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Student'
    }

    // Fetch progress data
    const docSnap = await getDoc(doc(db, 'progress', auth.currentUser.uid))
    if (docSnap.exists()) {
      progressData.value = docSnap.data().modules || []
      
      // Update allModules with actual progress, keeping all unlocked
      allModules.value = allModules.value.map(module => {
        const progressModule = progressData.value.find(m => m.id === module.id)
        return {
          ...module,
          completion: progressModule?.completion || 0,
          unlocked: true // Force all modules to be unlocked
        }
      })
    }

    // Fetch recent activity
    const activityQuery = query(
      collection(db, 'activity'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    )
    const activitySnapshot = await getDocs(activityQuery)
    recentActivity.value = activitySnapshot.docs.map(doc => doc.data())
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Fallback username if there's an error
    userName.value = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Student'
  }
})
</script>

<style scoped>
.student-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-header h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.welcome-message {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.progress-summary {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.overall-progress h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.progress-bar {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-percentage {
  text-align: right;
  font-weight: bold;
  color: #4CAF50;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.module-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.module-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.module-title {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.module-progress {
  margin-bottom: 1.5rem;
}

.completion-text {
  display: block;
  text-align: right;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.action-button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: #2980b9;
}

.recent-activity {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-activity h3 {
  margin-top: 0;
  color: #2c3e50;
}

.recent-activity ul {
  list-style: none;
  padding: 0;
}

.recent-activity li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.recent-activity li:last-child {
  border-bottom: none;
}

.activity-time {
  display: inline-block;
  width: 60px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.activity-text {
  color: #2c3e50;
}

@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>