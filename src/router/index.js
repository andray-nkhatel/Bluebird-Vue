import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guard/auth.guard';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    meta:{
                        requiresAuth: true,
                    },
                    component: () => import('@/views/pages/Dashboard.vue')
                },
                {   path: '/profile',
                    name: 'profile',
                    meta:{
                        requiresAuth: true,
                    },
                    component: () => import('@/views/pages/Profile.vue')
                },
             
                
              
                
        ],


        },
    
    ]
});


router.beforeEach(authGuard);
export default router;
