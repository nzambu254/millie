<template>
  <div class="support-resources">
    <h1>Support & Resources</h1>
    <div class="resource-sections">
      <div class="resource-section">
        <h2>Help Center</h2>
        <div class="resource-list">
          <div class="resource-item">
            <h3>FAQs</h3>
            <p>Find answers to common questions</p>
          </div>
          <div class="resource-item">
            <h3>Contact Support</h3>
            <p>Get help from our support team</p>
          </div>
        </div>
      </div>
      <div class="resource-section">
        <h2>Learning Resources</h2>
        <div class="resource-list">
          <div class="resource-item">
            <h3>Video Tutorials</h3>
            <p>Watch step-by-step video explanations</p>
          </div>
          <div class="resource-item">
            <h3>Downloadable PDFs</h3>
            <p>Reference materials for offline study</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here
</script>

<style scoped>
.support-resources {
  padding: 20px;
}

.resource-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.resource-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.resource-section h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.resource-list {
  margin-top: 15px;
}

.resource-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.resource-item h3 {
  margin-top: 0;
  color: #4a6cf7;
}

.resource-item p {
  color: #666;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .resource-sections {
    grid-template-columns: 1fr;
  }
}
</style>