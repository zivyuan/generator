import {createApp} from 'vue';
import App from '~/App.vue';
import ElementPlus from 'element-plus';
import Store from './store/';
import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(ElementPlus);
app.use(Store);
app.mount('#app');
