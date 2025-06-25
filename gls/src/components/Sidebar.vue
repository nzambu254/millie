<template>
  <aside class="sidebar" :class="{ 'admin-sidebar': isAdmin }">
    <div class="sidebar-inner">
      <!-- Logo/Branding Section -->
      <div class="sidebar-brand">
        <h2>{{ isAdmin ? 'Admin Panel' : 'Geometry Learning System' }}</h2>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <ul>
          <!-- Student Links -->
          <template v-if="!isAdmin">
            <li>
              <router-link to="/dashboard" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span class="nav-text">Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/content" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                <span class="nav-text">Content Module</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/application" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                <span class="nav-text">Application Module</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/resources" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
                <span class="nav-text">Support & Resources</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/assessments" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
                </svg>
                <span class="nav-text">Assessment Module</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/practice" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-3.06 16L7.4 14.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L10.94 18zM13 9V3.5L18.5 9H13z"/>
                </svg>
                <span class="nav-text">Practice & Exercises</span>
              </router-link>
            </li>
            <li>
              <router-link to="/dashboard/send-notification" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                <span class="nav-text">Send Notification</span>
                <span v-if="unreadNotifications > 0" class="notification-dot"></span>
              </router-link>
            </li>
          </template>

          <!-- Admin Links -->
          <template v-else>
            <li>
              <router-link to="/admin/dashboard" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span class="nav-text">Admin Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/manage-users" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span class="nav-text">Manage Users</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/content-management" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                <span class="nav-text">Content Management</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/assign-practice" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span class="nav-text">Assign Practice</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/notifications" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                <span class="nav-text">Notifications</span>
                <span v-if="unreadNotifications > 0" class="notification-dot"></span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/settings" class="nav-link" active-class="active">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
                <span class="nav-text">System Settings</span>
              </router-link>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  isAdmin: Boolean,
  currentUserEmail: String,
  currentUserRole: String,
  unreadNotifications: Number
})

const router = useRouter()
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #dbdee0;
  color: rgb(0, 0, 0);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  transition: all 0.3s ease;
  overflow-y: auto;
}

.admin-sidebar {
  background-color: #dbdee0;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-brand {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.sidebar-brand h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem; /* Increased spacing between links */
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: blue;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgb(72, 201, 206);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: rgb(10, 10, 10);
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 1rem;
  fill: currentColor;
}

.nav-text {
  flex: 1;
}

.notification-dot {
  background-color: #e74c3c;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  position: absolute;
  top: 10px;
  right: 12px;
  box-shadow: 0 0 5px rgba(231, 76, 60, 0.7);
  z-index: 100;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    overflow: hidden;
  }

  .sidebar-brand h2,
  .nav-text {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }

  .nav-icon {
    margin-right: 0;
  }

  .notification-dot {
    top: 8px;
    right: 8px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 0;
    transform: translateX(-100%);
  }

  .sidebar.active {
    width: 250px;
    transform: translateX(0);
  }
}
</style>
