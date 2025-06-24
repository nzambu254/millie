<template>
  <div class="assessment-module">
    <h1>Assessment Module</h1>
    <div class="assessment-types">
      <div class="assessment-card">
        <h3>Quizzes</h3>
        <p>Short assessments to test your understanding</p>
        <div class="assessment-actions">
          <router-link to="/assessment/quizzes" class="action-btn">View Quizzes</router-link>
        </div>
      </div>
      <div class="assessment-card">
        <h3>Tests</h3>
        <p>Comprehensive tests covering multiple topics</p>
        <div class="assessment-actions">
          <router-link to="/assessment/tests" class="action-btn">View Tests</router-link>
        </div>
      </div>
      <div class="assessment-card">
        <h3>Progress Report</h3>
        <p>View your performance and progress</p>
        <div class="assessment-actions">
          <router-link to="/assessment/progress" class="action-btn">View Report</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here
</script>

<style scoped>
.assessment-module {
  padding: 20px;
}

.assessment-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.assessment-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.assessment-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.assessment-card p {
  color: #666;
  flex-grow: 1;
}

.assessment-actions {
  margin-top: 15px;
}

.action-btn {
  display: inline-block;
  padding: 8px 15px;
  background-color: #4a6cf7;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.action-btn:hover {
  background-color: #3a5bd9;
}
</style>