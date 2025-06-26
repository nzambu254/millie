<template>
  <div class="support-resources">
    <h1>Support & Resources</h1>
    <div class="resource-sections">
      <div class="resource-section">
        <h2>Help Center</h2>
        <div class="resource-list">
          <div class="resource-item clickable" @click="toggleFAQs">
            <h3>FAQs</h3>
            <p>Find answers to common questions</p>
          </div>
          <div class="resource-item clickable" @click="showContactModal">
            <h3>Contact Support</h3>
            <p>Get help from our support team</p>
          </div>
        </div>
      </div>
      <div class="resource-section">
        <h2>Learning Resources</h2>
        <div class="resource-list">
          <div class="resource-item clickable" @click="openVideoTutorials">
            <h3>Video Tutorials</h3>
            <p>Watch step-by-step video explanations</p>
          </div>
          <div class="resource-item clickable" @click="downloadPDF">
            <h3>Downloadable PDFs</h3>
            <p>Reference materials for offline study</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQs Section -->
    <div v-if="showFAQs" class="faqs-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
        <div class="faq-question" @click="toggleFAQ(index)">
          <h3>{{ faq.question }}</h3>
          <span class="faq-toggle">{{ faq.isOpen ? '−' : '+' }}</span>
        </div>
        <div v-if="faq.isOpen" class="faq-answer">
          <p>{{ faq.answer }}</p>
        </div>
      </div>
      <button @click="showFAQs = false" class="close-btn">Close FAQs</button>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContact" class="modal-overlay" @click="closeContactModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Contact Support</h2>
          <button @click="closeContactModal" class="close-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="contact-info">
            <div class="contact-item">
              <h3>Email</h3>
              <p>
                <a href="mailto:awinomillie22@gmail.com" class="contact-link">
                  awinomillie22@gmail.com
                </a>
              </p>
            </div>
            <div class="contact-item">
              <h3>Phone</h3>
              <p>
                <a href="tel:+254702685789" class="contact-link">
                  +254 702 685789
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive variables
const showFAQs = ref(false)
const showContact = ref(false)

// FAQs data
const faqs = ref([
  {
    question: "What is the Geometry Learning System?",
    answer: "Our Geometry Learning System is an interactive educational platform designed to help students understand geometric concepts through visual learning, step-by-step tutorials, and practice exercises.",
    isOpen: false
  },
  {
    question: "How do I get started with learning geometry?",
    answer: "Start with the basic concepts like points, lines, and angles. Use our interactive tutorials and practice with simple shapes before moving to more complex geometric theorems and proofs.",
    isOpen: false
  },
  {
    question: "What topics are covered in the geometry curriculum?",
    answer: "We cover fundamental topics including: basic geometric shapes, angles and their properties, triangles and quadrilaterals, circles, area and perimeter calculations, coordinate geometry, and geometric proofs.",
    isOpen: false
  },
  {
    question: "Can I track my learning progress?",
    answer: "Yes! Our system tracks your progress through different geometry topics, shows your quiz scores, and provides personalized recommendations for areas that need improvement.",
    isOpen: false
  },
  {
    question: "Are there practice exercises available?",
    answer: "Absolutely! We offer interactive practice problems, quizzes, and real-world applications for each geometry topic to help reinforce your learning.",
    isOpen: false
  },
  {
    question: "How do I use the geometric tools and calculators?",
    answer: "Our built-in tools include protractors, compasses, and calculators. Simply select the tool you need from the toolbar and follow the on-screen instructions for measurements and constructions.",
    isOpen: false
  },
  {
    question: "What if I'm struggling with a particular concept?",
    answer: "Don't worry! You can rewatch video tutorials, access additional practice problems, or contact our support team for personalized help with challenging concepts.",
    isOpen: false
  },
  {
    question: "Is the content suitable for different grade levels?",
    answer: "Yes, our content is designed for various levels from middle school to high school geometry, with clear progression paths and difficulty indicators for each topic.",
    isOpen: false
  }
])

// Methods
const toggleFAQs = () => {
  showFAQs.value = !showFAQs.value
}

const toggleFAQ = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}

const showContactModal = () => {
  showContact.value = true
}

const closeContactModal = () => {
  showContact.value = false
}

const openVideoTutorials = () => {
  window.open('https://www.youtube.com/watch?v=KtZai86htng&list=PL0o_zxa4K1BVkRxCZubMPcCJ5Q5QwZdEM', '_blank')
}

const downloadPDF = () => {
  const link = document.createElement('a')
  link.href = '/assets/downloadable.pdf'
  link.download = 'downloadable.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
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
  transition: all 0.3s ease;
}

.resource-item.clickable {
  cursor: pointer;
}

.resource-item.clickable:hover {
  background-color: #e8f4f8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.resource-item h3 {
  margin-top: 0;
  color: #4a6cf7;
}

.resource-item p {
  color: #666;
  margin-bottom: 0;
}

/* FAQs Section */
.faqs-section {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.faq-item {
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
}

.faq-question:hover {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.faq-question h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.faq-toggle {
  font-size: 20px;
  font-weight: bold;
  color: #4a6cf7;
}

.faq-answer {
  padding: 10px 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.close-btn {
  background-color: #4a6cf7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.close-btn:hover {
  background-color: #3a5ae0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-modal:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.contact-item p {
  margin: 0;
}

.contact-link {
  color: #4a6cf7;
  text-decoration: none;
  font-weight: 500;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .resource-sections {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .contact-info {
    gap: 15px;
  }
}
</style>