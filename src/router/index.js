import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/layout/Dashboard.vue';
import Map from '@/views/Map.vue';
import Apply from '@/views/Apply.vue';
import Stats from '@/views/Stats.vue';
import Mypage from '@/views/Mypage.vue';
import Landing from '@/views/Landing.vue';
import Apply2 from '@/views/Apply2.vue';
import Adopt from '@/views/Adopt.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Dashboard,
      children: [
        {
          path: '',
          redirect: 'map',
        },
        {
          path: 'map',
          name: 'map',
          component: Map,
        },
        {
          path: 'apply',
          name: 'apply',
          component: Apply,
        },
        {
          path: 'stats',
          name: 'stats',
          component: Stats,
        },
        {
          path: 'mypage',
          name: 'mypage',
          component: Mypage,
        },
        {
          path: 'apply2',
          name: 'apply2',
          component: Apply2,
        },
        {
          path: 'adopt',
          name: 'adopt',
          component: Adopt,
        },
      ],
    },
    {
      path: '/landing',
      name: 'landing',
      component: Landing,
    },
  ],
});

export default router;
