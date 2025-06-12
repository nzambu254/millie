<template>
  <div>
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="login">Login</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const login = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (error) {
    alert('Login failed');
  }
};
</script>

