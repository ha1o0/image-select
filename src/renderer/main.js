import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import Global from './utils/Global'
Vue.use(ElementUI)
window.EventBus = new Vue()
Vue.prototype.$global = Global
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: { App },
    template: '<App/>'
}).$mount('#app')