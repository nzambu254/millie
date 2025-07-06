<template>
  <div class="assign-practice">
    <h1>Assign Practice</h1>
    
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'assign' }"
        @click="activeTab = 'assign'"
      >
        Assign Practice
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'submissions' }"
        @click="activeTab = 'submissions'"
      >
        View Submissions
      </button>
    </div>

    <!-- Assign Practice Tab -->
    <div v-if="activeTab === 'assign'" class="assignment-container">
      <!-- Assignment Form -->
      <div class="assignment-form">
        <h2>New Assignment</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="practice-type">Practice Type</label>
            <select id="practice-type" v-model="practiceType">
              <option value="">Select practice type</option>
              <option value="quiz">Quiz</option>
              <option value="exercise">Exercise</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div class="form-group">
            <label for="due-date">Due Date</label>
            <input type="date" id="due-date" v-model="dueDate">
          </div>
        </div>
        <div class="form-group">
          <label for="practice-topic">Topic</label>
          <input type="text" id="practice-topic" v-model="topic" placeholder="Enter topic (e.g. Rectangles)">
        </div>
        <div class="form-group">
          <label>Assign To</label>
          <div class="assign-options">
            <label><input type="radio" v-model="assignTo" value="all"> All Students</label>
            <label><input type="radio" v-model="assignTo" value="selected"> Selected Students</label>
            <label><input type="radio" v-model="assignTo" value="groups"> Groups/Classes</label>
          </div>
          <div v-if="assignTo === 'selected'" class="student-selection">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search students..."
                class="search-input"
              >
            </div>
            <div class="student-list" v-if="!loadingStudents">
              <div class="student-checkbox" v-for="student in filteredStudents" :key="student.uid">
                <input type="checkbox" :id="'student-' + student.uid" :value="student.uid" v-model="selectedStudents">
                <label :for="'student-' + student.uid">
                  {{ student.name }}
                  <span class="student-email">{{ student.displayName || student.email }}</span>
                </label>
              </div>
            </div>
            <div v-if="loadingStudents" class="loading-message">
              Loading students...
            </div>
            <div v-if="!loadingStudents && filteredStudents.length === 0" class="no-students">
              No students found
            </div>
          </div>
        </div>
        <button class="assign-btn" @click="assignPractice" :disabled="loading">
          {{ loading ? 'Assigning...' : 'Assign Practice' }}
        </button>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>

      <!-- Assignment Report -->
      <div class="assignment-report">
        <h2>Recent Assignments</h2>
        <div class="report-filters">
          <select v-model="reportFilterType" class="filter-select">
            <option value="">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="exercise">Exercise</option>
            <option value="assignment">Assignment</option>
          </select>
          <select v-model="reportFilterDate" class="filter-select">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button @click="fetchAssignments" class="refresh-btn" :disabled="loadingAssignments">
            {{ loadingAssignments ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div v-if="loadingAssignments" class="loading-message">
          Loading assignments...
        </div>

        <div v-if="!loadingAssignments && filteredAssignments.length === 0" class="no-assignments">
          No assignments found
        </div>

        <div v-if="!loadingAssignments && filteredAssignments.length > 0" class="assignments-list">
          <div v-for="assignment in filteredAssignments" :key="assignment.id" class="assignment-card">
            <div class="assignment-header">
              <h3>{{ assignment.topic || 'No topic' }}</h3>
              <span class="assignment-type">{{ assignment.practiceType }}</span>
              <span class="assignment-date">{{ formatDate(assignment.timestamp) }}</span>
            </div>
            
            <div class="assignment-details">
              <div class="detail-item">
                <span class="detail-label">Assigned To:</span>
                <span class="detail-value">
                  {{ assignment.assignTo === 'all' ? 'All Students' : 
                     assignment.assignTo === 'selected' ? `${assignment.selectedStudents.length} Students` : 
                     'Groups/Classes' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">{{ assignment.dueDate || 'Not set' }}</span>
              </div>
            </div>

            <div class="assignment-stats">
              <div class="stat-item">
                <span class="stat-value">{{ getSubmissionCount(assignment.id, 'submitted') }}</span>
                <span class="stat-label">Submitted</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getSubmissionCount(assignment.id, 'graded') }}</span>
                <span class="stat-label">Graded</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getSubmissionCount(assignment.id, 'pending') }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>

            <div class="assignment-actions">
              <button 
                @click="viewAssignmentDetails(assignment)"
                class="action-btn view-btn"
              >
                View Details
              </button>
              <button 
                v-if="assignment.assignTo === 'selected'"
                @click="viewAssignedStudents(assignment)"
                class="action-btn students-btn"
              >
                View Students
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions Tab -->
    <div v-if="activeTab === 'submissions'" class="submissions-section">
      <div class="submissions-header">
        <h2>Student Submissions</h2>
        <div class="submissions-filters">
          <select v-model="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="late">Late</option>
          </select>
          <select v-model="filterPracticeType" class="filter-select">
            <option value="">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="exercise">Exercise</option>
            <option value="assignment">Assignment</option>
          </select>
          <button @click="fetchSubmissions" class="refresh-btn" :disabled="loadingSubmissions">
            {{ loadingSubmissions ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="loadingSubmissions" class="loading-message">
        Loading submissions...
      </div>

      <div v-if="!loadingSubmissions && filteredSubmissions.length === 0" class="no-submissions">
        No submissions found
      </div>

      <div v-if="!loadingSubmissions && filteredSubmissions.length > 0" class="submissions-grid">
        <div v-for="submission in filteredSubmissions" :key="submission.id" class="submission-card">
          <div class="submission-header">
            <div class="submission-info">
              <h3>{{ submission.topic || 'No topic' }}</h3>
              <span class="submission-type">{{ submission.practiceType }}</span>
            </div>
            <div class="submission-status" :class="submission.status || 'pending'">
              {{ formatStatus(submission.status || 'pending') }}
            </div>
          </div>
          
          <div class="submission-details">
            <div class="detail-item">
              <span class="detail-label">Student:</span>
              <span class="detail-value">{{ getStudentName(submission.userId) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned:</span>
              <span class="detail-value">{{ formatDate(submission.timestamp) }}</span>
            </div>
            <div class="detail-item" v-if="submission.feedback">
              <span class="detail-label">Feedback:</span>
              <span class="detail-value">{{ submission.feedback }}</span>
            </div>
          </div>

          <div class="submission-text">
            <h4>Content:</h4>
            <p>{{ submission.content || 'No content provided' }}</p>
          </div>

          <div class="submission-actions">
            <button 
              v-if="submission.status === 'submitted'" 
              @click="gradeSubmission(submission)"
              class="action-btn grade-btn"
            >
              Grade
            </button>
            <button 
              @click="viewSubmissionDetails(submission)"
              class="action-btn view-btn"
            >
              View Details
            </button>
            <button 
              v-if="submission.status === 'pending'"
              @click="sendReminder(submission)"
              class="action-btn reminder-btn"
            >
              Send Reminder
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Grade Modal -->
    <div v-if="showGradeModal" class="modal-overlay" @click="closeGradeModal">
      <div class="modal-content" @click.stop>
        <h3>Grade Submission</h3>
        <div class="grade-form">
          <div class="form-group">
            <label for="feedback">Feedback:</label>
            <textarea id="feedback" v-model="feedbackInput" rows="4"></textarea>
          </div>
          <div class="modal-actions">
            <button @click="submitGrade" class="action-btn grade-btn" :disabled="gradingInProgress">
              {{ gradingInProgress ? 'Saving...' : 'Save Feedback' }}
            </button>
            <button @click="closeGradeModal" class="action-btn cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment Details Modal -->
    <div v-if="showAssignmentModal" class="modal-overlay" @click="closeAssignmentModal">
      <div class="modal-content" @click.stop>
        <h3>Assignment Details</h3>
        <div v-if="selectedAssignment" class="assignment-modal-content">
          <div class="modal-section">
            <h4>Basic Information</h4>
            <div class="detail-row">
              <span class="detail-label">Topic:</span>
              <span class="detail-value">{{ selectedAssignment.topic || 'No topic' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedAssignment.practiceType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Assigned On:</span>
              <span class="detail-value">{{ formatDate(selectedAssignment.timestamp) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">{{ selectedAssignment.dueDate || 'Not set' }}</span>
            </div>
          </div>

          <div class="modal-section">
            <h4>Assignment Statistics</h4>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ getSubmissionCount(selectedAssignment.id, 'submitted') }}</div>
                <div class="stat-label">Submitted</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getSubmissionCount(selectedAssignment.id, 'graded') }}</div>
                <div class="stat-label">Graded</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getSubmissionCount(selectedAssignment.id, 'pending') }}</div>
                <div class="stat-label">Pending</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ getSubmissionCount(selectedAssignment.id, 'late') }}</div>
                <div class="stat-label">Late</div>
              </div>
            </div>
          </div>

          <div class="modal-section" v-if="selectedAssignment.assignTo === 'selected'">
            <h4>Assigned Students</h4>
            <div class="assigned-students-list">
              <div v-for="studentId in selectedAssignment.selectedStudents" :key="studentId" class="student-item">
                {{ getStudentName(studentId) }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="downloadAssignmentReport" class="action-btn download-btn">
              Download Report (PDF)
            </button>
            <button @click="closeAssignmentModal" class="action-btn cancel-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, getDocs, addDoc, query, where, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '@/firebase' 
import html2pdf from 'html2pdf.js'

// Form variables
const practiceType = ref('')
const dueDate = ref('')
const topic = ref('')
const assignTo = ref('all')
const selectedStudents = ref([])
const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const loadingStudents = ref(false)
const searchQuery = ref('')

// Submissions variables
const activeTab = ref('assign')
const submissions = ref([])
const loadingSubmissions = ref(false)
const filterStatus = ref('')
const filterPracticeType = ref('')
const showGradeModal = ref(false)
const selectedSubmission = ref(null)
const feedbackInput = ref('')
const gradingInProgress = ref(false)

// Assignment report variables
const assignments = ref([])
const loadingAssignments = ref(false)
const reportFilterType = ref('')
const reportFilterDate = ref('')
const showAssignmentModal = ref(false)
const selectedAssignment = ref(null)

const students = ref([])

// Computed property to filter students based on search query
const filteredStudents = computed(() => {
  if (!searchQuery.value) {
    return students.value
  }
  return students.value.filter(student => 
    student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Computed property to filter submissions
const filteredSubmissions = computed(() => {
  let filtered = submissions.value
  
  if (filterStatus.value) {
    filtered = filtered.filter(submission => 
      (submission.status || 'pending') === filterStatus.value
    )
  }
  
  if (filterPracticeType.value) {
    filtered = filtered.filter(submission => 
      submission.practiceType === filterPracticeType.value
    )
  }
  
  return filtered
})

// Computed property to filter assignments
const filteredAssignments = computed(() => {
  let filtered = assignments.value
  
  if (reportFilterType.value) {
    filtered = filtered.filter(assignment => 
      assignment.practiceType === reportFilterType.value
    )
  }
  
  if (reportFilterDate.value) {
    const now = new Date()
    filtered = filtered.filter(assignment => {
      const assignmentDate = assignment.timestamp.toDate ? assignment.timestamp.toDate() : new Date(assignment.timestamp)
      
      if (reportFilterDate.value === 'today') {
        return assignmentDate.toDateString() === now.toDateString()
      } else if (reportFilterDate.value === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return assignmentDate >= oneWeekAgo
      } else if (reportFilterDate.value === 'month') {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return assignmentDate >= oneMonthAgo
      }
      return true
    })
  }
  
  return filtered
})

// Function to fetch students from Firestore
const fetchStudents = async () => {
  try {
    loadingStudents.value = true
    errorMessage.value = ''
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'student'))
    const querySnapshot = await getDocs(q)
    
    students.value = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      students.value.push({
        id: doc.id,
        uid: userData.uid || doc.id,
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        displayName: userData.displayName || ''
      })
    })
    
  } catch (error) {
    console.error('Error fetching students:', error)
    errorMessage.value = 'Failed to load students. Please try again.'
  } finally {
    loadingStudents.value = false
  }
}

// Function to fetch submissions from Firestore
const fetchSubmissions = async () => {
  try {
    loadingSubmissions.value = true
    errorMessage.value = ''
    
    // Ensure students are loaded first
    if (students.value.length === 0) {
      await fetchStudents()
    }
    
    const assignmentsRef = collection(db, 'assignments')
    const q = query(assignmentsRef, orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    submissions.value = []
    querySnapshot.forEach((doc) => {
      const assignmentData = doc.data()
      submissions.value.push({
        id: doc.id,
        ...assignmentData
      })
    })
    
  } catch (error) {
    console.error('Error fetching submissions:', error)
    errorMessage.value = 'Failed to load submissions. Please try again.'
  } finally {
    loadingSubmissions.value = false
  }
}

// Function to fetch assignments from Firestore
const fetchAssignments = async () => {
  try {
    loadingAssignments.value = true
    errorMessage.value = ''
    
    const assignmentsRef = collection(db, 'assignments')
    const q = query(assignmentsRef, orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    assignments.value = []
    querySnapshot.forEach((doc) => {
      const assignmentData = doc.data()
      assignments.value.push({
        id: doc.id,
        ...assignmentData
      })
    })
    
  } catch (error) {
    console.error('Error fetching assignments:', error)
    errorMessage.value = 'Failed to load assignments. Please try again.'
  } finally {
    loadingAssignments.value = false
  }
}

// Watch for changes in assignTo to fetch students when needed
watch(assignTo, (newValue) => {
  if (newValue === 'selected' && students.value.length === 0) {
    fetchStudents()
  }
})

// Watch for tab changes to fetch data when needed
watch(activeTab, (newValue) => {
  if (newValue === 'submissions') {
    fetchSubmissions()
  } else if (newValue === 'assign') {
    fetchAssignments()
  }
})

const assignPractice = async () => {
  if (!practiceType.value || !topic.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }
  
  if (assignTo.value === 'selected' && selectedStudents.value.length === 0) {
    errorMessage.value = 'Please select at least one student'
    return
  }
  
  try {
    loading.value = true
    errorMessage.value = ''
    
    const assignmentData = {
      practiceType: practiceType.value,
      dueDate: dueDate.value,
      topic: topic.value,
      assignTo: assignTo.value,
      selectedStudents: assignTo.value === 'selected' ? selectedStudents.value : null,
      timestamp: new Date(),
      status: 'pending'
    }
    
    // Add assignment to Firestore
    const assignmentsRef = collection(db, 'assignments')
    await addDoc(assignmentsRef, assignmentData)
    
    successMessage.value = 'Practice has been successfully assigned!'
    
    // Reset form
    practiceType.value = ''
    dueDate.value = ''
    topic.value = ''
    assignTo.value = 'all'
    selectedStudents.value = []
    searchQuery.value = ''
    
    // Refresh assignments list
    await fetchAssignments()
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('Error assigning practice:', error)
    errorMessage.value = 'Failed to assign practice. Please try again.'
  } finally {
    loading.value = false
  }
}

// Helper functions
const getStudentName = (studentId) => {
  const student = students.value.find(s => s.uid === studentId)
  return student ? (student.displayName || student.email || 'Unknown Student') : 'Unknown Student'
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  if (date.toDate) {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getSubmissionCount = (assignmentId, status) => {
  return submissions.value.filter(sub => 
    sub.assignmentId === assignmentId && 
    (sub.status || 'pending') === status
  ).length
}

const gradeSubmission = (submission) => {
  selectedSubmission.value = submission
  feedbackInput.value = submission.feedback || ''
  showGradeModal.value = true
}

const closeGradeModal = () => {
  showGradeModal.value = false
  selectedSubmission.value = null
  feedbackInput.value = ''
}

const submitGrade = async () => {
  try {
    gradingInProgress.value = true
    
    const submissionRef = doc(db, 'assignments', selectedSubmission.value.id)
    await updateDoc(submissionRef, {
      feedback: feedbackInput.value,
      status: 'graded'
    })
    
    // Update local submissions array
    const index = submissions.value.findIndex(s => s.id === selectedSubmission.value.id)
    if (index !== -1) {
      submissions.value[index].feedback = feedbackInput.value
      submissions.value[index].status = 'graded'
    }
    
    closeGradeModal()
    successMessage.value = 'Feedback submitted successfully!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('Error submitting feedback:', error)
    errorMessage.value = 'Failed to submit feedback. Please try again.'
  } finally {
    gradingInProgress.value = false
  }
}

const viewSubmissionDetails = (submission) => {
  // This can be expanded to show a detailed view modal
  console.log('View submission details:', submission)
}

const sendReminder = async (submission) => {
  try {
    loading.value = true
    // Here you would implement your reminder logic (email, notification, etc.)
    // For now, we'll just update the status in Firestore
    const submissionRef = doc(db, 'assignments', submission.id)
    await updateDoc(submissionRef, {
      lastReminderSent: new Date()
    })
    
    // Update local submissions array
    const index = submissions.value.findIndex(s => s.id === submission.id)
    if (index !== -1) {
      submissions.value[index].lastReminderSent = new Date()
    }
    
    successMessage.value = 'Reminder sent successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('Error sending reminder:', error)
    errorMessage.value = 'Failed to send reminder. Please try again.'
  } finally {
    loading.value = false
  }
}

const viewAssignmentDetails = (assignment) => {
  selectedAssignment.value = assignment
  showAssignmentModal.value = true
}

const viewAssignedStudents = (assignment) => {
  selectedAssignment.value = assignment
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedAssignment.value = null
}

const downloadAssignmentReport = () => {
  if (!selectedAssignment.value) return
  
  // Create HTML content dynamically
  const htmlContent = `
    <div class="pdf-report">
      <h2 class="pdf-title">Assignment Report</h2>
      <div class="pdf-section">
        <h3>Basic Information</h3>
        <table class="pdf-table">
          <tbody>
            <tr>
              <td class="pdf-label">Topic:</td>
              <td class="pdf-value">${selectedAssignment.value.topic || 'No topic'}</td>
            </tr>
            <tr>
              <td class="pdf-label">Type:</td>
              <td class="pdf-value">${selectedAssignment.value.practiceType}</td>
            </tr>
            <tr>
              <td class="pdf-label">Assigned On:</td>
              <td class="pdf-value">${formatDate(selectedAssignment.value.timestamp)}</td>
            </tr>
            <tr>
              <td class="pdf-label">Due Date:</td>
              <td class="pdf-value">${selectedAssignment.value.dueDate || 'Not set'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pdf-section">
        <h3>Assignment Statistics</h3>
        <div class="pdf-stats">
          <div class="pdf-stat">
            <div class="pdf-stat-value">${getSubmissionCount(selectedAssignment.value.id, 'submitted')}</div>
            <div class="pdf-stat-label">Submitted</div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-value">${getSubmissionCount(selectedAssignment.value.id, 'graded')}</div>
            <div class="pdf-stat-label">Graded</div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-value">${getSubmissionCount(selectedAssignment.value.id, 'pending')}</div>
            <div class="pdf-stat-label">Pending</div>
          </div>
          <div class="pdf-stat">
            <div class="pdf-stat-value">${getSubmissionCount(selectedAssignment.value.id, 'late')}</div>
            <div class="pdf-stat-label">Late</div>
          </div>
        </div>
      </div>

      ${selectedAssignment.value.assignTo === 'selected' ? `
      <div class="pdf-section">
        <h3>Assigned Students</h3>
        <div class="pdf-students">
          ${selectedAssignment.value.selectedStudents.map((studentId, index) => `
            <div class="pdf-student">${index + 1}. ${getStudentName(studentId)}</div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="pdf-footer">
        Report generated on ${formatDate(new Date())}
      </div>
    </div>
  `
  
  // Create a temporary element
  const element = document.createElement('div')
  element.innerHTML = htmlContent
  
  // PDF options
  const opt = {
    margin: 10,
    filename: `assignment-report-${selectedAssignment.value.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      logging: true,
      useCORS: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  // Generate the PDF
  html2pdf().set(opt).from(element).save()
  
  // Clean up
  element.remove()
}

// Load initial data on component mount
onMounted(async () => {
  await fetchStudents()
  await fetchAssignments()
})
</script>

<style scoped>
.assign-practice {
  padding: 20px;
}

.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6c757d;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #4a6cf7;
  border-bottom-color: #4a6cf7;
}

.assignment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1400px;
  margin: 20px auto 0;
}

.assignment-form, .assignment-report {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.assignment-form h2, .assignment-report h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
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

.form-group select,
.form-group input[type="date"],
.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.assign-options {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.assign-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  cursor: pointer;
}

.student-selection {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.search-box {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.student-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  background-color: white;
}

.student-checkbox {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.student-checkbox:hover {
  background-color: #f8f9fa;
}

.student-checkbox label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  flex-grow: 1;
  font-weight: normal;
}

.student-email {
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
}

.report-filters, .submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.report-filters, .submissions-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.assignments-list {
  display: grid;
  gap: 15px;
}

.assignment-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.assignment-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.assignment-type {
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
}

.assignment-date {
  font-size: 12px;
  color: #6c757d;
}

.assignment-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
  font-size: 12px;
}

.detail-value {
  color: #2c3e50;
  font-size: 14px;
}

.assignment-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a6cf7;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.assignment-actions {
  display: flex;
  gap: 10px;
}

.submissions-grid {
  display: grid;
  gap: 20px;
}

.submission-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submission-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.submission-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.submission-type {
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
}

.submission-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.submission-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.submission-status.submitted {
  background-color: #cce5ff;
  color: #004085;
}

.submission-status.graded {
  background-color: #d4edda;
  color: #155724;
}

.submission-status.late {
  background-color: #f8d7da;
  color: #721c24;
}

.submission-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.submission-text {
  margin-bottom: 15px;
}

.submission-text h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #2c3e50;
}

.submission-text p {
  margin: 0;
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
  white-space: pre-wrap;
}

.submission-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.view-btn {
  background-color: #6c757d;
  color: white;
}

.view-btn:hover {
  background-color: #5a6268;
}

.grade-btn {
  background-color: #28a745;
  color: white;
}

.grade-btn:hover {
  background-color: #218838;
}

.reminder-btn {
  background-color: #17a2b8;
  color: white;
}

.reminder-btn:hover {
  background-color: #138496;
}

.students-btn {
  background-color: #ffc107;
  color: #212529;
}

.students-btn:hover {
  background-color: #e0a800;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background-color: #c82333;
}

.download-btn {
  background-color: #6610f2;
  color: white;
}

.download-btn:hover {
  background-color: #560bd0;
}

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
  padding: 25px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
  width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a6cf7;
  margin-bottom: 5px;
}

.stat-card .stat-label {
  font-size: 12px;
  color: #6c757d;
}

.assigned-students-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.student-item {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.grade-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 15px;
}

.loading-message, .no-students, .no-assignments, .no-submissions {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.success-message {
  color: #28a745;
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  border-radius: 4px;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .assignment-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .report-filters, .submissions-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-content {
    width: 95%;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    flex-direction: column;
  }
  
  .assignment-actions, .submission-actions, .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>