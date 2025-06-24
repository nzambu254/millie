<template>
  <div class="manage-users">
    <h1>Manage Users</h1>
    <div class="user-controls">
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search users...">
        <button class="search-btn">Search</button>
      </div>
      <button class="add-user-btn">Add New User</button>
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
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status-badge', user.status]">{{ user.status }}</span>
            </td>
            <td class="actions">
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    status: "active"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "student",
    status: "active"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "student",
    status: "inactive"
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "admin",
    status: "active"
  }
]

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users
  return users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
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
</style>
