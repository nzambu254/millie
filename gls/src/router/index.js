import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

// Lazy load layouts and views
const Landing = () => import('@/views/Landing.vue')
const Login = () => import('@/views/Login.vue')
const NotFound = () => import('@/views/NotFound.vue')

// Admin Views
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const ManageUsers = () => import('@/views/admin/ManageUsers.vue')
const AssignPractice = () => import('@/views/admin/AssignPractice.vue')
const AdminNotifications = () => import('@/views/admin/Notifications.vue')
const ContentManagement = () => import('@/views/admin/ContentManagement.vue')
const SystemSettings = () => import('@/views/admin/SystemSettings.vue')

// Student Views
const StudentDashboard = () => import('@/views/student/Dashboard.vue')
const ContentModule = () => import('@/views/student/ContentModule.vue')
const ApplicationModule = () => import('@/views/student/ApplicationModule.vue')
const SupportResources = () => import('@/views/student/SupportResources.vue')
const AssessmentModule = () => import('@/views/student/AssessmentModule.vue')
const PracticeExercises = () => import('@/views/student/PracticeExercises.vue')
const SendNotification = () => import('@/views/student/SendNotification.vue')

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
    meta: { 
      layout: 'no-sidebar',
      requiresAuth: false 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      layout: 'no-sidebar',
      requiresAuth: false 
    }
  },

  // Admin Routes
  {
    path: '/admin',
    component: { template: '<router-view />' },
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    },
    children: [
      { 
        path: '', 
        name: 'AdminDashboard', 
        component: AdminDashboard,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'dashboard', 
        name: 'AdminDashboardAlt', 
        component: AdminDashboard,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'manage-users', 
        name: 'ManageUsers', 
        component: ManageUsers,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'content-management', 
        name: 'ContentManagement', 
        component: ContentManagement,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'assign-practice', 
        name: 'AssignPractice', 
        component: AssignPractice,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'notifications', 
        name: 'AdminNotifications', 
        component: AdminNotifications,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      { 
        path: 'settings', 
        name: 'SystemSettings', 
        component: SystemSettings,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true 
        }
      }
    ]
  },

  // Student Routes
  {
    path: '/dashboard',
    component: { template: '<router-view />' },
    meta: { 
      requiresAuth: true 
    },
    children: [
      { 
        path: '', 
        name: 'StudentDashboard', 
        component: StudentDashboard,
        meta: { 
          requiresAuth: true 
        }
      },
      { 
        path: 'content', 
        name: 'ContentModule', 
        component: ContentModule,
        meta: { 
          requiresAuth: true 
        }
      },
      { 
        path: 'application', 
        name: 'ApplicationModule', 
        component: ApplicationModule,
        meta: { 
          requiresAuth: true 
        }
      },
      { 
        path: 'resources', 
        name: 'SupportResources', 
        component: SupportResources,
        meta: { 
          requiresAuth: true 
        }
      },
      { 
        path: 'assessments', 
        name: 'AssessmentModule', 
        component: AssessmentModule,
        meta: { 
          requiresAuth: true 
        }
      },
      { 
        path: 'practice', 
        name: 'PracticeExercises', 
        component: PracticeExercises,
        meta: { 
          requiresAuth: true 
        }
      },
      {
  path: '/practice/1',
  name: 'RectangleContent',
  component: () => import('@/components/RectangleContent.vue'),
          meta: { 
          requiresAuth: true 
        }
},
      { 
        path: 'send-notification', 
        name: 'SendNotification', 
        component: SendNotification,
        meta: { 
          requiresAuth: true 
        }
      },
    ]
  },

  // Catch-all 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { 
      layout: 'no-sidebar',
      requiresAuth: false 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Helper function to check user role
async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    return userDoc.exists() ? userDoc.data().role || 'student' : 'student'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'student'
  }
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // If route doesn't require auth, allow access
  if (!requiresAuth) {
    // If user is authenticated and trying to access landing/login, redirect to appropriate dashboard
    if (currentUser && (to.path === '/' || to.path === '/login')) {
      try {
        const userRole = await getUserRole(currentUser.uid)
        const redirectTo = userRole === 'admin' ? '/admin/dashboard' : '/dashboard'
        next(redirectTo)
      } catch (error) {
        console.error('Error checking user role during redirect:', error)
        next('/dashboard') // Default fallback
      }
    } else {
      next()
    }
    return
  }

  // Route requires authentication
  if (!currentUser) {
    next('/login')
    return
  }

  // If route requires admin privileges
  if (requiresAdmin) {
    try {
      const userRole = await getUserRole(currentUser.uid)
      if (userRole !== 'admin') {
        next('/dashboard') // Redirect non-admin users to student dashboard
        return
      }
    } catch (error) {
      console.error('Error checking admin privileges:', error)
      next('/login')
      return
    }
  }

  next()
})

export default router