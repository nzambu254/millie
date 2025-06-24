<template>
  <div class="content-module">
    <h1>Content Module</h1>
    <div class="module-list">
      <div class="module-card" v-for="module in modules" :key="module.id">
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
        <router-link :to="`/content/${module.id}`" class="view-btn">View Content</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const modules = [
  {
    id: 1,
    title: "Basic Geometry Concepts",
    description: "Learn about points, lines, angles and basic geometric shapes."
  },
  {
    id: 2,
    title: "Triangles and Their Properties",
    description: "Explore different types of triangles and their characteristics."
  },
  {
    id: 3,
    title: "Circles and Their Properties",
    description: "Understand the properties and theorems related to circles."
  }
]
</script>

<style scoped>
.content-module {
  padding: 20px;
}

.module-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.module-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.module-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.module-card p {
  color: #666;
}

.view-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 8px 15px;
  background-color: #4a6cf7;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.view-btn:hover {
  background-color: #3a5bd9;
}
</style>