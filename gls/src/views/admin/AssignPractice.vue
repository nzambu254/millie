<template>
  <div class="assign-practice">
    <h1>Assign Practice</h1>
    <div class="assignment-form">
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
        <label for="practice-content">Select Content</label>
        <select id="practice-content" v-model="selectedContent">
          <option value="">Select content to assign</option>
          <option v-for="content in availableContent" :key="content.id" :value="content.id">
            {{ content.title }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Assign To</label>
        <div class="assign-options">
          <label><input type="radio" v-model="assignTo" value="all"> All Students</label>
          <label><input type="radio" v-model="assignTo" value="selected"> Selected Students</label>
          <label><input type="radio" v-model="assignTo" value="groups"> Groups/Classes</label>
        </div>
        <div v-if="assignTo === 'selected'" class="student-selection">
          <div class="student-checkbox" v-for="student in students" :key="student.id">
            <input type="checkbox" :id="'student-' + student.id" :value="student.id" v-model="selectedStudents">
            <label :for="'student-' + student.id">{{ student.name }}</label>
          </div>
        </div>
      </div>
      <button class="assign-btn" @click="assignPractice">Assign Practice</button>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const practiceType = ref('')
const dueDate = ref('')
const selectedContent = ref('')
const assignTo = ref('all')
const selectedStudents = ref([])
const successMessage = ref('')

const availableContent = [
  { id: 1, title: "Basic Geometry Quiz" },
  { id: 2, title: "Triangle Properties Exercises" },
  { id: 3, title: "Circle Theorems Assignment" }
]

const students = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Mike Johnson" },
  { id: 4, name: "Sarah Williams" }
]

const assignPractice = () => {
  if (!practiceType.value || !selectedContent.value) {
    alert('Please fill in all required fields')
    return
  }
  
  // In a real app, you would send this to your backend
  console.log('Practice assigned:', {
    practiceType: practiceType.value,
    dueDate: dueDate.value,
    content: selectedContent.value,
    assignTo: assignTo.value,
    selectedStudents: selectedStudents.value
  })
  
  successMessage.value = 'Practice has been successfully assigned!'
  
  // Reset form
  practiceType.value = ''
  dueDate.value = ''
  selectedContent.value = ''
  assignTo.value = 'all'
  selectedStudents.value = []
  
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.assign-practice {
  padding: 20px;
}

.assignment-form {
  max-width: 800px;
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
.form-group input[type="date"] {
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
  max-height: 200px;
  overflow-y: auto;
}

.student-checkbox {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.assign-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.assign-btn:hover {
  background-color: #3a5bd9;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
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
}
</style>