<template>
  <div class="send-notification">
    <h1>Send Notification to Admin</h1>
    <div class="notification-form">
      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" v-model="subject" placeholder="Enter subject">
      </div>
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" v-model="message" rows="5" placeholder="Enter your message"></textarea>
      </div>
      <button class="submit-btn" @click="sendNotification">Send Notification</button>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const subject = ref('')
const message = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const sendNotification = () => {
  if (!subject.value || !message.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  // In a real app, you would send this to your backend
  console.log('Notification sent:', {
    subject: subject.value,
    message: message.value
  })
  
  successMessage.value = 'Your notification has been sent to the admin!'
  errorMessage.value = ''
  subject.value = ''
  message.value = ''
  
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.send-notification {
  padding: 20px;
}

.notification-form {
  max-width: 600px;
  margin: 20px auto 0;
  background: white;
  padding: 20px;
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
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.submit-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover {
  background-color: #3a5bd9;
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
</style>