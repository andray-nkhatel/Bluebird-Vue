<template>
    <div class="subject-list">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="text-2xl font-semibold text-900 m-0">Subjects</h2>
          <div class="flex gap-2 ml-auto">
            <Button 
              :label="includeInactive ? 'Hide Inactive' : 'Show Inactive'" 
              :icon="includeInactive ? 'pi pi-eye-slash' : 'pi pi-eye'"
              @click="toggleInactive"
              :outlined="!includeInactive"
            />
            <Button 
              label="Add Subject" 
              icon="pi pi-plus" 
              @click="$emit('addSubject')"
            />
            <Button 
              label="Refresh" 
              icon="pi pi-refresh" 
              @click="loadSubjects"
              outlined
            />
          </div>
        </div>
  
        <!-- Statistics Cards -->
        <div class="grid mb-4">
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ statistics.total }}</div>
              <div class="text-sm text-600">Total Subjects</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-green-600">{{ statistics.active }}</div>
              <div class="text-sm text-600">Active Subjects</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ statistics.inactive }}</div>
              <div class="text-sm text-600">Inactive Subjects</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ statistics.withDescription }}</div>
              <div class="text-sm text-600">With Description</div>
            </div>
          </div>
        </div>
  
        <!-- Subject Cards View -->
        <div v-if="viewMode === 'cards'" class="mb-4">
          <div class="grid">
            <div 
              v-for="subject in filteredSubjects" 
              :key="subject.id"
              class="col-12 sm:col-6 md:col-4 lg:col-3"
            >
              <div 
                class="subject-card surface-card border-round p-4 h-full cursor-pointer transition-all transition-duration-200"
                :class="{ 'opacity-60': !subject.isActive }"
                @click="viewSubject(subject)"
              >
                <div class="flex justify-content-between align-items-start mb-3">
                  <div class="flex align-items-center gap-2">
                    <Avatar 
                      :label="getSubjectInitials(subject.name)" 
                      size="large"
                      :style="{ backgroundColor: getSubjectColor(subject.code), color: 'white' }"
                    />
                    <Tag 
                      :value="subject.isActive ? 'Active' : 'Inactive'" 
                      :severity="subject.isActive ? 'success' : 'danger'"
                      class="text-xs"
                    />
                  </div>
                  <div class="flex gap-1">
                    <Button 
                      icon="pi pi-pencil" 
                      @click.stop="editSubject(subject)"
                      size="small"
                      text
                      rounded
                      v-tooltip.top="'Edit Subject'"
                    />
                    <Button 
                      :icon="subject.isActive ? 'pi pi-ban' : 'pi pi-check'" 
                      @click.stop="toggleSubjectStatus(subject)"
                      size="small"
                      text
                      rounded
                      :severity="subject.isActive ? 'danger' : 'success'"
                      :v-tooltip.top="subject.isActive ? 'Deactivate' : 'Activate'"
                    />
                  </div>
                </div>
                
                <h4 class="font-medium text-900 mb-2">{{ subject.name }}</h4>
                <div class="mb-2">
                  <Tag :value="subject.code" severity="info" class="text-xs" />
                </div>
                <p class="text-sm text-600 line-height-3 mb-0">
                  {{ subject.description || 'No description available' }}
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Subject Table View -->
        <div v-else>
          <!-- View Mode Toggle -->
          <div class="flex justify-content-between align-items-center mb-3">
            <div class="flex gap-2 ml-auto">
              <Button 
                label="Cards" 
                icon="pi pi-th-large"
                @click="viewMode = 'cards'"
                :outlined="viewMode !== 'cards'"
                size="small"
              />
              <Button 
                label="Table" 
                icon="pi pi-table"
                @click="viewMode = 'table'"
                :outlined="viewMode !== 'table'"
                size="small"
              />
            </div>
            <span class="p-input-icon-left">
              <!-- <i class="pi pi-search" /> -->
              <InputText 
                v-model="globalFilter" 
                placeholder="Search subjects..." 
                class="w-20rem ml-2"
              />
            </span>
          </div>
  
          <DataTable 
            :value="filteredSubjects" 
            :loading="loading"
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :globalFilterFields="['name', 'code', 'description']"
            :sortField="sortField"
            :sortOrder="sortOrder"
            showGridlines
            stripedRows
            responsiveLayout="scroll"
            filterDisplay="menu"
            v-model:globalFilter="globalFilter"
            class="p-datatable-sm"
            :rowClass="getRowClass"
          >
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <span class="text-xl font-semibold">
                  {{ filteredSubjects.length }} subject{{ filteredSubjects.length !== 1 ? 's' : '' }} found
                </span>
              </div>
            </template>
  
            <Column style="width: 60px">
              <template #body="{ data }">
                <Avatar 
                  :label="getSubjectInitials(data.name)" 
                  size="normal"
                  :style="{ backgroundColor: getSubjectColor(data.code), color: 'white' }"
                />
              </template>
            </Column>
  
            <Column field="name" header="Subject Name" sortable style="min-width: 200px">
              <template #body="{ data }">
                <div class="flex flex-column gap-1">
                  <span class="font-medium text-900">{{ data.name }}</span>
                  <Tag :value="data.code" severity="info" class="text-xs w-fit" />
                </div>
              </template>
            </Column>
  
            <Column field="code" header="Code" sortable style="width: 100px">
              <template #body="{ data }">
                <Tag :value="data.code" severity="secondary" />
              </template>
            </Column>
  
            <Column field="description" header="Description" style="min-width: 300px">
              <template #body="{ data }">
                <span class="text-600">
                  {{ data.description || 'No description available' }}
                </span>
              </template>
            </Column>
  
            <Column field="isActive" header="Status" sortable style="width: 100px">
              <template #body="{ data }">
                <Tag 
                  :value="data.isActive ? 'Active' : 'Inactive'" 
                  :severity="data.isActive ? 'success' : 'danger'"
                />
              </template>
            </Column>
  
            <Column header="Actions" style="width: 150px">
              <template #body="{ data }">
                <div class="flex gap-1">
                  <Button 
                    icon="pi pi-eye" 
                    @click="viewSubject(data)"
                    size="small"
                    outlined
                    severity="info"
                    v-tooltip.top="'View Details'"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    @click="editSubject(data)"
                    size="small"
                    outlined
                    v-tooltip.top="'Edit Subject'"
                  />
                  <Button 
                    :icon="data.isActive ? 'pi pi-ban' : 'pi pi-check'" 
                    @click="toggleSubjectStatus(data)"
                    size="small"
                    outlined
                    :severity="data.isActive ? 'danger' : 'success'"
                    :v-tooltip.top="data.isActive ? 'Deactivate' : 'Activate'"
                  />
                </div>
              </template>
            </Column>
  
            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-book text-4xl text-400"></i>
                <p class="text-500 mt-2">No subjects found</p>
              </div>
            </template>
          </DataTable>
        </div>
  
        <!-- View Mode Toggle for Cards View -->
        <div v-if="viewMode === 'cards'" class="flex justify-content-center mt-4">
          <div class="flex gap-2">
            <Button 
              label="Cards" 
              icon="pi pi-th-large"
              @click="viewMode = 'cards'"
              :outlined="viewMode !== 'cards'"
              size="small"
            />
            <Button 
              label="Table" 
              icon="pi pi-table"
              @click="viewMode = 'table'"
              :outlined="viewMode !== 'table'"
              size="small"
            />
          </div>
        </div>
      </div>
  
      <!-- Subject Details Dialog -->
      <Dialog 
        v-model:visible="showDetailsDialog" 
        modal 
        header="Subject Details"
        :style="{ width: '500px' }"
      >
        <div v-if="selectedSubject" class="subject-details">
          <div class="text-center mb-4">
            <Avatar 
              :label="getSubjectInitials(selectedSubject.name)" 
              size="xlarge"
              :style="{ backgroundColor: getSubjectColor(selectedSubject.code), color: 'white' }"
              class="mb-3"
            />
            <h3 class="text-900 font-medium mb-2">{{ selectedSubject.name }}</h3>
            <Tag 
              :value="selectedSubject.isActive ? 'Active' : 'Inactive'" 
              :severity="selectedSubject.isActive ? 'success' : 'danger'"
            />
          </div>
  
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-medium text-900">Subject Code</label>
                <div class="text-600">{{ selectedSubject.code }}</div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-medium text-900">Subject ID</label>
                <div class="text-600">#{{ selectedSubject.id }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="field">
                <label class="font-medium text-900">Description</label>
                <div class="text-600">
                  {{ selectedSubject.description || 'No description provided' }}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <template #footer>
          <Button 
            label="Close" 
            icon="pi pi-times" 
            @click="showDetailsDialog = false"
            outlined
          />
          <Button 
            label="Edit Subject" 
            icon="pi pi-pencil" 
            @click="editSelectedSubject"
          />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { subjectService } from '@/service/api.service'; // Adjust path as needed
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
  
  // Emits
  const emit = defineEmits(['addSubject', 'editSubject', 'viewSubject'])
  
  // Toast for notifications
  const toast = useToast()
  
  // Component state
  const subjects = ref([])
  const loading = ref(false)
  const includeInactive = ref(false)
  const globalFilter = ref('')
  const sortField = ref('name')
  const sortOrder = ref(1)
  const viewMode = ref('table') // 'table' or 'cards'
  const showDetailsDialog = ref(false)
  const selectedSubject = ref(null)
  
  // Computed properties
  const filteredSubjects = computed(() => {
    let filtered = subjects.value
  
    // Filter by active status
    if (!includeInactive.value) {
      filtered = filtered.filter(subject => subject.isActive)
    }
  
    return filtered
  })
  
  const statistics = computed(() => {
    const activeSubjects = subjects.value.filter(subject => subject.isActive)
    const inactiveSubjects = subjects.value.filter(subject => !subject.isActive)
    const withDescription = subjects.value.filter(subject => subject.description && subject.description.trim())
  
    return {
      total: subjects.value.length,
      active: activeSubjects.length,
      inactive: inactiveSubjects.length,
      withDescription: withDescription.length
    }
  })
  
  // Helper methods
  const getSubjectInitials = (name) => {
    if (!name) return 'S'
    const words = name.split(' ')
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase()
  }
  
  const getSubjectColor = (code) => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ]
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }
  
  const getRowClass = (data) => {
    return {
      'opacity-60': !data.isActive
    }
  }
  
  // Data loading
  const loadSubjects = async () => {
    loading.value = true
    try {
      const data = await subjectService.getAll(includeInactive.value)
      subjects.value = data || []
    } catch (error) {
      console.error('Error loading subjects:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load subjects',
        life: 3000
      })
      subjects.value = []
    } finally {
      loading.value = false
    }
  }
  
  // Event handlers
  const toggleInactive = async () => {
    includeInactive.value = !includeInactive.value
    await loadSubjects()
  }
  
  const viewSubject = (subject) => {
    selectedSubject.value = subject
    showDetailsDialog.value = true
  }
  
  const editSubject = (subject) => {
    emit('editSubject', subject)
  }
  
  const editSelectedSubject = () => {
    showDetailsDialog.value = false
    emit('editSubject', selectedSubject.value)
  }
  
  const toggleSubjectStatus = async (subject) => {
    try {
      // This would typically call an API to toggle the status
      // await subjectService.toggleStatus(subject.id)
      
      // For now, just toggle locally and show notification
      subject.isActive = !subject.isActive
      
      toast.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Subject "${subject.name}" has been ${subject.isActive ? 'activated' : 'deactivated'}`,
        life: 3000
      })
    } catch (error) {
      console.error('Error toggling subject status:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update subject status',
        life: 3000
      })
    }
  }
  
  // Load data on component mount
  onMounted(() => {
    loadSubjects()
  })
  </script>
  
  <style scoped>
  .subject-list {
    padding: 1rem;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .subject-card {
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
  }
  
  .subject-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .subject-details .field {
    margin-bottom: 1rem;
  }
  
  .subject-details .field label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .opacity-60 {
    opacity: 0.6;
  }
  
  .w-fit {
    width: fit-content;
  }
  
  :deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
  }
  
  :deep(.p-tag) {
    font-size: 0.75rem;
  }
  
  :deep(.p-button-sm) {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  :deep(.p-avatar) {
    font-weight: bold;
  }
  </style>