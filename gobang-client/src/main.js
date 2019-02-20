// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import Toast from '@/components/Toast';
import '@/style/common/index.scss';

// Vue.config.productionTip = false

const ToastConstructor = Vue.extend(Toast);
Vue.prototype.$toast = function(data) {
  document.body.appendChild(new ToastConstructor({
  	el: document.createElement('div'),
    propsData: data
  }).$el);
};

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
