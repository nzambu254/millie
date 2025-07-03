<template>
  <div class="diagram-wrapper">
    <h2>3D Geometry Diagrams</h2>
    <p>Interact with and learn about basic 3D geometric shapes</p>

    <div class="shape-grid">
      <div class="shape-card" v-for="(shape, index) in shapes" :key="index">
        <canvas :ref="el => shapeRefs[index] = el" width="200" height="200"></canvas>
        <h3>{{ shape.name }}</h3>
        <p>{{ shape.description }}</p>
        <div class="shape-details">
          <p><strong>Key Property:</strong> {{ shape.property }}</p>
          <p><strong>Real-World Example:</strong> {{ shape.example }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Zdog from 'zdog'

const shapes = [
  {
    name: 'Cube',
    description: 'A 3D shape with 6 equal square faces.',
    property: 'All faces, edges, and angles are equal (90°). 11 distinct nets can form a cube.',
    example: 'Dice, sugar cubes, Rubik\'s Cube',
    draw: (illo) => {
      new Zdog.Box({
        addTo: illo,
        width: 60,
        height: 60,
        depth: 60,
        stroke: false,
        color: '#E62',
        leftFace: '#EA0',
        rightFace: '#ED0',
        topFace: '#636',
        bottomFace: '#C25',
      })
    }
  },
  {
    name: 'Cuboid',
    description: 'A rectangular box with length, width, and height.',
    property: 'Opposite faces are equal rectangles. Diagonal length = √(l²+w²+h²).',
    example: 'Bricks, books, smartphones',
    draw: (illo) => {
      new Zdog.Box({
        addTo: illo,
        width: 90,
        height: 50,
        depth: 70,
        stroke: false,
        color: '#3498db',
        leftFace: '#2980b9',
        rightFace: '#2980b9',
        topFace: '#1f618d',
        bottomFace: '#2471a3',
      })
    }
  },
  {
    name: 'Sphere',
    description: 'A perfectly round 3D object like a ball.',
    property: 'All surface points equidistant from center. Has the smallest surface area for given volume.',
    example: 'Planets, bubbles, ball bearings',
    draw: (illo) => {
      new Zdog.Shape({
        addTo: illo,
        stroke: 80,
        color: '#1abc9c'
      })
    }
  },
  {
    name: 'Cone',
    description: 'A shape with a circular base and a pointed top.',
    property: 'Volume = (1/3)πr²h. Conic sections produce circles, ellipses, parabolas, and hyperbolas.',
    example: 'Volcanoes, traffic cones, party hats',
    draw: (illo) => {
      new Zdog.Cone({
        addTo: illo,
        diameter: 60,
        length: 80,
        stroke: false,
        color: '#9b59b6'
      })
    }
  },
  {
    name: 'Cylinder',
    description: 'A shape with two parallel circular bases connected by a curved surface.',
    property: 'Volume = πr²h. Develops into a rectangle when "unrolled".',
    example: 'Cans, pipes, columns',
    draw: (illo) => {
      new Zdog.Cylinder({
        addTo: illo,
        diameter: 50,
        length: 80,
        stroke: false,
        color: '#f39c12',
        backface: '#e67e22'
      })
    }
  },
  {
    name: 'Pyramid',
    description: 'A shape with a polygon base and triangular faces that meet at a point.',
    property: 'Volume = (1/3) × Base Area × Height. The dual of a cube is an octahedron.',
    example: 'Egyptian pyramids, roof structures',
    draw: (illo) => {
      new Zdog.Shape({
        addTo: illo,
        path: [
          { x: 0, y: -40 },
          { x: -30, y: 40 },
          { x: 30, y: 40 },
        ],
        closed: true,
        stroke: 20,
        color: '#ff4757',
        rotate: { x: 0.5, y: 0.5 },
      })
    }
  }
]

const shapeRefs = ref([])

onMounted(() => {
  shapes.forEach((shape, index) => {
    const canvas = shapeRefs.value[index]
    if (!canvas) return

    const illo = new Zdog.Illustration({
      element: canvas,
      dragRotate: true,
      zoom: 1.2,
      rotate: { x: -Zdog.TAU / 8, y: Zdog.TAU / 8 },
    })

    shape.draw(illo)

    function animate() {
      illo.updateRenderGraph()
      requestAnimationFrame(animate)
    }
    animate()
  })
})
</script>

<style scoped>
.diagram-wrapper {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.shape-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.shape-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.shape-card canvas {
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 15px;
  background: #f9f9f9;
}

.shape-card h3 {
  margin: 10px 0 8px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.shape-card p {
  font-size: 0.95rem;
  color: #555;
  margin: 5px 0;
  line-height: 1.4;
}

.shape-details {
  margin-top: 10px;
  text-align: left;
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.shape-details p {
  font-size: 0.85rem;
  margin: 5px 0;
}

.shape-details strong {
  color: #2c3e50;
}
</style>