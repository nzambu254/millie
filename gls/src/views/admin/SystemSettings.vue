<template>
  <div class="system-settings">
    <h1>System Settings</h1>
    <div class="settings-sections">
      <div class="settings-card">
        <h3>Application Settings</h3>
        <div class="setting-item">
          <label>Maintenance Mode</label>
          <input type="checkbox" v-model="maintenanceMode">
        </div>
      </div>
      <div class="settings-card">
        <h3>User Permissions</h3>
        <div class="setting-item">
          <label>Allow Student Notifications</label>
          <input type="checkbox" v-model="allowStudentNotifications">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const maintenanceMode = ref(false)
const allowStudentNotifications = ref(true)
</script>

<style scoped>
.system-settings {
  padding: 20px;
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
</style>