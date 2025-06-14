<template>
    <div class="grade-list">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="text-2xl font-semibold text-900 m-0">Grades & Classes</h2>
          <div class="flex gap-2 ml-auto">
            <Button 
              :label="includeInactive ? 'Hide Inactive' : 'Show Inactive'" 
              :icon="includeInactive ? 'pi pi-eye-slash' : 'pi pi-eye'"
              @click="toggleInactive"
              :outlined="!includeInactive"
            />
            <Button 
              label="Add Grade" 
              icon="pi pi-plus" 
              @click="$emit('addGrade')"
            />
            <Button 
              label="Refresh" 
              icon="pi pi-refresh" 
              @click="loadGrades"
              outlined
            />
          </div>
        </div>
  
        <!-- Statistics Cards -->
        <div class="grid mb-4">
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ statistics.total }}</div>
              <div class="text-sm text-600">Total Grades</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-green-600">{{ statistics.active }}</div>
              <div class="text-sm text-600">Active Grades</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ statistics.totalStudents }}</div>
              <div class="text-sm text-600">Total Students</div>
            </div>
          </div>
          <div class="col-12 sm:col-6 md:col-3">
            <div class="surface-100 border-round p-3 text-center">
              <div class="text-2xl font-bold text-purple-600">{{ statistics.sections }}</div>
              <div class="text-sm text-600">Sections</div>
            </div>
          </div>
        </div>
  
        <!-- Section Filter -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-2 align-items-center">
            <span class="font-medium text-900">Filter by Section:</span>
            <Button 
              :label="`All (${grades.length})`"
              @click="selectedSection = null"
              :outlined="selectedSection !== null"
              size="small"
            />
            <Button 
              v-for="section in availableSections" 
              :key="section"
              :label="`${section} (${getSectionCount(section)})`"
              @click="selectedSection = section"
              :outlined="selectedSection !== section"
              size="small"
            />
          </div>
        </div>
  
        <!-- Grades Table -->
        <DataTable 
          :value="filteredGrades" 
          :loading="loading"
          :paginator="true" 
          :rows="20"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          :globalFilterFields="['name', 'stream', 'fullName', 'section']"
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
                {{ filteredGrades.length }} grade{{ filteredGrades.length !== 1 ? 's' : '' }} found
              </span>
              <span class="p-input-icon-left">
                
                <InputText 
                  v-model="globalFilter" 
                  placeholder="Search grades..." 
                  class="w-20rem ml-3"
                />
                <i class="pi pi-search ml-3" />
              </span>
            </div>
          </template>
  
          <!-- <Column field="level" header="Level" sortable style="width: 80px">
            <template #body="{ data }">
              <div class="text-center">
                <Tag 
                  :value="data.level" 
                  :severity="getLevelSeverity(data.level)"
                  class="font-bold"
                />
              </div>
            </template>
          </Column> -->
  
          <Column field="name" header="Grade Name" sortable style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex flex-column gap-1">
                <span class="font-medium text-900">{{ data.fullName }}</span>
                <!-- <small class="text-500">{{ data.fullName }}</small> -->
              </div>
            </template>
          </Column>
  
          <Column field="stream" header="Stream" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.stream" 
                :severity="getStreamSeverity(data.stream)"
              />
            </template>
          </Column>
  
          <Column field="section" header="Section" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.section" 
                severity="info"
              />
            </template>
          </Column>
  
          <Column field="studentCount" header="Students" sortable style="width: 100px">
            <template #body="{ data }">
              <div class="text-center">
                <span class="font-bold text-900">{{ data.studentCount }}</span>
                <div class="text-xs text-500">students</div>
              </div>
            </template>
          </Column>
  
          <Column field="isActive" header="Status" style="width: 100px">
            <template #body="{ data }">
              <Tag 
                :value="data.isActive ? 'Active' : 'Inactive'" 
                :severity="data.isActive ? 'success' : 'danger'"
              />
            </template>
          </Column>
  
          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button 
                  icon="pi pi-eye" 
                  @click="viewGrade(data)"
                  size="small"
                  outlined
                  severity="info"
                  v-tooltip.top="'View Details'"
                />
                <Button 
                  icon="pi pi-pencil" 
                  @click="editGrade(data)"
                  size="small"
                  outlined
                  v-tooltip.top="'Edit Grade'"
                />
                <Button 
                  :icon="data.isActive ? 'pi pi-ban' : 'pi pi-check'" 
                  @click="toggleGradeStatus(data)"
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
              <i class="pi pi-graduation-cap text-4xl text-400"></i>
              <p class="text-500 mt-2">No grades found</p>
            </div>
          </template>
        </DataTable>
      </div>
  
      <!-- Grade Details Dialog -->
      <Dialog 
        v-model:visible="showDetailsDialog" 
        modal 
        header="Grade Details"
        :style="{ width: '600px' }"
      >
        <div v-if="selectedGrade" class="grade-details">
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-medium text-900">Grade Name</label>
                <div class="text-600">{{ selectedGrade.name }}</div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="font-medium text-900">Stream</label>
                <div class="text-600">{{ selectedGrade.stream }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="field">
                <label class="font-medium text-900">Full Name</label>
                <div class="text-600">{{ selectedGrade.fullName }}</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="field">
                <label class="font-medium text-900">Level</label>
                <div class="text-600">{{ selectedGrade.level }}</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="field">
                <label class="font-medium text-900">Section</label>
                <div class="text-600">{{ selectedGrade.section }}</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="field">
                <label class="font-medium text-900">Status</label>
                <div>
                  <Tag 
                    :value="selectedGrade.isActive ? 'Active' : 'Inactive'" 
                    :severity="selectedGrade.isActive ? 'success' : 'danger'"
                  />
                </div>
              </div>
            </div>
            <div class="col-12">
              <div class="field">
                <label class="font-medium text-900">Student Count</label>
                <div class="text-600">
                  {{ selectedGrade.studentCount }} student{{ selectedGrade.studentCount !== 1 ? 's' : '' }} enrolled
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
            label="Edit Grade" 
            icon="pi pi-pencil" 
            @click="editSelectedGrade"
          />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
import { gradeService } from '@/service/api.service'; // Adjust path as needed
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
  
  // Emits
  const emit = defineEmits(['addGrade', 'editGrade', 'viewGrade'])
  
  // Toast for notifications
  const toast = useToast()
  
  // Component state
  const grades = ref([])
  const loading = ref(false)
  const includeInactive = ref(false)
  const globalFilter = ref('')
  const sortField = ref('level')
  const sortOrder = ref(1)
  const selectedSection = ref(null)
  const showDetailsDialog = ref(false)
  const selectedGrade = ref(null)
  
  // Stream colors for visual variety
  const streamColors = ['info', 'success', 'warn', 'danger', 'secondary']
  
  // Computed properties
  const filteredGrades = computed(() => {
    let filtered = grades.value
  
    // Filter by active status
    if (!includeInactive.value) {
      filtered = filtered.filter(grade => grade.isActive)
    }
  
    // Filter by section
    if (selectedSection.value) {
      filtered = filtered.filter(grade => grade.section === selectedSection.value)
    }
  
    return filtered
  })
  
  const availableSections = computed(() => {
    const sections = [...new Set(grades.value.map(grade => grade.section))]
    return sections.sort()
  })
  
  const statistics = computed(() => {
    const activeGrades = grades.value.filter(grade => grade.isActive)
    const totalStudents = grades.value.reduce((sum, grade) => sum + grade.studentCount, 0)
    const sections = new Set(grades.value.map(grade => grade.section)).size
  
    return {
      total: grades.value.length,
      active: activeGrades.length,
      totalStudents,
      sections
    }
  })
  
  // Helper methods
  const getSectionCount = (section) => {
    return grades.value.filter(grade => grade.section === section && (!selectedSection.value || grade.isActive || includeInactive.value)).length
  }
  
  const getLevelSeverity = (level) => {
    if (level < 0) return 'info'    // Preschool
    if (level <= 6) return 'success' // Elementary
    if (level <= 12) return 'warn'   // High School
    return 'danger'                  // Higher education
  }
  
  const getStreamSeverity = (stream) => {
    const colors = ['info', 'success', 'warn', 'danger', 'secondary']
    const hash = stream.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }
  
  const getRowClass = (data) => {
    return {
      'opacity-60': !data.isActive
    }
  }
  
  // Data loading
  const loadGrades = async () => {
    loading.value = true
    try {
      const data = await gradeService.getAll(includeInactive.value)
      grades.value = data || []
    } catch (error) {
      console.error('Error loading grades:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load grades',
        life: 3000
      })
      grades.value = []
    } finally {
      loading.value = false
    }
  }
  
  // Event handlers
  const toggleInactive = async () => {
    includeInactive.value = !includeInactive.value
    await loadGrades()
  }
  
  const viewGrade = (grade) => {
    selectedGrade.value = grade
    showDetailsDialog.value = true
  }
  
  const editGrade = (grade) => {
    emit('editGrade', grade)
  }
  
  const editSelectedGrade = () => {
    showDetailsDialog.value = false
    emit('editGrade', selectedGrade.value)
  }
  
  const toggleGradeStatus = async (grade) => {
    try {
      // This would typically call an API to toggle the status
      // await gradeService.toggleStatus(grade.id)
      
      // For now, just toggle locally and show notification
      grade.isActive = !grade.isActive
      
      toast.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Grade ${grade.name} ${grade.stream} has been ${grade.isActive ? 'activated' : 'deactivated'}`,
        life: 3000
      })
    } catch (error) {
      console.error('Error toggling grade status:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update grade status',
        life: 3000
      })
    }
  }
  
  // Load data on component mount
  onMounted(() => {
    loadGrades()
  })
  </script>
  
  <style scoped>
  .grade-list {
    padding: 1rem;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .grade-details .field {
    margin-bottom: 1rem;
  }
  
  .grade-details .field label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .opacity-60 {
    opacity: 0.6;
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
  </style>