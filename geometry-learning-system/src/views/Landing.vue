<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="landing-container">
    <div class="content">
      <h1>Welcome to Geometry Learning System</h1>
      <p>Interactive geometry tools, practice, quizzes, and real-time feedback for students and teachers.</p>

      <div class="buttons">
        <RouterLink to="/login">
          <button class="btn">Login as Student or Teacher</button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// No JS logic required here for basic landing
</script>

<style scoped>
.landing-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  color: white;
  text-align: center;
}

.content {
  max-width: 600px;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.buttons .btn {
  background-color: white;
  color: #4facfe;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.buttons .btn:hover {
  background-color: #e0e0e0;
}
</style>
