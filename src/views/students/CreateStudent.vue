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
              <label for="middleName" class="block font-semibold mb-2">Middle Name</label>
              <InputText
                class="w-full" 
                id="middleName"
                v-model="form.middleName" 
                placeholder="Enter middle name (optional)"
              />
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
            <!-- <div class="flex-auto"> -->
              <!-- <label for="studentNumber" class="block font-semibold mb-2">Student Number *</label> -->
              <!-- <InputText 
                class="w-full"
                id="studentNumber"
                v-model="form.studentNumber" 
                :class="{ 'p-invalid': errors.studentNumber }"
                placeholder="Enter student number"
              /> -->
              <!-- <small v-if="errors.studentNumber" class="p-error">{{ errors.studentNumber }}</small> -->
            <!-- </div> -->
            <div class="flex-auto">
              <label for="gradeId" class="block font-semibold mb-2">Grade *</label>
              <Select 
                id="gradeId"
                class="w-full"
                v-model="form.gradeId" 
                :options="gradeOptions" 
                optionLabel="name" 
                optionValue="id"
                :class="{ 'p-invalid': errors.gradeId }"
                placeholder="Select grade"
                :loading="loadingGrades"
              />
              <small v-if="errors.gradeId" class="p-error">{{ errors.gradeId }}</small>
            </div>

            <div class="flex-auto">
              <label for="dateOfBirth" class="block font-semibold mb-2">Date of Birth *</label>
              <Calendar
                class="w-full"
                id="dateOfBirth"
                v-model="form.dateOfBirth" 
                :class="{ 'p-invalid': errors.dateOfBirth }"
                placeholder="Select date of birth"
                dateFormat="mm/dd/yy"
                :maxDate="maxDate"
                showIcon
              />
              <small v-if="errors.dateOfBirth" class="p-error">{{ errors.dateOfBirth }}</small>
            </div>
            <div class="flex-auto">
              <label for="gender" class="block font-semibold mb-2">Gender *</label>
              <Select 
                class="w-full"
                id="gender"
                v-model="form.gender" 
                :options="genderOptions" 
                :class="{ 'p-invalid': errors.gender }"
                placeholder="Select gender"
              />
              <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
            </div>
          </div>

          <!-- Birth & Gender Row -->
          <!-- <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-auto">
              <label for="dateOfBirth" class="block font-semibold mb-2">Date of Birth *</label>
              <Calendar
                class="w-full"
                id="dateOfBirth"
                v-model="form.dateOfBirth" 
                :class="{ 'p-invalid': errors.dateOfBirth }"
                placeholder="Select date of birth"
                dateFormat="mm/dd/yy"
                :maxDate="maxDate"
                showIcon
              />
              <small v-if="errors.dateOfBirth" class="p-error">{{ errors.dateOfBirth }}</small>
            </div>
            <div class="flex-auto">
              <label for="gender" class="block font-semibold mb-2">Gender *</label>
              <Select 
                class="w-full"
                id="gender"
                v-model="form.gender" 
                :options="genderOptions" 
                :class="{ 'p-invalid': errors.gender }"
                placeholder="Select gender"
              />
              <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
            </div>
          </div> -->

          <!-- Contact Information Section -->
          <div class="mt-4">
            <h3 class="text-lg font-medium text-900 mb-3">Contact Information</h3>
          </div>

          <!-- Address Row -->
          <div class="flex flex-col gap-4">
            <div class="flex-auto">
              <label for="address" class="block font-semibold mb-2">Address</label>
              <Textarea 
                class="w-full"
                id="address"
                v-model="form.address" 
                placeholder="Enter full address"
                :rows="3"
              />
            </div>
          </div>

          <!-- Phone Row -->
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-auto">
              <label for="phoneNumber" class="block font-semibold mb-2">Phone Number</label>
              <InputText 
                class="w-2/5"
                id="phoneNumber"
                v-model="form.phoneNumber" 
                placeholder="Enter phone number"
              />
            </div>
            <div class="flex-auto">
              <!-- Empty space to balance the layout -->
            </div>
          </div>

          <!-- Guardian Information Section -->
          <div class="mt-4">
            <h3 class="text-lg font-medium text-900 mb-3">Guardian Information</h3>
          </div>

          <!-- Guardian Details Row -->
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-auto">
              <label for="guardianName" class="block font-semibold mb-2">Guardian Name *</label>
              <InputText 
                class="w-full"
                id="guardianName"
                v-model="form.guardianName" 
                :class="{ 'p-invalid': errors.guardianName }"
                placeholder="Enter guardian name"
              />
              <small v-if="errors.guardianName" class="p-error">{{ errors.guardianName }}</small>
            </div>
            <div class="flex-auto">
              <label for="guardianPhone" class="block font-semibold mb-2">Guardian Phone *</label>
              <InputText 
                class="w-full"
                id="guardianPhone"
                v-model="form.guardianPhone" 
                :class="{ 'p-invalid': errors.guardianPhone }"
                placeholder="Enter guardian phone number"
              />
              <small v-if="errors.guardianPhone" class="p-error">{{ errors.guardianPhone }}</small>
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
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { gradeService, studentService } from '../../service/api.service'; // Adjust path as needed

// Emits
const emit = defineEmits(['back', 'studentAdded', 'studentUpdated'])

const router = useRouter();
const route = useRoute();

// Check if we're in edit mode based on route params
const isEditMode = computed(() => !!route.params.id)
const studentId = computed(() => route.params.id)

function goToStudentPage() {
router.push('/students'); // This navigates to the /student route
}

// Toast for notifications
const toast = useToast()

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  studentNumber: '',
  dateOfBirth: null,
  gender: '',
  address: '',
  phoneNumber: '',
  guardianName: '',
  guardianPhone: '',
  gradeId: null
})

// Form validation errors
const errors = reactive({})

// Loading states
const loading = ref(false)
const loadingGrades = ref(false)
const loadingStudent = ref(false)

// Options
const genderOptions = ['Male', 'Female']

const gradeOptions = ref([])

// Max date for date of birth (today)
const maxDate = new Date()

// Validation rules
const validateForm = () => {
  const newErrors = {}

  if (!form.firstName?.trim()) {
    newErrors.firstName = 'First name is required'
  }

  if (!form.lastName?.trim()) {
    newErrors.lastName = 'Last name is required'
  }

  // if (!form.studentNumber?.trim()) {
  //   newErrors.studentNumber = 'Student number is required'
  // }

  if (!form.dateOfBirth) {
    newErrors.dateOfBirth = 'Date of birth is required'
  }

  if (!form.gender) {
    newErrors.gender = 'Gender is required'
  }

  if (!form.guardianName?.trim()) {
    newErrors.guardianName = 'Guardian name is required'
  }

  if (!form.guardianPhone?.trim()) {
    newErrors.guardianPhone = 'Guardian phone is required'
  }

  if (!form.gradeId) {
    newErrors.gradeId = 'Grade is required'
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
    
    // Debug: Log the student data received from API
    console.log('Student data received from API:', JSON.stringify(student, null, 2))
    
    // Populate form with student data
    form.firstName = student.firstName || ''
    form.lastName = student.lastName || ''
    form.middleName = student.middleName || ''
    form.studentNumber = student.studentNumber || ''
    form.dateOfBirth = student.dateOfBirth ? new Date(student.dateOfBirth) : null
    form.gender = student.gender || ''
    form.address = student.address || ''
    form.phoneNumber = student.phoneNumber || ''
    form.guardianName = student.guardianName || ''
    form.guardianPhone = student.guardianPhone || ''
    form.gradeId = student.gradeId || null

    // Debug: Log the form after population
    console.log('Form after populating with student data:', JSON.stringify(form, null, 2))

  } catch (error) {
    console.error('Error loading student:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load student data',
      life: 3000
    })
    // Redirect back to list if student not found
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

  // Debug: Log form data before submission
  console.log('Form data before submission:', JSON.stringify(form, null, 2))

  loading.value = true
  try {
    // Prepare the data for submission - match the UpdateStudentDto exactly
    const studentData = {
      firstName: form.firstName?.trim() || '',
      lastName: form.lastName?.trim() || '',
      middleName: form.middleName?.trim() || '',
      studentNumber: form.studentNumber?.trim() || '',
      dateOfBirth: form.dateOfBirth ? form.dateOfBirth.toISOString() : null,
      gender: form.gender || '',
      address: form.address?.trim() || '',
      phoneNumber: form.phoneNumber?.trim() || '',
      guardianName: form.guardianName?.trim() || '',
      guardianPhone: form.guardianPhone?.trim() || '',
      gradeId: form.gradeId || null,
      gradeName: '', // DTO expects this but it's not used in controller
      isActive: true, // Keep student active
      isArchived: false, // Don't archive during update
      optionalSubjects: [] // Empty array for now
    }

    // Debug: Log the data being sent to API
    console.log('Data being sent to API:', JSON.stringify(studentData, null, 2))

    let result;
    if (isEditMode.value) {
      // Update existing student
      result = await studentService.update(studentId.value, studentData)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student updated successfully',
        life: 3000
      })
      emit('studentUpdated', result)
    } else {
      // Create new student
      result = await studentService.create(studentData)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student added successfully',
        life: 3000
      })
      emit('studentAdded', result)
      resetForm()
    }
    
    // Navigate back to list after successful save
    setTimeout(() => {
      router.push('/students')
    }, 1000)
    
  } catch (error) {
    console.error('Error saving student:', error)
    console.error('Error response status:', error.response?.status)
    console.error('Error response headers:', error.response?.headers)
    console.error('Error response data:', error.response?.data)
    
    // More detailed error logging
    if (error.response?.data) {
      console.error('API Error Details:', JSON.stringify(error.response.data, null, 2))
      console.error('Full Error Response:', JSON.stringify(error.response, null, 2))
    }
    
    // Try to extract specific validation errors
    let errorMessage = `Failed to ${isEditMode.value ? 'update' : 'add'} student`;
    
    if (error.response?.data?.errors) {
      // Handle validation errors object
      const validationErrors = Object.entries(error.response.data.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n');
      errorMessage = `Validation errors:\n${validationErrors}`;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.title) {
      errorMessage = error.response.data.title;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 10000 // Longer duration for validation errors
    })
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  if (isEditMode.value) {
    // In edit mode, reload the original student data
    loadStudent()
  } else {
    // In create mode, clear all fields
    Object.keys(form).forEach(key => {
      if (key === 'dateOfBirth') {
        form[key] = null
      } else if (key === 'gradeId') {
        form[key] = null
      } else {
        form[key] = ''
      }
    })
  }
  Object.keys(errors).forEach(key => delete errors[key])
}

// Handle cancel
const handleCancel = () => {
  if (hasFormData()) {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push('/students')
    }
  } else {
    router.push('/students')
  }
}

// Check if form has data
const hasFormData = () => {
  return Object.values(form).some(value => 
    value !== '' && value !== null && value !== undefined
  )
}

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

:deep(.p-invalid) {
  border-color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>