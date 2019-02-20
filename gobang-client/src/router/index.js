import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home';
import Entry from '@/pages/entry';

Vue.use(Router)

export default new Router({
  routes: [
  	{
      path: '/',
      name: 'entry',
      component: Entry
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/entry',
      name: 'entry',
      component: Entry
    }
  ]
})
