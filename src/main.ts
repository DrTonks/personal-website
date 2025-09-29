import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './routes'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/tailwind.css'
import './assets/index.css'

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(router);
app.use(ElementPlus);

app.mount('#app');
