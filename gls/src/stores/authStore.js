// src/stores/authStore.js
import { defineStore } from 'pinia'
import { auth } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
  }),
  actions: {
    async register(email, password) {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password)
    },
    async logout() {
      await signOut(auth)
      this.user = null
    },
    fetchUser() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.loading = false
      })
    },
  },
})
