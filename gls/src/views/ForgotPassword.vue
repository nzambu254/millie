<template>
  <div>
    <h2>Reset Password</h2>
    <form @submit.prevent="resetPassword">
      <input v-model="email" type="email" placeholder="Email" />
      <button type="submit">Send Reset Link</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'

const email = ref('')

const resetPassword = async () => {
  await sendPasswordResetEmail(auth, email.value)
  alert('Reset link sent')
}
</script>
