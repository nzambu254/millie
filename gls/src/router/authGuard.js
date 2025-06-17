import { getAuth, onAuthStateChanged } from 'firebase/auth'

export function authGuard(to, from, next) {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) next()
    else next('/login')
  })
}
