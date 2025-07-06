<template>
  <div class="notifications">
    <h1>Notifications</h1>
    
    <!-- Send Notification Section -->
    <div class="send-notification-section">
      <h2>Send Message to Admin</h2>
      <div v-if="!authStore.user" class="auth-warning">
        <p>You need to be logged in to send messages.</p>
      </div>
      <div v-else class="notification-form">
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" v-model="newMessage.subject" placeholder="Enter subject">
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" v-model="newMessage.message" rows="5" placeholder="Enter your message"></textarea>
        </div>
        <button class="submit-btn" @click="sendMessage" :disabled="sending">
          {{ sending ? 'Sending...' : 'Send Message' }}
        </button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    </div>

    <!-- Notifications Report Section -->
    <div class="notifications-report-section">
      <h2>My Notifications Report</h2>
      <div v-if="!authStore.user" class="auth-warning">
        <p>You need to be logged in to view reports.</p>
      </div>
      <div v-else>
        <div class="report-filters">
          <div class="form-group">
            <label for="timeRange">Time Range</label>
            <select id="timeRange" v-model="reportFilters.timeRange">
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button class="generate-btn" @click="generateReport">Generate Report</button>
        </div>
        
        <div v-if="reportData" class="report-results">
          <div class="report-cards">
            <div class="report-card">
              <h3>Total Notifications</h3>
              <p class="stat-value">{{ reportData.totalNotifications }}</p>
            </div>
            <div class="report-card">
              <h3>Unread Notifications</h3>
              <p class="stat-value">{{ reportData.unreadCount }}</p>
              <p class="stat-percentage">{{ reportData.unreadPercentage }}%</p>
            </div>
            <div class="report-card">
              <h3>Messages Sent</h3>
              <p class="stat-value">{{ reportData.sentCount }}</p>
              <p class="stat-percentage">{{ reportData.sentPercentage }}%</p>
            </div>
            <div class="report-card">
              <h3>Messages Received</h3>
              <p class="stat-value">{{ reportData.receivedCount }}</p>
              <p class="stat-percentage">{{ reportData.receivedPercentage }}%</p>
            </div>
          </div>
          
          <div class="report-charts">
            <div class="chart-container">
              <h3>Notifications Over Time</h3>
              <canvas ref="timeChart" v-show="reportData"></canvas>
            </div>
            <div class="chart-container">
              <h3>Read vs Unread</h3>
              <canvas ref="readStatusChart" v-show="reportData"></canvas>
            </div>
          </div>
        </div>
        <div v-else class="no-report">
          <p>Generate a report to view your notification statistics</p>
        </div>
      </div>
    </div>

    <!-- Received Notifications Section -->
    <div class="received-notifications-section">
      <h2>Notifications from Admin</h2>
      <div v-if="!authStore.user" class="auth-warning">
        <p>You need to be logged in to view notifications.</p>
      </div>
      <div v-else>
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
                <span class="sender">From: {{ notification.senderName || 'Admin' }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  serverTimestamp,
  or,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase' // Adjust import path as needed
import { useAuthStore } from '@/stores/authStore' // Adjust import path as needed
import Chart from 'chart.js/auto'

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
const reportData = ref(null)
const timeChart = ref(null)
const readStatusChart = ref(null)

const newMessage = ref({
  subject: '',
  message: ''
})

const reportFilters = ref({
  timeRange: '7days'
})

let unsubscribe = null
let timeChartInstance = null
let readStatusChartInstance = null

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  return notifications.value.filter(n => 
    activeFilter.value === 'unread' ? !n.read : n.read
  )
})

const sendMessage = async () => {
  // Check if user is authenticated
  if (!authStore.user) {
    errorMessage.value = 'You must be logged in to send messages'
    successMessage.value = ''
    return
  }

  if (!newMessage.value.subject || !newMessage.value.message) {
    errorMessage.value = 'Please fill in all fields'
    successMessage.value = ''
    return
  }

  try {
    sending.value = true
    errorMessage.value = ''

    const messageData = {
      subject: newMessage.value.subject,
      message: newMessage.value.message,
      senderId: authStore.user.uid,
      senderName: authStore.user.displayName || authStore.user.email || 'Anonymous',
      senderRole: 'student',
      recipientRole: 'admin',
      recipientId: 'admin', // Admin receives all student messages
      read: false,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'notifications'), messageData)

    successMessage.value = 'Your message has been sent to the admin!'
    
    // Reset form
    newMessage.value = {
      subject: '',
      message: ''
    }

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error sending message:', error)
    errorMessage.value = 'Failed to send message. Please try again.'
  } finally {
    sending.value = false
  }
}

const fetchNotifications = () => {
  // Only fetch if user is authenticated
  if (!authStore.user) {
    return
  }

  // Query for notifications sent to this specific student or to all students
  const q = query(
    collection(db, 'notifications'),
    where('recipientRole', '==', 'student'),
    orderBy('createdAt', 'desc')
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    const allNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filter notifications for this student
    notifications.value = allNotifications.filter(notification => 
      notification.recipientId === 'all' || 
      notification.recipientId === authStore.user.uid ||
      notification.recipientId === authStore.user.email
    )
  }, (error) => {
    console.error('Error fetching notifications:', error)
  })
}

const markAsRead = async (notification) => {
  if (!authStore.user) {
    errorMessage.value = 'You must be logged in to perform this action'
    return
  }

  try {
    await updateDoc(doc(db, 'notifications', notification.id), {
      read: true
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    errorMessage.value = 'Failed to mark notification as read'
  }
}

const deleteNotification = async (notification) => {
  if (!authStore.user) {
    errorMessage.value = 'You must be logged in to perform this action'
    return
  }

  if (confirm('Are you sure you want to delete this notification?')) {
    try {
      await deleteDoc(doc(db, 'notifications', notification.id))
    } catch (error) {
      console.error('Error deleting notification:', error)
      errorMessage.value = 'Failed to delete notification'
    }
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  try {
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
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Unknown'
  }
}

const generateReport = async () => {
  if (!authStore.user) {
    errorMessage.value = 'You must be logged in to generate reports'
    return
  }

  try {
    // Calculate date range based on filter
    let startDate = new Date()
    switch (reportFilters.value.timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90days':
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'all':
        startDate = null
        break
    }

    // Query for all notifications related to this user
    let receivedQuery = query(
      collection(db, 'notifications'),
      where('recipientRole', '==', 'student')
    )

    let sentQuery = query(
      collection(db, 'notifications'),
      where('senderId', '==', authStore.user.uid)
    )

    if (startDate) {
      receivedQuery = query(
        receivedQuery,
        where('createdAt', '>=', Timestamp.fromDate(startDate))
      )
      sentQuery = query(
        sentQuery,
        where('createdAt', '>=', Timestamp.fromDate(startDate))
      )
    }

    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ])

    const receivedNotifications = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(notification => 
      notification.recipientId === 'all' || 
      notification.recipientId === authStore.user.uid ||
      notification.recipientId === authStore.user.email
    )

    const sentNotifications = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    const allNotifications = [...receivedNotifications, ...sentNotifications]

    // Calculate statistics
    const totalNotifications = allNotifications.length
    const unreadCount = receivedNotifications.filter(n => !n.read).length
    const sentCount = sentNotifications.length
    const receivedCount = receivedNotifications.length

    reportData.value = {
      totalNotifications,
      unreadCount,
      unreadPercentage: receivedCount > 0 ? Math.round((unreadCount / receivedCount) * 100) : 0,
      sentCount,
      sentPercentage: totalNotifications > 0 ? Math.round((sentCount / totalNotifications) * 100) : 0,
      receivedCount,
      receivedPercentage: totalNotifications > 0 ? Math.round((receivedCount / totalNotifications) * 100) : 0,
      notifications: allNotifications
    }

    // Wait for the DOM to update before rendering charts
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('Error generating report:', error)
    errorMessage.value = 'Failed to generate report. Please try again.'
  }
}

const renderCharts = () => {
  // Destroy existing charts if they exist
  if (timeChartInstance) {
    timeChartInstance.destroy()
    timeChartInstance = null
  }
  if (readStatusChartInstance) {
    readStatusChartInstance.destroy()
    readStatusChartInstance = null
  }

  // Check if canvas elements exist
  if (!timeChart.value || !readStatusChart.value) {
    console.error('Canvas elements not found')
    return
  }

  // Group notifications by date
  const dateGroups = {}
  reportData.value.notifications.forEach(notification => {
    const date = notification.createdAt?.toDate()
    if (!date) return
    
    const dateStr = date.toISOString().split('T')[0]
    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = 0
    }
    dateGroups[dateStr]++
  })

  // Prepare data for time chart
  const dates = Object.keys(dateGroups).sort()
  const counts = dates.map(date => dateGroups[date])

  // Time Chart
  const timeCtx = timeChart.value.getContext('2d')
  timeChartInstance = new Chart(timeCtx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Notifications',
        data: counts,
        backgroundColor: 'rgba(74, 108, 247, 0.2)',
        borderColor: 'rgba(74, 108, 247, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })

  // Read Status Chart (only for received notifications)
  const readStatusCtx = readStatusChart.value.getContext('2d')
  readStatusChartInstance = new Chart(readStatusCtx, {
    type: 'doughnut',
    data: {
      labels: ['Read', 'Unread'],
      datasets: [{
        data: [
          reportData.value.receivedCount - reportData.value.unreadCount,
          reportData.value.unreadCount
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.raw || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Watch for auth state changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    fetchNotifications()
  } else {
    // Clear notifications when user logs out
    notifications.value = []
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }
}, { immediate: true })

onMounted(() => {
  // Initial fetch if user is already authenticated
  if (authStore.user) {
    fetchNotifications()
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (timeChartInstance) {
    timeChartInstance.destroy()
  }
  if (readStatusChartInstance) {
    readStatusChartInstance.destroy()
  }
})
</script>

<style scoped>
.notifications {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.send-notification-section,
.notifications-report-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.received-notifications-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.auth-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
  margin: 20px 0;
  text-align: center;
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

.submit-btn, .generate-btn {
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

.submit-btn:hover:not(:disabled),
.generate-btn:hover:not(:disabled) {
  background-color: #3a5bd9;
}

.submit-btn:disabled,
.generate-btn:disabled {
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

.no-notifications, .no-report {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Report Section Styles */
.report-filters {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.report-filters .form-group {
  margin-bottom: 0;
  flex: 1;
}

.report-results {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #4a6cf7;
}

.report-card h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
  color: #4a6cf7;
}

.stat-percentage {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.report-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container h3 {
  margin-top: 0;
  text-align: center;
  color: #2c3e50;
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

  .report-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .report-charts {
    grid-template-columns: 1fr;
  }
}
</style>async 