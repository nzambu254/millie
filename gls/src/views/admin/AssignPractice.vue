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
    <div v-if="activeTab === 'assign'" class="assignment-form">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, getDocs, addDoc, query, where, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '@/firebase' 

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

// Watch for changes in assignTo to fetch students when needed
watch(assignTo, (newValue) => {
  if (newValue === 'selected' && students.value.length === 0) {
    fetchStudents()
  }
})

// Watch for tab changes to fetch submissions when needed
watch(activeTab, (newValue) => {
  if (newValue === 'submissions') {
    fetchSubmissions()
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
    return date.toDate().toLocaleDateString()
  }
  return new Date(date).toLocaleDateString()
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
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

// Load students on component mount
onMounted(async () => {
  await fetchStudents()
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

.assignment-form, .submissions-section {
  max-width: 1200px;
  margin: 20px auto 0;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submissions-filters {
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
  margin-bottom: 15px;
}

.submission-info h3 {
  margin: 0;
  color: #2c3e50;
}

.submission-type {
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
  margin-left: 10px;
}

.submission-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.submission-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.submission-status.submitted {
  background-color: #d4edda;
  color: #155724;
}

.submission-status.graded {
  background-color: #cce5ff;
  color: #004085;
}

.submission-status.late {
  background-color: #f8d7da;
  color: #721c24;
}

.submission-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.submission-text {
  margin-bottom: 15px;
}

.submission-text h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.submission-text p {
  margin: 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #2c3e50;
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
  transition: background-color 0.2s;
}

.grade-btn {
  background-color: #28a745;
  color: white;
}

.grade-btn:hover:not(:disabled) {
  background-color: #218838;
}

.view-btn {
  background-color: #4a6cf7;
  color: white;
}

.view-btn:hover:not(:disabled) {
  background-color: #3a5bd9;
}

.reminder-btn {
  background-color: #ffc107;
  color: #212529;
}

.reminder-btn:hover:not(:disabled) {
  background-color: #e0a800;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.assign-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.assign-btn:hover:not(:disabled) {
  background-color: #3a5bd9;
}

.assign-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.no-students, .no-submissions {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .assign-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .submissions-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .submissions-filters {
    flex-wrap: wrap;
  }
  
  .submission-details {
    grid-template-columns: 1fr;
  }
  
  .submission-actions {
    flex-direction: column;
  }
}
</style>