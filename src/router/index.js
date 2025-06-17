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
                {   path: '/students',
                    name: 'students',
                    meta:{
                        requiresAuth: true,
                    },
                    component: () => import('@/views/students/StudentVue.vue')
                },
                {
                    path: '/users',
                    name: 'users',
                    meta: {
                        requiresAuth: true,
                        // roles: ['admin']
                    },
                    component: () => import('../views/pages/Users.vue')
                },
                {
                    path: '/add-students',
                    name: 'AddStudent',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/students/CreateStudent.vue')
                },
                {
                    path: '/students/import',
                    name: 'AddBulkStudent',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/students/StudentImportCsv.vue')
                },
                {
                    path: '/students/promotion',
                    name: 'PromoteStudent',
                 
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/students/PromoteStudents.vue')
                },
                {
                    path: '/students/archived',
                    name: 'ArchiveStudent',
                 
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/students/ArchiveStudent.vue')
                },
                {
                    path: '/grades',
                    name: 'GradeList',
                 
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/classes/GradeList.vue')
                },
                {
                    path: '/subjects',
                    name: 'SubjectList',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/subjects/SubjectList.vue')
                },
                {
                    path: '/subject-grade/assignments',
                    name: 'AssignSubjectToGrade',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/subjects/AssignSubjectToGrade.vue')
                },
                {
                    path: '/teacher-subject/assignments',
                    name: 'AssignTeacherToSubject',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/subjects/AssignTeacherToSubject.vue')
                },
                {
                    path: '/scores/entry',
                    name: 'ScoresEntry',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/exams/ScoresEntry.vue')
                },
                {
                    path: '/manage-exams',
                    name: 'ManageExams',
                    meta: {
                        requiresAuth: true,
                    },
                    component: () => import('@/views/exams/ExamType.vue')
                },
               {
                path: '/manage-years',
                name: 'ManageYears',
                meta: {
                    requiresAuth: true,
                },
                component: () => import('@/views/years/AcademicYears.vue')

               },
               {
                path: '/report-cards',
                name: 'ReportCards',
                meta: {
                    requiresAuth: true,
                },
                component: () => import('@/views/report/ReportCard.vue')

               }
             
             
             
             
             
             
                
              
                
        ],


        },
    
    ]
});


router.beforeEach(authGuard);
export default router;
