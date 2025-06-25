<template>
  <div class="notifications">
    <h1>Notifications Management</h1>
    
    <!-- Send Notification Section -->
    <div class="send-notification-section">
      <h2>Send Notification to Students</h2>
      <div class="notification-form">
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" v-model="newNotification.subject" placeholder="Enter subject">
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" v-model="newNotification.message" rows="5" placeholder="Enter your message"></textarea>
        </div>
        <div class="form-group">
          <label for="recipient">Send to:</label>
          <select v-model="newNotification.recipient">
            <option value="all">All Students</option>
            <option value="specific">Specific Student</option>
          </select>
        </div>
        <div class="form-group" v-if="newNotification.recipient === 'specific'">
          <label for="studentId">Student Email/ID</label>
          <input type="text" id="studentId" v-model="newNotification.studentId" placeholder="Enter student email or ID">
        </div>
        <button class="submit-btn" @click="sendNotification" :disabled="sending">
          {{ sending ? 'Sending...' : 'Send Notification' }}
        </button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    </div>

    <!-- Received Notifications Section -->
    <div class="received-notifications-section">
      <h2>Notifications from Students</h2>
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
      <div class="notification-list" v-if="filteredNotifications.length > 0">
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
              <span class="sender">From: {{ notification.senderName || notification.senderId }}</span>
              <span class="time">{{ formatTime(notification.createdAt) }}</span>
            </div>
          </div>
          <div class="notification-actions">
            <button @click="markAsRead(notification)" v-if="!notification.read">Mark as Read</button>
            <button @click="deleteNotification(notification)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
      <div v-else class="no-notifications">
        <p>No notifications found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase' // Adjust import path as needed
import { useAuthStore } from '@/stores/authStore' // Adjust import path as needed

const authStore = useAuthStore()

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' }
]

const activeFilter = ref('all')
const notifications = ref([])
const sending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const newNotification = ref({
  subject: '',
  message: '',
  recipient: 'all',
  studentId: ''
})

let unsubscribe = null

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  return notifications.value.filter(n => 
    activeFilter.value === 'unread' ? !n.read : n.read
  )
})

const sendNotification = async () => {
  if (!newNotification.value.subject || !newNotification.value.message) {
    errorMessage.value = 'Please fill in all required fields'
    successMessage.value = ''
    return
  }

  if (newNotification.value.recipient === 'specific' && !newNotification.value.studentId) {
    errorMessage.value = 'Please specify student email/ID'
    successMessage.value = ''
    return
  }

  try {
    sending.value = true
    errorMessage.value = ''

    const notificationData = {
      subject: newNotification.value.subject,
      message: newNotification.value.message,
      senderId: authStore.user.uid,
      senderName: authStore.user.displayName || 'Admin',
      senderRole: 'admin',
      recipientRole: 'student',
      read: false,
      createdAt: serverTimestamp()
    }

    if (newNotification.value.recipient === 'specific') {
      notificationData.recipientId = newNotification.value.studentId
    } else {
      notificationData.recipientId = 'all'
    }

    await addDoc(collection(db, 'notifications'), notificationData)

    successMessage.value = 'Notification sent successfully!'
    
    // Reset form
    newNotification.value = {
      subject: '',
      message: '',
      recipient: 'all',
      studentId: ''
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error sending notification:', error)
    errorMessage.value = 'Failed to send notification. Please try again.'
  } finally {
    sending.value = false
  }
}

const fetchNotifications = () => {
  const q = query(
    collection(db, 'notifications'),
    where('recipientRole', '==', 'admin'),
    orderBy('createdAt', 'desc')
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    notifications.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

const markAsRead = async (notification) => {
  try {
    await updateDoc(doc(db, 'notifications', notification.id), {
      read: true
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const deleteNotification = async (notification) => {
  if (confirm('Are you sure you want to delete this notification?')) {
    try {
      await deleteDoc(doc(db, 'notifications', notification.id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }
}

onMounted(() => {
  fetchNotifications()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.notifications {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.send-notification-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.received-notifications-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.notification-form {
  max-width: 600px;
  margin: 20px 0;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input, 
.form-group textarea, 
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus, 
.form-group textarea:focus, 
.form-group select:focus {
  outline: none;
  border-color: #4a6cf7;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #3a5bd9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.notification-filters button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
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
  align-items: flex-start;
  gap: 20px;
  transition: background 0.3s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: #f8f9fa;
  border-left: 4px solid #4a6cf7;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.notification-content p {
  color: #666;
  margin: 10px 0;
  line-height: 1.5;
}

.notification-meta {
  font-size: 14px;
  color: #999;
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-actions button {
  padding: 6px 12px;
  background: none;
  border: 1px solid #4a6cf7;
  color: #4a6cf7;
  cursor: pointer;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
}

.notification-actions button:hover {
  background: #4a6cf7;
  color: white;
}

.notification-actions .delete-btn {
  border-color: #dc3545;
  color: #dc3545;
}

.notification-actions .delete-btn:hover {
  background: #dc3545;
  color: white;
}

.success-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.no-notifications {
  text-align: center;
  padding: 40px;
  color: #666;
}

@media (max-width: 768px) {
  .notification-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .notification-actions {
    flex-direction: row;
    align-self: stretch;
  }
  
  .notification-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>