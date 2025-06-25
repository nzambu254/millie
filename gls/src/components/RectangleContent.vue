// RectangleContent.vue (New component for rectangle content)
<template>
  <div class="rectangle-content">
    <router-link to="/" class="back-btn">← Back to Categories</router-link>
    
    <h1>RECTANGLE</h1>
    
    <section class="definition">
      <h2>Definition</h2>
      <p>A rectangle is a closed two-dimensional figure with four sides. The opposite sides of a rectangle are equal and parallel to each other and all the angles of a rectangle are equal to 90°.</p>
      <p>A rectangle is a quadrilateral in which all the angles are equal and the opposite sides are equal and parallel.</p>
    </section>
    
    <section class="properties">
      <h2>Properties of a Rectangle</h2>
      <p>A rectangle is a closed figure which has four sides and the angle formed by adjacent sides is 90°. A rectangle can have a wide range of properties. Some of the important properties of a rectangle are given below:</p>
      <ul>
        <li>A rectangle is a quadrilateral.</li>
        <li>The opposite sides of a rectangle are equal and parallel to each other.</li>
        <li>The interior angle of a rectangle at each vertex is 90°.</li>
        <li>The sum of all interior angles is 360°.</li>
        <li>The diagonals bisect each other.</li>
        <li>The length of the diagonals is equal.</li>
        <li>The length of the diagonals can be obtained using the Pythagoras theorem. The length of the diagonal with sides a and b is, diagonal = √( a² + b²).</li>
        <li>Since the sides of a rectangle are parallel, it is also called a parallelogram.</li>
        <li>All rectangles are parallelograms but all parallelograms are not rectangles</li>
      </ul>
    </section>
    
    <section class="types">
      <h2>Types of Rectangles</h2>
      <p>A quadrilateral whose opposite sides are equal and adjacent sides meets at 90° is called a rectangle. A rectangle has two equal diagonals. The length of the diagonals is calculated by using the length and width. There are two types of rectangles:</p>
      
      <h3>Square</h3>
      <p>A square is a closed two-dimensional shape with four equal sides and four equal angles. It is a type of rectangle in which all four sides are equal. The interior angle at each vertex is 90º which satisfies the definition of the rectangle.</p>
      
      <h3>Golden Rectangle</h3>
      <p>A golden rectangle is a rectangle whose 'length to the width' ratio is similar to the golden ratio, 1: (1+√5)/2. Its sides are defined according to the golden ratio, that is, 1: 1.618. For instance, if the width is about 1 foot long then the length will be 1.168 feet long.</p>
    </section>
    
    <section class="formulas">
      <h2>Rectangle Formulas</h2>
      <p>A rectangle has a few basic formulas which can be noted in order to find the missing or unknown values. A few rectangle formulas are given below:</p>
      
      <div class="formula-box">
        <strong>Area of rectangle formula:</strong><br>
        Area of rectangle = Length × Breadth
      </div>
      
      <div class="formula-box">
        <strong>Perimeter of rectangle formula:</strong><br>
        Perimeter of rectangle = 2 (Length + Breadth)
      </div>
      
      <div class="formula-box">
        <strong>Length of rectangle formula:</strong><br>
        Length = Area of rectangle ÷ Breadth<br>
        Length = (Perimeter ÷ 2) - Breadth
      </div>
      
      <div class="formula-box">
        <strong>Breadth of rectangle formula:</strong><br>
        Breadth = Area of rectangle ÷ Length<br>
        Breadth = (Perimeter ÷ 2) - Length
      </div>
    </section>
    
    <section class="questions">
      <h2>Practice Questions</h2>
      
      <div class="question-section">
        <h3>Section A: Multiple Choice Questions (MCQs)</h3>
        
        <div class="question">
          <span class="question-number">1.</span> Which of the following is not a property of a rectangle?
          <div class="options">
            <div>a) All sides are equal</div>
            <div>b) Opposite sides are equal</div>
            <div>c) All angles are 90°</div>
            <div>d) Diagonals are equal</div>
          </div>
        </div>
        
        <div class="question">
          <span class="question-number">2.</span> The diagonals of a rectangle:
          <div class="options">
            <div>a) Are unequal</div>
            <div>b) Bisect each other</div>
            <div>c) Are perpendicular</div>
            <div>d) Do not intersect</div>
          </div>
        </div>
        
        <div class="question">
          <span class="question-number">3.</span> A square is a rectangle because:
          <div class="options">
            <div>a) It has curved sides</div>
            <div>b) It has four unequal sides</div>
            <div>c) It has four right angles and equal opposite sides</div>
            <div>d) It has four right angles and all sides equal</div>
          </div>
        </div>
      </div>
      
      <div class="question-section">
        <h3>Section B: Fill in the Blanks</h3>
        
        <div class="question">
          <span class="question-number">4.</span> A rectangle has _________ right angles.
        </div>
        
        <div class="question">
          <span class="question-number">5.</span> The formula for the area of a rectangle is _________.
        </div>
        
        <div class="question">
          <span class="question-number">6.</span> The diagonals of a rectangle are _________ in length.
        </div>
      </div>
      
      <div class="question-section">
        <h3>Section C: Short Answer Questions</h3>
        
        <div class="question">
          <span class="question-number">7.</span> Define a rectangle.
        </div>
        
        <div class="question">
          <span class="question-number">8.</span> List three properties of a rectangle.
        </div>
        
        <div class="question">
          <span class="question-number">9.</span> Is every square a rectangle? Explain why or why not.
        </div>
      </div>
      
      <div class="question-section">
        <h3>Section D: Application Problems</h3>
        
        <div class="question">
          <span class="question-number">10.</span> A rectangle has a length of 10 cm and a width of 6 cm.
          <div class="sub-questions">
            <div>(a) Find its area.</div>
            <div>(b) Find its perimeter.</div>
            <div>(c) Find the length of its diagonal.</div>
          </div>
        </div>
        
        <div class="question">
          <span class="question-number">11.</span> A rectangular playground is 25 m long and 18 m wide. How much fencing is needed to enclose it?
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.rectangle-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.back-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.back-btn:hover {
  background-color: #5a6268;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  border-bottom: 3px solid #4a6cf7;
  padding-bottom: 15px;
}

h2 {
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

h3 {
  color: #4a6cf7;
  margin-top: 25px;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

p {
  margin-bottom: 15px;
  line-height: 1.6;
  text-align: justify;
}

ul {
  margin: 15px 0 15px 30px;
}

li {
  margin-bottom: 8px;
}

.formula-box {
  background: #f8f9fa;
  padding: 15px;
  border-left: 4px solid #4a6cf7;
  margin: 15px 0;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.questions {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.question-section {
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.question-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  margin-top: 0;
}

.question {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 5px;
  border-left: 3px solid #4a6cf7;
}

.question-number {
  font-weight: bold;
  color: #4a6cf7;
}

.options {
  margin-left: 20px;
  margin-top: 8px;
}

.sub-questions {
  margin-left: 20px;
  margin-top: 8px;
}
</style>
