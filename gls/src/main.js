import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import VueKonva from 'vue-konva'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueKonva);
app.mount('#app');