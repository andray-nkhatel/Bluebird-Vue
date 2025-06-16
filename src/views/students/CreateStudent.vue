<template>
    <div class="student-form w-1/2 mx-auto mt-6">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="text-2xl font-semibold text-900 m-0">Add New Student</h2>
          <Button 
            label="Back to List" 
            icon="pi pi-arrow-left" 
            @click="goToStudentPage"
            outlined
            class="ml-auto"
          />
        </div>
  
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <div class="grid flex flex-wrap gap-4">
            <!-- Personal Information Section -->
            <div class="col-12">
              <h3 class="text-lg font-medium text-900 mb-3">Personal Information</h3>
            </div>
  
            <div class="col-12 md:col-4">
              <div class="field">
                <label for="firstName" class="font-medium">First Name *</label>
                <InputText 
                  id="firstName"
                  class="w-full"
                  v-model="form.firstName" 
                  :class="{ 'p-invalid': errors.firstName }"
                  placeholder="Enter first name"
                />
                <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
              </div>
            </div>
  
            <div class="col-12 md:col-4">
              <div class="field">
                <label for="middleName" class="font-medium">Middle Name</label>
                <InputText
                  class="w-full" 
                  id="middleName"
                  v-model="form.middleName" 
                  placeholder="Enter middle name (optional)"
                />
              </div>
            </div>
  
            <div class="col-12 md:col-4">
              <div class="field">
                <label for="lastName" class="font-medium">Last Name *</label>
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
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="studentNumber" class="font-medium">Student Number *</label>
                <InputText 
                 class="w-full"
                  id="studentNumber"
                  v-model="form.studentNumber" 
                  :class="{ 'p-invalid': errors.studentNumber }"
                  placeholder="Enter student number"
                />
                <small v-if="errors.studentNumber" class="p-error">{{ errors.studentNumber }}</small>
              </div>
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="gradeId" class="font-medium">Grade *</label>
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
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="dateOfBirth" class="font-medium">Date of Birth *</label>
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
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="gender" class="font-medium">Gender *</label>
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
  
            <!-- Contact Information Section -->
            <div class="col-12 mt-4">
              <h3 class="text-lg font-medium text-900 mb-3">Contact Information</h3>
            </div>
  
            <div class="col-12">
              <div class="field">
                <label for="address" class="font-medium">Address</label>
                <Textarea 
                  class="w-full"
                  id="address"
                  v-model="form.address" 
                  placeholder="Enter full address"
                  :rows="3"
                />
              </div>
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="phoneNumber" class="font-medium">Phone Number</label>
                <InputText 
                  class="w-full"
                  id="phoneNumber"
                  v-model="form.phoneNumber" 
                  placeholder="Enter phone number"
                />
              </div>
            </div>
  
            <!-- Guardian Information Section -->
            <div class="col-12 mt-4">
              <h3 class="text-lg font-medium text-900 mb-3">Guardian Information</h3>
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guardianName" class="font-medium">Guardian Name *</label>
                <InputText 
                  class="w-full"
                  id="guardianName"
                  v-model="form.guardianName" 
                  :class="{ 'p-invalid': errors.guardianName }"
                  placeholder="Enter guardian name"
                />
                <small v-if="errors.guardianName" class="p-error">{{ errors.guardianName }}</small>
              </div>
            </div>
  
            <div class="col-12 md:col-6">
              <div class="field">
                <label for="guardianPhone" class="font-medium">Guardian Phone *</label>
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
            <div class="col-12 mt-4">
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
                  label="Add Student" 
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
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { gradeService, studentService } from '../../service/api.service'; // Adjust path as needed


  // Emits
  const emit = defineEmits(['back', 'studentAdded'])

  const router = useRouter();

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
  
    if (!form.studentNumber?.trim()) {
      newErrors.studentNumber = 'Student number is required'
    }
  
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
  
  // Load grades for dropdown (you'll need to implement this based on your grade service)
  const loadGrades = async () => {
    loadingGrades.value = true
    try {
      // Replace this with your actual grade service call
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
  
    loading.value = true
    try {
      // Prepare the data for submission
      const studentData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName?.trim() || '',
        studentNumber: form.studentNumber.trim(),
        dateOfBirth: form.dateOfBirth.toISOString(),
        gender: form.gender,
        address: form.address?.trim() || '',
        phoneNumber: form.phoneNumber?.trim() || '',
        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        gradeId: form.gradeId
      }
  
      const newStudent = await studentService.create(studentData)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student added successfully',
        life: 3000
      })
  
      // Emit event to parent component
      emit('studentAdded', newStudent)
      
      // Reset form
      resetForm()
      
    } catch (error) {
      console.error('Error creating student:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to add student',
        life: 5000
      })
    } finally {
      loading.value = false
    }
  }
  
  // Reset form
  const resetForm = () => {
    Object.keys(form).forEach(key => {
      if (key === 'dateOfBirth') {
        form[key] = null
      } else if (key === 'gradeId') {
        form[key] = null
      } else {
        form[key] = ''
      }
    })
    Object.keys(errors).forEach(key => delete errors[key])
  }
  
  // Handle cancel
  const handleCancel = () => {
    if (hasFormData()) {
      if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        resetForm()
        emit('back')
      }
    } else {
      emit('back')
    }
  }
  
  // Check if form has data
  const hasFormData = () => {
    return Object.values(form).some(value => 
      value !== '' && value !== null && value !== undefined
    )
  }
  
  // Load data on component mount
  onMounted(() => {
    loadGrades()
  })
  </script>
  
  <style scoped>
  .student-form {
    padding: 1rem;
  }
  
  /* .card {
   
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  } */
  
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