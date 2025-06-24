<template>
  <div class="content-management">
    <h1>Content Management</h1>
    <div class="content-controls">
      <div class="card">
        <h3>Manage Learning Materials</h3>
        <button @click="showAddContentModal = true">Add New Content</button>
        
        <!-- Content list -->
        <div class="content-list" v-if="contents.length > 0">
          <h4>Existing Content</h4>
          <ul>
            <li v-for="content in contents" :key="content.id">
              {{ content.title }} - {{ content.topic }}
              <button @click="confirmDelete(content.id)" class="delete-btn">Delete</button>
            </li>
          </ul>
        </div>
        <p v-else>No content available yet.</p>
      </div>
    </div>

    <!-- Add Content Modal -->
    <div v-if="showAddContentModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddContentModal = false">&times;</span>
        <h3>Add New Geometry Content</h3>
        <form @submit.prevent="addContent">
          <div class="form-group">
            <label for="title">Title:</label>
            <input type="text" id="title" v-model="newContent.title" required>
          </div>
          <div class="form-group">
            <label for="topic">Topic:</label>
            <select id="topic" v-model="newContent.topic" required>
              <option value="Lines and Angles">Lines and Angles</option>
              <option value="Triangles">Triangles</option>
              <option value="Quadrilaterals">Quadrilaterals</option>
              <option value="Circles">Circles</option>
              <option value="Coordinate Geometry">Coordinate Geometry</option>
              <option value="Trigonometry">Trigonometry</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" v-model="newContent.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="contentFile">Upload PDF/Document:</label>
            <input type="file" id="contentFile" @change="handleFileUpload" accept=".pdf,.doc,.docx" required>
          </div>
          <div class="form-group">
            <label for="difficulty">Difficulty Level:</label>
            <select id="difficulty" v-model="newContent.difficulty" required>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Add Content' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <p>Are you sure you want to delete this content?</p>
        <div class="modal-buttons">
          <button @click="deleteContent" class="confirm-btn">Yes, Delete</button>
          <button @click="showConfirmModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, storage } from '@/firebase' // Assuming you have firebase initialized
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// State for content management
const contents = ref([])
const showAddContentModal = ref(false)
const showConfirmModal = ref(false)
const uploading = ref(false)
const contentToDelete = ref(null)

const newContent = ref({
  title: '',
  topic: '',
  description: '',
  file: null,
  fileUrl: '',
  difficulty: 'Beginner',
  createdAt: null
})

// Fetch all contents on component mount
onMounted(async () => {
  await fetchContents()
})

const fetchContents = async () => {
  const querySnapshot = await getDocs(collection(db, 'geometry_contents'))
  contents.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

const handleFileUpload = (event) => {
  newContent.value.file = event.target.files[0]
}

const addContent = async () => {
  uploading.value = true
  try {
    // Upload file to Firebase Storage first
    const fileRef = storageRef(storage, `geometry_contents/${Date.now()}_${newContent.value.file.name}`)
    await uploadBytes(fileRef, newContent.value.file)
    const fileUrl = await getDownloadURL(fileRef)

    // Add content data to Firestore
    const contentData = {
      title: newContent.value.title,
      topic: newContent.value.topic,
      description: newContent.value.description,
      fileUrl,
      difficulty: newContent.value.difficulty,
      createdAt: new Date()
    }

    await addDoc(collection(db, 'geometry_contents'), contentData)
    
    // Reset form and fetch updated contents
    resetForm()
    await fetchContents()
    showAddContentModal.value = false
  } catch (error) {
    console.error('Error adding content:', error)
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  newContent.value = {
    title: '',
    topic: '',
    description: '',
    file: null,
    fileUrl: '',
    difficulty: 'Beginner',
    createdAt: null
  }
}

const confirmDelete = (id) => {
  contentToDelete.value = id
  showConfirmModal.value = true
}

const deleteContent = async () => {
  try {
    await deleteDoc(doc(db, 'geometry_contents', contentToDelete.value))
    await fetchContents()
    showConfirmModal.value = false
    contentToDelete.value = null
  } catch (error) {
    console.error('Error deleting content:', error)
  }
}
</script>

<style scoped>
.content-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px 0;
}

button:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
  margin-left: 10px;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* Modal styles */
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  position: relative;
}

.close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
}

/* Form styles */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

/* Content list styles */
.content-list {
  margin-top: 20px;
}

.content-list ul {
  list-style-type: none;
  padding: 0;
}

.content-list li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Confirmation modal buttons */
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn {
  background-color: #f44336;
}

.cancel-btn {
  background-color: #757575;
}

.confirm-btn:hover {
  background-color: #d32f2f;
}

.cancel-btn:hover {
  background-color: #616161;
}
</style>