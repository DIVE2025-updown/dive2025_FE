import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/layout/Dashboard.vue';
import Map from '@/views/Map.vue';
import Apply from '@/views/Apply.vue';
import Stats from '@/views/Stats.vue';
import Mypage from '@/views/Mypage.vue';
import Landing from '@/views/Landing.vue';
import Apply2 from '@/views/Apply2.vue';
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
                    path: 'landing',
                    name: 'landing',
                    component: Landing,
                },
                {
                    path: 'apply2',
                    name: 'apply2',
                    component: Apply2,
                },
            ],
        },
    ],
});

export default router;
