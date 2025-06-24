<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="admin-stats">
      <div class="stat-card">
        <h3>Total Students</h3>
        <p>124</p>
      </div>
      <div class="stat-card">
        <h3>Active Courses</h3>
        <p>8</p>
      </div>
      <div class="stat-card">
        <h3>Pending Notifications</h3>
        <p>5</p>
      </div>
      <div class="stat-card">
        <h3>Recent Activity</h3>
        <p>12</p>
      </div>
    </div>
    <div class="recent-activity">
      <h2>Recent Student Activity</h2>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in activities" :key="activity.id">
          <div class="activity-content">
            <strong>{{ activity.student }}</strong> {{ activity.action }}
          </div>
          <div class="activity-time">{{ activity.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const activities = [
  {
    id: 1,
    student: "John Doe",
    action: "completed the Basic Geometry quiz",
    time: "2 hours ago"
  },
  {
    id: 2,
    student: "Jane Smith",
    action: "submitted a notification",
    time: "3 hours ago"
  },
  {
    id: 3,
    student: "Mike Johnson",
    action: "started the Triangles module",
    time: "5 hours ago"
  },
  {
    id: 4,
    student: "Sarah Williams",
    action: "completed the Circles practice exercises",
    time: "1 day ago"
  }
]
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #555;
  font-size: 1rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0 0;
}

.recent-activity {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-activity h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.activity-list {
  margin-top: 15px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  color: #333;
}

.activity-time {
  color: #888;
  font-size: 0.9rem;
}
</style>