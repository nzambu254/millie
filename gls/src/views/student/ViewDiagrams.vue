<template>
  <div class="diagram-wrapper">
    <h2>3D Geometry Diagrams</h2>
    <p>Interact with and learn about basic 3D geometric shapes</p>

    <div class="shape-grid">
      <div class="shape-card" v-for="(shape, index) in shapes" :key="index">
        <canvas :ref="el => shapeRefs[index] = el" width="200" height="200"></canvas>
        <h3>{{ shape.name }}</h3>
        <p>{{ shape.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Zdog from 'zdog'

// Define your shapes with name, description, and draw method
const shapes = [
  {
    name: 'Cube',
    description: 'A 3D shape with 6 equal square faces.',
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

// Refs for canvases
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
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.shape-card {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shape-card canvas {
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 10px;
}

.shape-card h3 {
  margin: 10px 0 5px;
  color: #2c3e50;
}

.shape-card p {
  font-size: 0.9rem;
  color: #555;
}
</style>
