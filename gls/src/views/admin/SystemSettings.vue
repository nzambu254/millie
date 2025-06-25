<template>
  <div class="system-settings">
    <h1>System Settings</h1>
    
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>
    
    <div v-else class="settings-sections">
      <div class="settings-card">
        <h3>Application Settings</h3>
        <div class="setting-item">
          <label>Maintenance Mode</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="maintenanceMode" 
              v-model="settings.maintenanceMode"
              @change="updateFirebaseSetting('maintenanceMode', settings.maintenanceMode)"
            >
            <label for="maintenanceMode" class="toggle-slider"></label>
          </div>
          <p class="setting-description" v-if="settings.maintenanceMode">
            ⚠️ System is in maintenance mode. Regular users won't be able to access.
          </p>
        </div>
        <div class="setting-item">
          <label>System Timezone</label>
          <select 
            v-model="settings.timezone" 
            @change="updateFirebaseSetting('timezone', settings.timezone)"
            class="setting-select"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
      </div>
      
      <div class="settings-card">
        <h3>User Permissions</h3>
        <div class="setting-item">
          <label>Allow Student Notifications</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="studentNotifications" 
              v-model="settings.allowStudentNotifications"
              @change="updateFirebaseSetting('allowStudentNotifications', settings.allowStudentNotifications)"
            >
            <label for="studentNotifications" class="toggle-slider"></label>
          </div>
        </div>
        <div class="setting-item">
          <label>Max Login Attempts</label>
          <input 
            type="number" 
            v-model.number="settings.maxLoginAttempts" 
            @change="updateFirebaseSetting('maxLoginAttempts', settings.maxLoginAttempts)"
            min="1" 
            max="10"
            class="setting-input"
          >
        </div>
        <div class="setting-item">
          <label>New User Signups</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="allowSignups" 
              v-model="settings.allowSignups"
              @change="updateFirebaseSetting('allowSignups', settings.allowSignups)"
            >
            <label for="allowSignups" class="toggle-slider"></label>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <h3>System Information</h3>
        <div class="setting-item">
          <label>System Version</label>
          <span class="readonly-value">{{ systemInfo.version }}</span>
        </div>
        <div class="setting-item">
          <label>Last Updated</label>
          <span class="readonly-value">{{ formatDate(systemInfo.lastUpdated) }}</span>
        </div>
        <div class="setting-item">
          <label>Firebase Project</label>
          <span class="readonly-value">{{ systemInfo.firebaseProjectId }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      Settings updated successfully!
    </div>
    
    <button 
      v-if="hasChanges" 
      @click="saveAllChanges" 
      class="save-button"
      :disabled="saving"
    >
      {{ saving ? 'Saving...' : 'Save All Changes' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '@/firebase' // Your Firebase initialization file

// Initialize Firebase Functions
const functions = getFunctions()

// Firebase references
const settingsRef = doc(db, 'system', 'settings')
const systemInfoRef = doc(db, 'system', 'info')

// Reactive state
const loading = ref(true)
const error = ref(null)
const success = ref(false)
const saving = ref(false)
const settings = ref({
  maintenanceMode: false,
  allowStudentNotifications: true,
  allowSignups: true,
  timezone: 'UTC',
  maxLoginAttempts: 5
})
const systemInfo = ref({
  version: '',
  lastUpdated: null,
  firebaseProjectId: ''
})
const originalSettings = ref({})

// Common timezones
const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]

// Check if there are unsaved changes
const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

// Format date for display
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    if (date.toDate) {
      const jsDate = date.toDate()
      return jsDate.toLocaleString()
    }
    return new Date(date).toLocaleString()
  } catch {
    return 'N/A'
  }
}

// Load settings from Firebase
const loadSettings = async () => {
  try {
    loading.value = true
    error.value = null
    
    const [settingsSnap, infoSnap] = await Promise.all([
      getDoc(settingsRef),
      getDoc(systemInfoRef)
    ])
    
    if (settingsSnap.exists()) {
      settings.value = settingsSnap.data()
      originalSettings.value = { ...settingsSnap.data() }
    }
    
    if (infoSnap.exists()) {
      systemInfo.value = infoSnap.data()
    }
    
    // Get Firebase project ID from config
    systemInfo.value.firebaseProjectId = db.app.options.projectId
    
  } catch (err) {
    error.value = 'Failed to load system settings: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Update single setting in Firebase
const updateFirebaseSetting = async (key, value) => {
  try {
    success.value = false
    error.value = null
    
    await updateDoc(settingsRef, {
      [key]: value
    })
    
    success.value = true
    setTimeout(() => success.value = false, 3000)
    
    // If maintenance mode is enabled, trigger cloud function
    if (key === 'maintenanceMode' && value === true) {
      const setMaintenanceMode = httpsCallable(functions, 'setMaintenanceMode')
      await setMaintenanceMode({ enabled: true })
    }
    
  } catch (err) {
    error.value = `Failed to update ${key}: ${err.message}`
    console.error(err)
    // Revert the change in UI
    settings.value[key] = originalSettings.value[key]
  }
}

// Save all changes at once
const saveAllChanges = async () => {
  try {
    saving.value = true
    error.value = null
    
    await setDoc(settingsRef, settings.value, { merge: true })
    originalSettings.value = { ...settings.value }
    
    success.value = true
    setTimeout(() => success.value = false, 3000)
    
  } catch (err) {
    error.value = 'Failed to save settings: ' + err.message
    console.error(err)
  } finally {
    saving.value = false
  }
}

// Load settings when component mounts
onMounted(loadSettings)
</script>

<style scoped>
.system-settings {
  padding: 20px;
  position: relative;
  min-height: 300px;
}

.settings-sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.settings-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.setting-item {
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-description {
  font-size: 0.8rem;
  color: #ff9800;
  margin-top: 5px;
  width: 100%;
  text-align: right;
}

.setting-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 80px;
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.readonly-value {
  color: #666;
  font-style: italic;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.save-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #388E3C;
}

.save-button:disabled {
  background-color: #81C784;
  cursor: not-allowed;
}
</style>