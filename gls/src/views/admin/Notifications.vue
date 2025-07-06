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

    <!-- Notifications Report Section -->
    <div class="notifications-report-section">
      <h2>Notifications Report</h2>
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
        <div class="report-actions">
          <button class="generate-btn" @click="generateReport">Generate Report</button>
          <button class="download-btn" @click="downloadReportPDF" v-if="reportData" :disabled="generatingPDF">
            {{ generatingPDF ? 'Generating PDF...' : 'Download PDF' }}
          </button>
        </div>
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
            <h3>Sent to Individuals</h3>
            <p class="stat-value">{{ reportData.individualCount }}</p>
            <p class="stat-percentage">{{ reportData.individualPercentage }}%</p>
          </div>
          <div class="report-card">
            <h3>Sent to All</h3>
            <p class="stat-value">{{ reportData.broadcastCount }}</p>
            <p class="stat-percentage">{{ reportData.broadcastPercentage }}%</p>
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
        <p>Generate a report to view notification statistics</p>
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
            <button @click="showDeleteModal(notification)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
      <div v-else class="no-notifications">
        <p>No notifications found.</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="close-btn" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this notification?</p>
          <div class="notification-preview">
            <strong>Subject:</strong> {{ notificationToDelete?.subject }}<br>
            <strong>From:</strong> {{ notificationToDelete?.senderName || notificationToDelete?.senderId }}
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeDeleteModal">Cancel</button>
          <button class="confirm-delete-btn" @click="confirmDeleteNotification">Yes, Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/authStore'
import Chart from 'chart.js/auto'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  setup() {
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
    const generatingPDF = ref(false)
    const showDeleteConfirmation = ref(false)
    const notificationToDelete = ref(null)

    const newNotification = ref({
      subject: '',
      message: '',
      recipient: 'all',
      studentId: ''
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

    const showDeleteModal = (notification) => {
      notificationToDelete.value = notification
      showDeleteConfirmation.value = true
    }

    const closeDeleteModal = () => {
      showDeleteConfirmation.value = false
      notificationToDelete.value = null
    }

    const confirmDeleteNotification = async () => {
      if (!notificationToDelete.value) return

      try {
        await deleteDoc(doc(db, 'notifications', notificationToDelete.value.id))
        closeDeleteModal()
      } catch (error) {
        console.error('Error deleting notification:', error)
        errorMessage.value = 'Failed to delete notification. Please try again.'
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

    const generateReport = async () => {
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

        // Build query
        let q = query(
          collection(db, 'notifications'),
          where('senderRole', '==', 'admin')
        )

        if (startDate) {
          q = query(
            q,
            where('createdAt', '>=', Timestamp.fromDate(startDate))
          )
        }

        const querySnapshot = await getDocs(q)
        const allNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Calculate statistics
        const totalNotifications = allNotifications.length
        const unreadCount = allNotifications.filter(n => !n.read).length
        const individualCount = allNotifications.filter(n => n.recipientId !== 'all').length
        const broadcastCount = totalNotifications - individualCount

        reportData.value = {
          totalNotifications,
          unreadCount,
          unreadPercentage: totalNotifications > 0 ? Math.round((unreadCount / totalNotifications) * 100) : 0,
          individualCount,
          individualPercentage: totalNotifications > 0 ? Math.round((individualCount / totalNotifications) * 100) : 0,
          broadcastCount,
          broadcastPercentage: totalNotifications > 0 ? Math.round((broadcastCount / totalNotifications) * 100) : 0,
          notifications: allNotifications,
          timeRange: reportFilters.value.timeRange,
          generatedAt: new Date()
        }

        // Wait for the DOM to update before rendering charts
        await nextTick()
        renderCharts()
      } catch (error) {
        console.error('Error generating report:', error)
        errorMessage.value = 'Failed to generate report. Please try again.'
      }
    }

    const downloadReportPDF = async () => {
      if (!reportData.value) return

      try {
        generatingPDF.value = true
        
        const doc = new jsPDF()
        
        // Title
        doc.setFontSize(20)
        doc.text('Notifications Report', 20, 20)
        
        // Report metadata
        doc.setFontSize(12)
        doc.text(`Generated on: ${reportData.value.generatedAt.toLocaleDateString()}`, 20, 35)
        
        const timeRangeText = {
          '7days': 'Last 7 Days',
          '30days': 'Last 30 Days',
          '90days': 'Last 90 Days',
          'all': 'All Time'
        }
        doc.text(`Time Range: ${timeRangeText[reportData.value.timeRange]}`, 20, 45)
        
        // Summary statistics
        doc.setFontSize(16)
        doc.text('Summary Statistics', 20, 65)
        
        const statsData = [
          ['Total Notifications', reportData.value.totalNotifications.toString()],
          ['Unread Notifications', `${reportData.value.unreadCount} (${reportData.value.unreadPercentage}%)`],
          ['Individual Notifications', `${reportData.value.individualCount} (${reportData.value.individualPercentage}%)`],
          ['Broadcast Notifications', `${reportData.value.broadcastCount} (${reportData.value.broadcastPercentage}%)`]
        ]
        
        autoTable(doc, {
          head: [['Metric', 'Value']],
          body: statsData,
          startY: 75,
          theme: 'striped',
          headStyles: { fillColor: [74, 108, 247] }
        })
        
        // Recent notifications table
        const finalY = doc.lastAutoTable.finalY + 20
        doc.setFontSize(16)
        doc.text('Recent Notifications', 20, finalY)
        
        const notificationsData = reportData.value.notifications.slice(0, 10).map(notification => [
          notification.subject || 'No Subject',
          notification.recipientId === 'all' ? 'All Students' : 'Individual',
          notification.read ? 'Read' : 'Unread',
          notification.createdAt ? new Date(notification.createdAt.toDate()).toLocaleDateString() : 'Unknown'
        ])
        
        autoTable(doc, {
          head: [['Subject', 'Recipient', 'Status', 'Date']],
          body: notificationsData,
          startY: finalY + 10,
          theme: 'striped',
          headStyles: { fillColor: [74, 108, 247] },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 40 }
          }
        })
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(10)
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
        }
        
        // Save the PDF
        const fileName = `notifications-report-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
        
      } catch (error) {
        console.error('Error generating PDF:', error)
        errorMessage.value = 'Failed to generate PDF report. Please try again.'
      } finally {
        generatingPDF.value = false
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
            label: 'Notifications Sent',
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

      // Read Status Chart
      const readStatusCtx = readStatusChart.value.getContext('2d')
      readStatusChartInstance = new Chart(readStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Read', 'Unread'],
          datasets: [{
            data: [
              reportData.value.totalNotifications - reportData.value.unreadCount,
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
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }

    onMounted(() => {
      fetchNotifications()
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

    return {
      filters,
      activeFilter,
      notifications,
      sending,
      successMessage,
      errorMessage,
      reportData,
      generatingPDF,
      showDeleteConfirmation,
      notificationToDelete,
      newNotification,
      reportFilters,
      filteredNotifications,
      timeChart,
      readStatusChart,
      sendNotification,
      markAsRead,
      showDeleteModal,
      closeDeleteModal,
      confirmDeleteNotification,
      formatTime,
      generateReport,
      downloadReportPDF
    }
  }
}
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

.submit-btn, .generate-btn, .download-btn {
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
.generate-btn:hover:not(:disabled),
.download-btn:hover:not(:disabled) {
  background-color: #3a5bd9;
}

.submit-btn:disabled,
.generate-btn:disabled,
.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background-color: #28a745;
  margin-left: 10px;
}

.download-btn:hover:not(:disabled) {
  background-color: #218838;
}

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

.report-actions {
  display: flex;
  gap: 10px;
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

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: #333;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-body p {
    margin: 0 0 15px 0;
    color: #333;
  }

  .notification-preview {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-top: 15px;
  }

  .modal-actions {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .cancel-btn {
    padding: 10px 20px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #f0f0f0;
  }

  .confirm-delete-btn {
    padding: 10px 20px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }

  .confirm-delete-btn:hover {
    background: #c82333;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .report-charts {
      grid-template-columns: 1fr;
    }
    
    .report-filters {
      flex-direction: column;
      align-items: stretch;
    }
    
    .report-actions {
      justify-content: flex-start;
      margin-top: 10px;
    }
    
    .notification-item {
      flex-direction: column;
      gap: 15px;
    }
    
    .notification-actions {
      flex-direction: row;
      justify-content: flex-end;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .notification-form {
      padding: 15px;
    }
    
    .report-cards {
      grid-template-columns: 1fr 1fr;
    }
    
    .modal-content {
      margin: 0 15px;
    }
  }
</style>