<template>
  <div class="practice-exercises">
    <h1>Practice & Exercises</h1>
    <div class="exercise-categories">
      <div class="category-card" v-for="category in categories" :key="category.id">
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
        <div class="exercise-count">{{ category.exerciseCount }} exercises</div>
        <router-link :to="`/practice/${category.id}`" class="start-btn">Start Practicing</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const categories = [
  {
    id: 1,
    name: "Basic Geometry - Rectangles",
    description: "Master the fundamentals of rectangles including properties, formulas, and problem-solving techniques",
    exerciseCount: 11
  }
]
</script>

<style scoped>
.practice-exercises {
  padding: 20px;
}

.exercise-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.category-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.category-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.category-card p {
  color: #666;
  flex-grow: 1;
}

.exercise-count {
  font-size: 0.9rem;
  color: #888;
  margin: 10px 0;
}

.start-btn {
  display: inline-block;
  padding: 8px 15px;
  background-color: #4a6cf7;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.start-btn:hover {
  background-color: #3a5bd9;
}
</style>