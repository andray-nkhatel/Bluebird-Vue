<script lang="ts" setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { authService } from '../../service/api.service';

// Utilities
const toast = useToast();

// Reactive data
const loading = ref(false);
const profileData = ref({
  id: null,
  username: '',
  fullName: '',
  email: '',
  role: '',
  isActive: true,
  createdAt: '',
  lastLoginAt: ''
});

// Computed properties
const formattedCreatedAt = computed(() => {
  if (!profileData.value.createdAt) return 'N/A';
  return new Date(profileData.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const formattedLastLogin = computed(() => {
  if (!profileData.value.lastLoginAt) return 'Never';
  return new Date(profileData.value.lastLoginAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const roleIcon = computed(() => {
  switch (profileData.value.role) {
    case 'Admin': return 'pi-crown';
    case 'Teacher': return 'pi-graduation-cap';
    case 'Staff': return 'pi-users';
    default: return 'pi-user';
  }
});

const roleColor = computed(() => {
  switch (profileData.value.role) {
    case 'Admin': return 'bg-red-100 text-red-800';
    case 'Teacher': return 'bg-blue-100 text-blue-800';
    case 'Staff': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
});

// Methods
const loadProfile = async () => {
  loading.value = true;
  try {
    const data = await authService.getProfile();
    profileData.value = data;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load profile data',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const refreshProfile = async () => {
  await loadProfile();
  toast.add({
    severity: 'info',
    summary: 'Refreshed',
    detail: 'Profile data refreshed',
    life: 2000
  });
};

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="text-2xl font-bold text-900 m-0">User Profile</h2>
            <p class="text-600 mt-1 mb-0">View your account information</p>
          </div>
          <div class="flex gap-2 ml-auto">
            <Button 
              icon="pi pi-refresh" 
              outlined 
              @click="refreshProfile"
              :loading="loading"
              v-tooltip.top="'Refresh Profile'"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !profileData.id" class="flex justify-content-center py-8">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3" />
        </div>

        <!-- Profile Content -->
        <div v-else class="grid">
          <!-- Profile Card -->
          <div class="col-12 lg:col-8">
            <Card>
              <template #title>
                <div class="flex align-items-center gap-3">
                  <Avatar 
                    :label="profileData.fullName?.charAt(0) || 'U'" 
                    size="xlarge" 
                    class="text-white font-bold"
                    :style="{ backgroundColor: profileData.role === 'Admin' ? '#ef4444' : profileData.role === 'Teacher' ? '#3b82f6' : '#10b981' }"
                  />
                  <div>
                    <h3 class="text-xl font-bold m-0">{{ profileData.fullName }}</h3>
                    <div class="flex align-items-center gap-2 mt-1">
                      <Tag 
                        :class="roleColor"
                        :icon="`pi ${roleIcon}`"
                      >
                        {{ profileData.role }}
                      </Tag>
                      <Tag 
                        v-if="profileData.isActive" 
                        severity="success" 
                        value="Active"
                      />
                      <Tag 
                        v-else 
                        severity="danger" 
                        value="Inactive"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template #content>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Full Name</label>
                      <p class="text-700 mt-1">{{ profileData.fullName || 'Not provided' }}</p>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Username</label>
                      <p class="text-700 mt-1">{{ profileData.username }}</p>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Email Address</label>
                      <p class="text-700 mt-1">{{ profileData.email || 'Not provided' }}</p>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Role</label>
                      <p class="text-700 mt-1">{{ profileData.role }}</p>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Account Created</label>
                      <p class="text-700 mt-1">{{ formattedCreatedAt }}</p>
                    </div>
                  </div>
                  
                  <div class="col-12 md:col-6">
                    <div class="field">
                      <label class="font-semibold text-900">Last Login</label>
                      <p class="text-700 mt-1">{{ formattedLastLogin }}</p>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Quick Stats -->
          <div class="col-12 lg:col-4">
            <Card class="mt-3" >
              <template #title>
                <h4 class="m-0">Account Information</h4>
              </template>
              
              <template #content>
                <div class="flex flex-column gap-3">
                  <div class="flex align-items-center justify-content-between p-3 border-round" style="background: var(--surface-50)">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-id-card text-primary"></i>
                      <span class="font-medium">User ID</span>
                    </div>
                    <span class="font-bold">#{{ profileData.id }}</span>
                  </div>
                  
                  <div class="flex align-items-center justify-content-between p-3 border-round" style="background: var(--surface-50)">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-shield text-primary"></i>
                      <span class="font-medium">Account Status</span>
                    </div>
                    <Tag 
                      :severity="profileData.isActive ? 'success' : 'danger'"
                      :value="profileData.isActive ? 'Active' : 'Inactive'"
                    />
                  </div>
                  
                  <div class="flex align-items-center justify-content-between p-3 border-round" style="background: var(--surface-50)">
                    <div class="flex align-items-center gap-2">
                      <i :class="`pi ${roleIcon} text-primary`"></i>
                      <span class="font-medium">Access Level</span>
                    </div>
                    <span class="font-bold">{{ profileData.role }}</span>
                  </div>
                </div>
              </template>
            </Card>

            <!-- Additional Info Card -->
            <Card class="mt-3">
              <template #title>
                <h4 class="m-0">Session Information</h4>
              </template>
              
              <template #content>
                <div class="flex flex-column gap-3">
                  <div class="text-center">
                    <i class="pi pi-clock text-primary text-3xl mb-2"></i>
                    <p class="text-600 text-sm m-0">Last Login</p>
                    <p class="font-bold text-900 mt-1">{{ formattedLastLogin }}</p>
                  </div>
                  
                  <Divider />
                  
                  <div class="text-center">
                    <i class="pi pi-calendar text-primary text-3xl mb-2"></i>
                    <p class="text-600 text-sm m-0">Member Since</p>
                    <p class="font-bold text-900 mt-1">{{ formattedCreatedAt }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
}
</style>