<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AppMenuItem from './AppMenuItem.vue';

// Get access to the store and router
const store = useStore();
const router = useRouter();

// Logout function
const logout = async () => {
  try {
    await store.dispatch('auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    router.push('/auth/login');
  }
};

// Define all menu items with their role requirements
const allMenuItems = [
    {
        label: 'Dashboard',
        items: [
            { 
                label: 'Overview', 
                icon: 'pi pi-fw pi-home', 
                to: '/dashboard',
                roles: ['Admin', 'Teacher', 'Staff']
            },
            {
                label: 'Profile', 
                icon: 'pi pi-user', 
                to: '/profile',
                roles: ['Admin', 'Teacher', 'Staff']
            },
            // { 
            //     label: 'Analytics', 
            //     icon: 'pi pi-fw pi-chart-line', 
            //     to: '/analytics',
            //     roles: ['Admin'] // Admin only
            // }
        ]
    },
    {
      label: 'Users',
      items: [
          { 
              label: 'Manage Users', 
              icon: 'pi pi-fw pi-users', 
              to: '/users',
              roles: ['Admin', 'Staff']
          },
          // { 
          //     label: 'Add User', 
          //     icon: 'pi pi-fw pi-user-plus', 
          //     to: '/users/add',
          //     roles: ['Admin'] // Admin only
          // },
          // { 
          //     label: 'User Roles', 
          //     icon: 'pi pi-fw pi-shield', 
          //     to: '/users/roles',
          //     roles: ['Admin'] // Admin only
          // }
      ]
    },
    {
        label: 'Students',
        items: [
            { 
                label: 'All Students', 
                icon: 'pi pi-fw pi-users', 
                to: '/students',
                roles: ['Admin', 'Staff']
            },
            // { 
            //     label: 'My Students', 
            //     icon: 'pi pi-fw pi-users', 
            //     to: '/my-students',
            //     roles: ['Teacher']
            // },
            { 
                label: 'Add Student', 
                icon: 'pi pi-fw pi-user-plus', 
                to: '/students/add',
                roles: ['Admin'] // Admin only
            },
            { 
                label: 'Bulk Import', 
                icon: 'pi pi-fw pi-upload', 
                to: '/students/import',
                roles: ['Admin'] // Admin only
            },
            { 
                label: 'Student Promotion', 
                icon: 'pi pi-fw pi-arrow-up', 
                to: '/students/promotion',
                roles: ['Admin'] // Admin only
            },
            { 
                label: 'Archived Students', 
                icon: 'pi pi-fw pi-save', 
                to: '/students/archived',
                roles: ['Admin', 'Staff'] // Admin and Staff only
            }
        ]
    },
    {
        label: 'Academic',
        items: [
            { 
                label: 'Grades/Classes', 
                icon: 'pi pi-fw pi-building', 
                to: '/grades',
                roles: ['Admin', 'Staff']
            },
            { 
                label: 'Subjects', 
                icon: 'pi pi-fw pi-book', 
                to: '/subjects',
                roles: ['Admin']
            },
            { 
                label: 'Teacher Assignments', 
                icon: 'pi pi-fw pi-user-edit', 
                to: '/teacher-subject/assignments',
                roles: ['Admin'] // Admin only
            },
            {
              label: 'Subject Assignments',
              icon: 'pi pi-fw pi-calendar',
              to: '/subject-grade/assignments',
              roles: ['Admin'] // Admin, Teacher, and Staff
            }
        ]
    },
    {
        label: 'Exams',
        items: [
            { 
                label: 'Marks Entry', 
                icon: 'pi pi-fw pi-pencil', 
                to: '/scores/entry',
                roles: ['Admin','Teacher'] // Teachers only
            },
            // { 
            //     label: 'Grade Books', 
            //     icon: 'pi pi-fw pi-table', 
            //     to: '/gradebooks',
            //     roles: ['Admin', 'Teacher'] // Admin and Teachers
            // },
            // { 
            //     label: 'My Assignments', 
            //     icon: 'pi pi-fw pi-list-check', 
            //     to: '/exams/teacher/assignments',
            //     roles: ['Teacher'] // Teachers only - to see their assigned subjects
            // },
            { 
                label: 'Exam Types', 
                icon: 'pi pi-fw pi-list', 
                to: '/manage-exams',
                roles: ['Admin'] // Admin only
            },
            { 
                label: 'Academic Years', 
                icon: 'pi pi-fw pi-list', 
                to: '/manage-years',
                roles: ['Admin'] // Admin only
            },
        ]
    },
    {
        label: 'Reports',
        items: [
            { 
                label: 'Report Cards', 
                icon: 'pi pi-fw pi-file-pdf', 
                to: '/report-cards',
                roles: ['Admin'] // Admin only - can generate reports
            }
            // { 
            //     label: 'View Report Cards', 
            //     icon: 'pi pi-fw pi-eye', 
            //     to: '/reports/cards/history',
            //     roles: ['Admin', 'Staff'] // All can view
            // },
            // { 
            //     label: 'Academic Reports', 
            //     icon: 'pi pi-fw pi-chart-bar', 
            //     to: '/reports/academic',
            //     roles: ['Admin'] // Admin only
            // },
            // { 
            //     label: 'Performance Analysis', 
            //     icon: 'pi pi-fw pi-chart-pie', 
            //     to: '/reports/performance',
            //     roles: ['Admin'] // Admin and Teachers
            // }
        ]
    },
    // {
    //     label: 'Administration',
    //     roles: ['Admin'], // Entire section for Admin only
    //     items: [
    //         { 
    //             label: 'Users', 
    //             icon: 'pi pi-fw pi-users', 
    //             to: '/admin/users',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'Academic Years', 
    //             icon: 'pi pi-fw pi-calendar', 
    //             to: '/admin/academic-years',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'Year-End Operations', 
    //             icon: 'pi pi-fw pi-sync', 
    //             to: '/admin/year-end',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'System Settings', 
    //             icon: 'pi pi-fw pi-cog', 
    //             to: '/admin/settings',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'Security Settings', 
    //             icon: 'pi pi-fw pi-shield', 
    //             to: '/admin/security',
    //             roles: ['Admin']
    //         }
    //     ]
    // },
    // {
    //     label: 'Data Management',
    //     roles: ['Admin'], // Entire section for Admin only
    //     items: [
    //         { 
    //             label: 'Bulk Import', 
    //             icon: 'pi pi-fw pi-upload', 
    //             to: '/data/import',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'Data Export', 
    //             icon: 'pi pi-fw pi-download', 
    //             to: '/data/export',
    //             roles: ['Admin']
    //         },
    //         { 
    //             label: 'Backup Management', 
    //             icon: 'pi pi-fw pi-save', 
    //             to: '/data/backup',
    //             roles: ['Admin']
    //         }
    //     ]
    // },
    // {
    //     label: 'Help & Support',
    //     items: [
    //         { 
    //             label: 'User Guide', 
    //             icon: 'pi pi-fw pi-question-circle', 
    //             to: '/help',
    //             roles: ['Admin', 'Teacher', 'Staff']
    //         },
    //         { 
    //             label: 'FAQ', 
    //             icon: 'pi pi-fw pi-info-circle', 
    //             to: '/help/faq',
    //             roles: ['Admin', 'Teacher', 'Staff']
    //         },
    //         { 
    //             label: 'About', 
    //             icon: 'pi pi-fw pi-info', 
    //             to: '/about',
    //             roles: ['Admin', 'Teacher', 'Staff']
    //         }
    //     ]
    // }
];

// Check if user is authenticated
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

// Get current user info
const currentUser = computed(() => store.getters['auth/user']);
const userRoles = computed(() => store.getters['auth/userRoles']);

// Helper function to check if user has any of the required roles
const hasAnyRole = (requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return store.getters['auth/hasAnyRole'](requiredRoles);
};

// Create a computed property that filters menu items based on user's roles
const model = computed(() => {
  // If not authenticated, show minimal menu or login option
  if (!isAuthenticated.value) {
    return [
      {
        label: 'Menu',
        items: [
          { label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/auth/login' }
        ]
      }
    ];
  }

  // Filter menu sections and items based on user role
  const filteredMenuItems = allMenuItems
    .map(section => {
      // Check if entire section should be shown
      if (section.roles && !hasAnyRole(section.roles)) {
        return null;
      }

      // Filter items within the section
      const filteredItems = section.items.filter(item => {
        return hasAnyRole(item.roles);
      });

      // Only return section if it has visible items
      if (filteredItems.length > 0) {
        return {
          ...section,
          items: filteredItems
        };
      }

      return null;
    })
    .filter(section => section !== null);

  // Add logout item for all authenticated users
  filteredMenuItems.push({
    items: [{ 
      label: 'Logout', 
      icon: 'pi pi-fw pi-sign-out', 
      command: logout
    }]
  });

  return filteredMenuItems;
});

// Get current user info for display
const userDisplayInfo = computed(() => {
  if (!currentUser.value) return null;
  
  // Get user role - handle both array and string format
  const roles = userRoles.value;
  const displayRole = Array.isArray(roles) && roles.length > 0 
    ? roles[0] 
    : currentUser.value.role || 'User';
  
  return {
    name: currentUser.value.fullName || store.getters['auth/userName'] || currentUser.value.username,
    role: displayRole,
    email: store.getters['auth/userEmail'] || currentUser.value.email
  };
});
</script>

<template>
  <div>
    <!-- User info display -->
    <div v-if="isAuthenticated && userDisplayInfo" class="user-info-card">
      <div class="user-avatar">
        <i class="pi pi-user"></i>
      </div>
      <div class="user-details">
        <div class="user-name">{{ userDisplayInfo.name }}</div>
        <div class="user-role">{{ userDisplayInfo.role }}</div>
      </div>
    </div>
    
    <!-- Role-based menu -->
    <ul class="layout-menu">
      <template v-for="(item, i) in model" :key="i">
        <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
        <li v-if="item.separator" class="menu-separator"></li>
      </template>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.user-info-card {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    
    i {
      font-size: 18px;
    }
  }

  .user-details {
    flex: 1;
    
    .user-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .user-role {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.layout-menu {
  margin-top: 8px;
}
</style>