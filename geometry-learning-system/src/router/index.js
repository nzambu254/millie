import { createRouter, createWebHistory } from 'vue-router';
import Learn from '../views/Learn.vue';
import Landing from '../views/Landing.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import NotFound from '../views/NotFound.vue';
import { authGuard } from './authGuard';

const routes = [
  { path: '/', component: Landing },
  { path: '/learn', component: Learn },
  { path: '/dashboard', beforeEnter: authGuard, component: Dashboard },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  {
  path: '/admin',
  name: 'AdminDashboard',
  component: () => import('@/views/AdminDashboard.vue'),
  meta: { requiresAuth: true, role: 'admin' }
},
{
  path: '/manage-quizzes',
  name: 'ManageQuizzes',
  component: () => import('@/views/ManageQuizzes.vue'),
  meta: { requiresAuth: true, role: 'admin' }
},
{
  path: '/register',
  name: 'Register',
  component: () => import('@/views/Register.vue')
},
{
    path: '/login',
    name: 'Login',
    component: Login
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

