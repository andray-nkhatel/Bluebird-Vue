<template>
  <div class="student-form w-full mx-auto mt-6">
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-semibold text-900 m-0">
          {{ isEditMode ? 'Edit Student' : 'Add New Student' }}
        </h2>
        <Button 
          label="Back to List" 
          icon="pi pi-arrow-left" 
          @click="goToStudentPage"
          outlined
          class="ml-auto"
        />
      </div>

      <form @submit.prevent="handleSubmit" class="p-fluid">
        <div class="flex flex-col gap-6">
          <!-- Personal Information Section -->
          <div>
            <h3 class="text-lg font-medium text-900 mb-3">Personal Information</h3>
          </div>

          <!-- Name Fields Row -->
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-auto">
              <label for="firstName" class="block font-semibold mb-2">First Name *</label>
              <InputText 
                id="firstName"
                class="w-full"
                v-model="form.firstName" 
                :class="{ 'p-invalid': errors.firstName }"
                placeholder="Enter first name"
              />
              <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
            </div>
            <div class="flex-auto">
              <label for="lastName" class="block font-semibold mb-2">Last Name *</label>
              <InputText 
                class="w-full"
                id="lastName"
                v-model="form.lastName" 
                :class="{ 'p-invalid': errors.lastName }"
                placeholder="Enter last name"
              />
              <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
            </div>
          </div>

          <!-- Student Details Row -->
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-auto">
              <label for="gradeId" class="block font-semibold mb-2">Grade *</label>
              <Select 
                id="gradeId"
                class="w-full"
                v-model="form.gradeId" 
                :options="gradeOptions" 
                optionLabel="fullName" 
                optionValue="id"
                :class="{ 'p-invalid': errors.gradeId }"
                placeholder="Select grade"
                :loading="loadingGrades"
                @change="onGradeChange"
              />
              <small v-if="errors.gradeId" class="p-error">{{ errors.gradeId }}</small>
            </div>
          </div>

          <!-- Optional Subjects Section (Only for Secondary Students) -->
          <div v-if="isSecondaryStudent" class="optional-subjects-section">
            <h3 class="text-lg font-medium text-900 mb-3">Optional Subjects</h3>
            <div class="flex flex-col gap-4">
              <div class="text-sm text-gray-600 mb-2">
                <i class="pi pi-info-circle mr-2"></i>
                {{ optionalSubjectsInfo }}
              </div>
              
              <div class="flex-auto">
                <label class="block font-semibold mb-2">Select Optional Subjects</label>
                <MultiSelect
                  v-model="form.optionalSubjectIds"
                  :options="availableOptionalSubjects"
                  optionLabel="name"
                  optionValue="id"
                  :maxSelectedLabels="3"
                  placeholder="Choose optional subjects"
                  :loading="loadingOptionalSubjects"
                  :disabled="!form.gradeId"
                />
                <small class="text-gray-500">
                  Maximum {{ maxOptionalSubjects }} optional subject{{ maxOptionalSubjects > 1 ? 's' : '' }} allowed
                </small>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="mt-6">
            <div class="flex gap-2 justify-content-end">
              <Button 
                label="Cancel" 
                icon="pi pi-times"
                @click="handleCancel"
                outlined
                :disabled="loading"
              />
              <Button 
                label="Reset" 
                icon="pi pi-refresh"
                @click="resetForm"
                outlined
                severity="secondary"
                :disabled="loading"
              />
              <Button 
                type="submit"
                :label="isEditMode ? 'Update Student' : 'Add Student'" 
                icon="pi pi-check"
                :loading="loading"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gradeService, studentService, subjectService } from '../../service/api.service';

// Emits
const emit = defineEmits(['back', 'studentAdded', 'studentUpdated'])

const router = useRouter();
const route = useRoute();

// Check if we're in edit mode based on route params
const isEditMode = computed(() => !!route.params.id)
const studentId = computed(() => route.params.id)

function goToStudentPage() {
  router.push('/app/students');
}

// Toast for notifications
const toast = useToast()

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  gradeId: null,
  optionalSubjectIds: []
})

// Form validation errors
const errors = reactive({})

// Loading states
const loading = ref(false)
const loadingGrades = ref(false)
const loadingStudent = ref(false)
const loadingOptionalSubjects = ref(false)

const gradeOptions = ref([])
const availableOptionalSubjects = ref([])
const selectedGrade = ref(null)

// Computed properties
const isSecondaryStudent = computed(() => {
  if (!selectedGrade.value) return false;
  return selectedGrade.value.section === 'SecondaryJunior' || 
         selectedGrade.value.section === 'SecondarySenior';
})

const maxOptionalSubjects = computed(() => {
  if (!selectedGrade.value) return 0;
  return selectedGrade.value.section === 'SecondaryJunior' ? 1 : 2;
})

const optionalSubjectsInfo = computed(() => {
  if (!isSecondaryStudent.value) return '';
  return `Secondary students can select up to ${maxOptionalSubjects.value} optional subject${maxOptionalSubjects.value > 1 ? 's' : ''}.`;
})

// Validation rules
const validateForm = () => {
  const newErrors = {}

  if (!form.firstName?.trim()) {
    newErrors.firstName = 'First name is required'
  }

  if (!form.lastName?.trim()) {
    newErrors.lastName = 'Last name is required'
  }

  if (!form.gradeId) {
    newErrors.gradeId = 'Grade is required'
  }

  // Validate optional subjects
  if (isSecondaryStudent.value && form.optionalSubjectIds.length > maxOptionalSubjects.value) {
    newErrors.optionalSubjects = `Maximum ${maxOptionalSubjects.value} optional subject${maxOptionalSubjects.value > 1 ? 's' : ''} allowed`
  }

  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  // Set new errors
  Object.assign(errors, newErrors)

  return Object.keys(newErrors).length === 0
}

// Load student data for editing
const loadStudent = async () => {
  if (!isEditMode.value) return

  loadingStudent.value = true
  try {
    const student = await studentService.getById(studentId.value)
    form.firstName = student.firstName || ''
    form.lastName = student.lastName || ''
    form.gradeId = student.gradeId || null
    
    // Load optional subjects if they exist
    if (student.optionalSubjects && student.optionalSubjects.length > 0) {
      form.optionalSubjectIds = student.optionalSubjects.map(subject => subject.id)
    }
  } catch (error) {
    console.error('Error loading student:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student data',
      life: 3000
    })
    router.push('/students')
  } finally {
    loadingStudent.value = false
  }
}

// Load grades for dropdown
const loadGrades = async () => {
  loadingGrades.value = true
  try {
    const grades = await gradeService.getAll()
    gradeOptions.value = grades
  } catch (error) {
    console.error('Error loading grades:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load grades',
      life: 3000
    })
  } finally {
    loadingGrades.value = false
  }
}

// Load optional subjects for selected grade
const loadOptionalSubjects = async (gradeId) => {
  if (!gradeId) {
    availableOptionalSubjects.value = []
    return
  }

  loadingOptionalSubjects.value = true
  try {
    // This would be a new API endpoint to get optional subjects for a grade
    const optionalSubjects = await subjectService.getOptionalSubjectsForGrade(gradeId)
    availableOptionalSubjects.value = optionalSubjects
  } catch (error) {
    console.error('Error loading optional subjects:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load optional subjects',
      life: 3000
    })
  } finally {
    loadingOptionalSubjects.value = false
  }
}

// Handle grade change
const onGradeChange = () => {
  selectedGrade.value = gradeOptions.value.find(g => g.id === form.gradeId)
  
  // Reset optional subjects when grade changes
  form.optionalSubjectIds = []
  
  // Load optional subjects for the selected grade
  if (isSecondaryStudent.value) {
    loadOptionalSubjects(form.gradeId)
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }

  loading.value = true
  try {
    let result;
    if (isEditMode.value) {
      // Update existing student
      const studentData = {
        firstName: form.firstName?.trim() || '',
        lastName: form.lastName?.trim() || '',
        gradeId: form.gradeId || null,
        isActive: true
      }
      result = await studentService.updateMinimal(studentId.value, studentData)
      
      // Handle optional subjects separately
      if (isSecondaryStudent.value) {
        await studentService.assignOptionalSubjects(studentId.value, {
          subjectIds: form.optionalSubjectIds
        })
      }
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student updated successfully',
        life: 3000
      })
      emit('studentUpdated', result)
    } else {
      // Create new student
      const studentData = {
        firstName: form.firstName?.trim() || '',
        lastName: form.lastName?.trim() || '',
        gradeId: form.gradeId || null
      }
      result = await studentService.createMinimal(studentData)
      
      // Handle optional subjects separately
      if (isSecondaryStudent.value && form.optionalSubjectIds.length > 0) {
        await studentService.assignOptionalSubjects(result.id, {
          subjectIds: form.optionalSubjectIds
        })
      }
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student added successfully',
        life: 3000
      })
      emit('studentAdded', result)
      resetForm()
    }
    setTimeout(() => {
      router.push('/app/students')
    }, 1000)
  } catch (error) {
    console.error('Error saving student:', error)
    let errorMessage = `Failed to ${isEditMode.value ? 'update' : 'add'} student`;
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 10000
    })
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  if (isEditMode.value) {
    loadStudent()
  } else {
    form.firstName = ''
    form.lastName = ''
    form.gradeId = null
    form.optionalSubjectIds = []
  }
  Object.keys(errors).forEach(key => delete errors[key])
}

// Handle cancel
const handleCancel = () => {
  router.push('/students')
}

// Watch for grade changes
watch(() => form.gradeId, (newGradeId) => {
  if (newGradeId) {
    onGradeChange()
  }
})

// Load data on component mount
onMounted(async () => {
  await loadGrades()
  if (isEditMode.value) {
    await loadStudent()
  }
})
</script>

<style scoped>
.student-form {
  padding: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}

.grid {
  margin: 0;
}

.grid > [class*="col-"] {
  padding: 0.5rem;
}

h3 {
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.optional-subjects-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f9fafb;
}

:deep(.p-invalid) {
  border-color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>