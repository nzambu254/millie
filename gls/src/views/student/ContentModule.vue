<template>
  <div class="student-content-view">
    <h1>Geometry Learning Materials</h1>
    
    <!-- Rectangle Notes Section -->
    <div class="rectangle-notes-section">
      <h2>Rectangle Notes</h2>
      <div class="notes-card">
        <h3>Understanding Rectangles</h3>
        <p>Access comprehensive notes on rectangles including properties, formulas, and examples.</p>
        <div class="notes-actions">
          <a href="/assets/donwloadable.pdf" target="_blank" class="notes-btn view-btn">
            View PDF Notes
          </a>
          <a href="/assets/donwloadable.pdf" download="Rectangle_Notes.pdf" class="notes-btn download-btn">
            Download PDF
          </a>
        </div>
      </div>
    </div>
    
    <div class="filter-controls">
      <div class="filter-group">
        <label for="topic-filter">Filter by Topic:</label>
        <select id="topic-filter" v-model="selectedTopic" @change="filterContents">
          <option value="all">All Topics</option>
          <option v-for="topic in uniqueTopics" :key="topic" :value="topic">{{ topic }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="difficulty-filter">Filter by Difficulty:</label>
        <select id="difficulty-filter" v-model="selectedDifficulty" @change="filterContents">
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
    </div>
    
    <div class="content-cards">
      <div v-for="content in filteredContents" :key="content.id" class="content-card">
        <h3>{{ content.title }}</h3>
        <div class="content-meta">
          <span class="topic-badge">{{ content.topic }}</span>
          <span class="difficulty-badge" :class="content.difficulty.toLowerCase()">
            {{ content.difficulty }}
          </span>
          <span class="date">{{ formatDate(content.createdAt) }}</span>
        </div>
        <p>{{ content.description }}</p>
        <a :href="content.fileUrl" target="_blank" class="download-btn">View/Download</a>
      </div>
    </div>
    
    <p v-if="filteredContents.length === 0">No content available matching your filters.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const contents = ref([])
const selectedTopic = ref('all')
const selectedDifficulty = ref('all')

// Fetch all contents on component mount
onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, 'geometry_contents'))
  contents.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
})

// Get unique topics for filter dropdown
const uniqueTopics = computed(() => {
  const topics = new Set(contents.value.map(c => c.topic))
  return Array.from(topics).sort()
})

// Filter contents based on selected filters
const filteredContents = computed(() => {
  return contents.value.filter(content => {
    const topicMatch = selectedTopic.value === 'all' || content.topic === selectedTopic.value
    const difficultyMatch = selectedDifficulty.value === 'all' || content.difficulty === selectedDifficulty.value
    return topicMatch && difficultyMatch
  })
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const filterContents = () => {
  // The computed property will automatically update
}
</script>

<style scoped>
.student-content-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Rectangle Notes Section Styles */
.rectangle-notes-section {
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.rectangle-notes-section h2 {
  margin: 0 0 15px 0;
  font-size: 1.8em;
  text-align: center;
}

.notes-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.notes-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.4em;
}

.notes-card p {
  margin: 0 0 20px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.notes-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.notes-btn {
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.view-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.download-btn {
  background: #4CAF50;
  color: white;
  border: 2px solid #4CAF50;
}

.download-btn:hover {
  background: #45a049;
  border-color: #45a049;
  transform: translateY(-2px);
}

.filter-controls {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.content-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.content-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.content-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
  font-size: 0.9em;
  color: #555;
}

.topic-badge {
  background: #e1f5fe;
  padding: 3px 8px;
  border-radius: 12px;
}

.difficulty-badge {
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
}

.difficulty-badge.beginner {
  background: #4CAF50;
}

.difficulty-badge.intermediate {
  background: #2196F3;
}

.difficulty-badge.advanced {
  background: #f44336;
}

.content-card .download-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.content-card .download-btn:hover {
  background-color: #45a049;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .notes-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .notes-btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
}
</style>