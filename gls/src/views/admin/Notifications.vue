<template>
  <div class="notifications">
    <h1>Notifications</h1>
    <div class="notification-filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value" 
        :class="{ active: activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>
    <div class="notification-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id" 
        class="notification-item"
        :class="{ unread: !notification.read }"
      >
        <div class="notification-content">
          <h3>{{ notification.subject }}</h3>
          <p>{{ notification.message }}</p>
          <div class="notification-meta">
            <span class="sender">{{ notification.sender }}</span>
            <span class="time">{{ notification.time }}</span>
          </div>
        </div>
        <div class="notification-actions">
          <button @click="markAsRead(notification)" v-if="!notification.read">Mark as Read</button>
          <button @click="deleteNotification(notification)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' }
]

const activeFilter = ref('all')

const notifications = ref([
  {
    id: 1,
    subject: "Help with Triangle Problem",
    message: "I'm having trouble understanding the Pythagorean theorem. Can you provide more examples?",
    sender: "John Doe",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    subject: "Content Suggestion",
    message: "Would it be possible to add more content about 3D geometry?",
    sender: "Jane Smith",
    time: "1 day ago",
    read: true
  },
  {
    id: 3,
    subject: "Bug Report",
    message: "The interactive diagram for circles isn't working properly on my device.",
    sender: "Mike Johnson",
    time: "3 days ago",
    read: true
  },
  {
    id: 4,
    subject: "Feature Request",
    message: "Could we have a way to save our progress in the practice exercises?",
    sender: "Sarah Williams",
    time: "1 week ago",
    read: false
  }
])

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  return notifications.value.filter(n => 
    activeFilter.value === 'unread' ? !n.read : n.read
  )
})

const markAsRead = (notification) => {
  notification.read = true
}

const deleteNotification = (notification) => {
  notifications.value = notifications.value.filter(n => n.id !== notification.id)
}
</script>

<style scoped>
.notifications {
  padding: 20px;
}

.notification-filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.notification-filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-filters button:hover {
  background: #f0f0f0;
}

.notification-filters button.active {
  background-color: #4a6cf7;
  color: white;
  border-color: #4a6cf7;
}

.notification-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.notification-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  transition: background 0.3s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: #f8f9fa;
}

.notification-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.notification-content p {
  color: #666;
  margin: 10px 0;
}

.notification-meta {
  font-size: 0.8rem;
  color: #999;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.notification-actions button {
  margin-left: 10px;
  background: none;
  border: none;
  color: #4a6cf7;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}

.notification-actions button:hover {
  color: #2c3e50;
}
</style>
