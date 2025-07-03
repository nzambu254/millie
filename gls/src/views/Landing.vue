<template>
  <div class="landing-container">
    <div class="content">
      <div class="icon-container">
        <svg class="main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>
      <h1>Geometry Learning System</h1>
      <p class="subtitle">Transform how geometry is learned and taught with our interactive platform combining visualization, practice, and AI-powered feedback.</p>

      <div class="cards-container">
        <div class="card">
          <div class="card-image">
            <img src="/images/pic1.jpeg" alt="Interactive Geometry Tools">
          </div>
          <div class="card-content">
            <h3>Visual Learning</h3>
            <p>Manipulate geometric shapes in real-time with our interactive tools. Drag points, rotate polygons, and see how angles change dynamically. Perfect for understanding complex concepts like congruence, similarity, and the Pythagorean theorem.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-image">
            <img src="/images/pic2.jpeg" alt="Practice Problems">
          </div>
          <div class="card-content">
            <h3>Personalized Practice</h3>
            <p>Our adaptive system generates problems tailored to your skill level. Start with basic angle calculations and progress to advanced proofs. Immediate feedback helps you learn from mistakes and master each concept before moving forward.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-image">
            <img src="/images/pic3.jpeg" alt="Real-time Feedback">
          </div>
          <div class="card-content">
            <h3>AI-Powered Feedback</h3>
            <p>Get detailed explanations for every solution. Our system analyzes your work step-by-step, identifying exactly where you need improvement. Teachers can track class progress and identify common challenges.</p>
          </div>
        </div>
      </div>

      <div class="features">
        <div class="feature">
          <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm1.65-2.65L11.5 12.2V7h1v4.8l1.65 1.65-.5.5z"/>
          </svg>
          <span>Interactive Tools</span>
        </div>
        <div class="feature">
          <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <span>500+ Problems</span>
        </div>
        <div class="feature">
          <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.97 0-9 3.19-9 7 0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V18h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V18h1c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.81-4.03-7-9-7z"/>
          </svg>
          <span>Instant Feedback</span>
        </div>
      </div>

      <div class="buttons">
        <RouterLink to="/login">
          <button class="btn">
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Start Learning Now
          </button>
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #333;
  text-align: center;
  padding: 2rem;
}

.content {
  max-width: 1200px;
  padding: 3rem;
  background-color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-radius: 20px;
}

.icon-container {
  margin-bottom: 1.5rem;
}

.main-icon {
  width: 80px;
  height: 80px;
  fill: #4facfe;
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  line-height: 1.6;
  color: #6c757d;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cards-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 3rem;
}

.card {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}

.card-image {
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 1.5rem;
  text-align: left;
}

.card-content h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.card-content p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 0;
}

.features {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin: 3rem 0;
  gap: 1.5rem;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
  color: #2c3e50;
}

.feature-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
  fill: #4facfe;
}

.buttons .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 172, 254, 0.3);
}

.buttons .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(74, 172, 254, 0.4);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  fill: white;
}

@media (max-width: 1024px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  
  .card {
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 2rem;
  }
  
  h1 {
    font-size: 2.2rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .features {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
}
</style>