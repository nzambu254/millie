<template>
  <div class="manage-users">
    <h1>Manage Users</h1>
    <div class="user-controls">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search users...">
        <button class="search-btn" @click="searchUsers">Search</button>
      </div>
      <button class="add-user-btn" @click="showAddUserModal = true">Add New User</button>
    </div>
    
    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.uid">
            <td>{{ user.displayName || 'N/A' }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role || 'student' }}</td>
            <td>
              <span :class="['status-badge', user.status]">{{ user.status || 'active' }}</span>
            </td>
            <td class="actions">
              <button class="edit-btn" @click="editUser(user)">Edit</button>
              <button class="delete-btn" @click="confirmDeleteUser(user)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal">
        <h2>Add New User</h2>
        <form @submit.prevent="addNewUser">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" v-model="newUser.name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="newUser.email" required>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="newUser.role" required>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showAddUserModal = false">Cancel</button>
            <button type="submit" class="submit-btn">Add User</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="modal-overlay">
      <div class="modal">
        <h2>Edit User</h2>
        <form @submit.prevent="updateUser">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" v-model="editingUser.displayName" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="editingUser.email" required>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="editingUser.role" required>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="editingUser.status" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showEditUserModal = false">Cancel</button>
            <button type="submit" class="submit-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete user {{ userToDelete?.email }}?</p>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="showDeleteConfirmation = false">Cancel</button>
          <button type="button" class="delete-btn" @click="deleteUser">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  updateEmail
} from 'firebase/auth'
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore'
import { db } from '@/firebase' // Adjust this import based on your Firebase setup

const searchQuery = ref('')
const users = ref([])
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteConfirmation = ref(false)

const newUser = ref({
  name: '',
  email: '',
  role: 'student'
})

const editingUser = ref(null)
const userToDelete = ref(null)

// Fetch users from Firebase on component mount
onMounted(async () => {
  await fetchUsers()
})

const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    users.value = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const searchUsers = async () => {
  if (!searchQuery.value) {
    await fetchUsers()
    return
  }
  
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '>=', searchQuery.value.toLowerCase()),
      where('email', '<=', searchQuery.value.toLowerCase() + '\uf8ff')
    )
    
    const querySnapshot = await getDocs(q)
    users.value = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error searching users:', error)
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user => 
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addNewUser = async () => {
  try {
    const auth = getAuth()
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      newUser.value.email,
      'temporaryPassword' // Will be changed via reset link
    )
    
    // Set display name
    await updateProfile(userCredential.user, {
      displayName: newUser.value.name
    })
    
    // Create user document in Firestore
    // Create user document in Firestore
await setDoc(doc(db, 'users', userCredential.user.uid), {
  uid: userCredential.user.uid,
  email: newUser.value.email,
  displayName: newUser.value.name,
  role: newUser.value.role,
  status: 'active',
  createdAt: new Date().toISOString()
})
    
    // Send password reset email
    await sendPasswordResetEmail(auth, newUser.value.email)
    
    // Reset form and close modal
    newUser.value = { name: '', email: '', role: 'student' }
    showAddUserModal.value = false
    
    // Refresh user list
    await fetchUsers()
    
    alert('User created successfully. Password reset link has been sent to their email.')
  } catch (error) {
    console.error('Error adding user:', error)
    alert(`Error adding user: ${error.message}`)
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditUserModal.value = true
}

const updateUser = async () => {
  try {
    const auth = getAuth()
    const userDocRef = doc(db, 'users', editingUser.value.uid)
    
    // Update Firestore document
    await updateDoc(userDocRef, {
      displayName: editingUser.value.displayName,
      email: editingUser.value.email,
      role: editingUser.value.role,
      status: editingUser.value.status
    })
    
    // Update Firebase Auth if email changed
    const currentUser = auth.currentUser
    if (currentUser && currentUser.uid === editingUser.value.uid) {
      await updateEmail(currentUser, editingUser.value.email)
      await updateProfile(currentUser, {
        displayName: editingUser.value.displayName
      })
    }
    
    showEditUserModal.value = false
    await fetchUsers()
    alert('User updated successfully')
  } catch (error) {
    console.error('Error updating user:', error)
    alert(`Error updating user: ${error.message}`)
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteConfirmation.value = true
}

const deleteUser = async () => {
  try {
    // In a real app, you might want to:
    // 1. Delete from Firebase Authentication
    // 2. Delete from Firestore
    // 3. Handle any related data
    
    // For this example, we'll just delete from Firestore
    await deleteDoc(doc(db, 'users', userToDelete.value.uid))
    
    showDeleteConfirmation.value = false
    await fetchUsers()
    alert('User deleted successfully')
  } catch (error) {
    console.error('Error deleting user:', error)
    alert(`Error deleting user: ${error.message}`)
  }
}
</script>

<style scoped>
.manage-users {
  padding: 20px;
}

.user-controls {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-bar input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}

.search-btn, .add-user-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn {
  background-color: #4a6cf7;
  color: white;
}

.add-user-btn {
  background-color: #28a745;
  color: white;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn {
  background-color: #ffc107;
  color: #212529;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

/* Modal styles */
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

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .submit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.submit-btn {
  background-color: #28a745;
  color: white;
}
</style>