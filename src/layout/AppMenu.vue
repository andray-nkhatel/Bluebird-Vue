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
                to: '/app/overview',
                roles: ['Admin', 'Staff']
            },
            { 
                label: 'My Assignments', 
                icon: 'pi pi-fw pi-list-check', 
                to: '/app/my-assignments',
                roles: ['Teacher']
            },
            {
                label: 'Profile', 
                icon: 'pi pi-user', 
                to: '/app/profile',
                roles: ['Admin', 'Teacher', 'Staff']
            },
             { 
                label: 'Class Report Cards', 
                icon: 'pi pi-fw pi-file', 
                to: '/app/teacher-reportcard',
                roles: ['Teacher']
            }
        ]
    },
    {
      label: 'Users',
      items: [
          { 
              label: 'Manage Users', 
              icon: 'pi pi-fw pi-users', 
              to: '/app/users',
              roles: ['Admin', 'Staff']
          },
      ]
    },
    {
        label: 'Students',
        items: [
            { 
                label: 'All Students', 
                icon: 'pi pi-fw pi-users', 
                to: '/app/students',
                roles: ['Admin', 'Staff']
            },
            { 
                label: 'Add Student', 
                icon: 'pi pi-fw pi-user-plus', 
                to: '/app/students/add',
                roles: ['Admin','Staff']
            },
            { 
                label: 'Bulk Import', 
                icon: 'pi pi-fw pi-upload', 
                to: '/app/students/import',
                roles: ['Admin']
            },
            { 
                label: 'Student Promotion', 
                icon: 'pi pi-fw pi-arrow-up', 
                to: '/app/students/promotion',
                roles: ['Admin','Staff']
            },
        ]
    },
    {
        label: 'Academic',
        items: [
            { 
                label: 'Classes', 
                icon: 'pi pi-fw pi-building', 
                to: '/app/grades',
                roles: ['Admin', 'Staff']
            },
            { 
                label: 'Subjects', 
                icon: 'pi pi-fw pi-book', 
                to: '/app/subjects',
                roles: ['Admin','Staff']
            },
            { 
                label: 'Teacher Assignments', 
                icon: 'pi pi-fw pi-user-edit', 
                to: '/app/teacher-subject/assignments',
                roles: ['Admin','Staff']
            },
        ]
    },
    {
        label: 'Exams',
        items: [
            { 
                label: 'Mark Entry', 
                icon: 'pi pi-fw pi-pencil', 
                to: '/app/scores/entry',
                roles: ['Teacher']
            },
            { 
                label: 'Exam Types', 
                icon: 'pi pi-fw pi-list', 
                to: '/app/manage-exams',
                roles: ['Admin']
            },
            { 
                label: 'Academic Years', 
                icon: 'pi pi-fw pi-graduation-cap', 
                to: '/app/manage-years',
                roles: ['Admin']
            },
        ]
    },
    {
        label: 'Reports',
        items: [
            { 
                label: 'Report Cards', 
                icon: 'pi pi-fw pi-file-pdf', 
                to: '/app/report-cards',
                roles: ['Admin','Staff']
            },
        ]
    },
    {
        label: 'Settings',
        items: [
            { 
                label: 'Settings', 
                icon: 'pi pi-fw pi-file-pdf', 
                to: '/app/settings/system',
                roles: ['Admin','Staff']
            },
        ]
    },
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