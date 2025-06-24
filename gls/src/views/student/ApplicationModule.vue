<template>
  <div class="application-module">
    <h1>Application Module</h1>
    <div class="interactive-tools">
      <div class="tool-card">
        <h3>Geometry Calculator</h3>
        <p>Calculate area, perimeter and other properties of shapes</p>
        <router-link to="/application/calculator" class="tool-btn">Open Calculator</router-link>
      </div>
      <div class="tool-card">
        <h3>Interactive Diagrams</h3>
        <p>Visualize geometric concepts with interactive diagrams</p>
        <router-link to="/application/diagrams" class="tool-btn">View Diagrams</router-link>
      </div>
      <div class="tool-card">
        <h3>Problem Solver</h3>
        <p>Step-by-step solutions to geometry problems</p>
        <router-link to="/application/solver" class="tool-btn">Try Solver</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here
</script>

<style scoped>
.application-module {
  padding: 20px;
}

.interactive-tools {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tool-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.tool-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.tool-card p {
  color: #666;
  flex-grow: 1;
}

.tool-btn {
  display: inline-block;
  padding: 8px 15px;
  background-color: #4a6cf7;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.tool-btn:hover {
  background-color: #3a5bd9;
}
</style>