<template>
    <div class="card">
      <!-- Header Section -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold text-900 m-0">Students</h2>
          <p class="text-600 mt-1 mb-0">Manage student information and enrollment</p>
        </div>
        <div class="flex gap-2 ml-auto">
          <Button 
            icon="pi pi-download" 
            
            label="Download Template" 
            severity="secondary" 
            @click="downloadTemplate"
            :loading="downloading"
          />
          <Button 
            icon="pi pi-upload" 
            label="Import CSV" 
            severity="info" 
            @click="showImportDialog = true"
          />
          <Button 
            icon="pi pi-plus" 
            label="Add Student" 
            @click="openNew"
          />
        </div>
      </div>
  
      <!-- Filters and Search -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div class="flex gap-3  align-items-center">
          <span class="p-input-icon-left" style="display: flex; align-items: center;">
            
            <InputText 
              v-model="globalFilter" 
              placeholder="Search students..." 
              class="w-20rem"
            />
            <i style="display: flex; margin-left: 5px;" class="pi pi-search " />
          </span>
          <Dropdown 
            v-model="selectedGrade" 
            :options="gradeOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Filter by Grade" 
            class="w-12rem"
            showClear
            @change="onGradeFilter"
          />
        </div>
        <div class="flex align-items-center gap-2 " style="display: flex; align-items: center;">
          <InputSwitch style="margin-left: 10px;" v-model="includeArchived" @change="loadStudents" />
          <label class="text-sm">Show Archived</label>
        </div>
      </div>
  
      <!-- Data Table -->
      <DataTable 
        v-model:selection="selectedStudents"
        :value="students" 
        :loading="loading"
        dataKey="id"
        :paginator="true" 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25, 50]"
        :globalFilterFields="['firstName', 'lastName', 'studentNumber', 'guardianName', 'gradeName']"
        :globalFilter="globalFilter"
        removableSort
        showGridlines
        stripedRows
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-2">
              <span class="text-sm text-600">
                Total: {{ students.length }} students
              </span>
            </div>
            <div class="flex gap-2" v-if="selectedStudents && selectedStudents.length > 0">
              <Button 
                icon="pi pi-archive" 
                label="Archive Selected" 
                severity="warning" 
                size="small"
                @click="confirmArchiveSelected"
              />
              <Button 
                icon="pi pi-trash" 
                label="Delete Selected" 
                severity="danger" 
                size="small"
                @click="confirmDeleteSelected"
              />
            </div>
          </div>
        </template>
  
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        
        <Column field="studentNumber" header="Student #" sortable style="min-width: 8rem">
          <template #body="{ data }">
            <Badge :value="data.studentNumber" severity="info" />
          </template>
        </Column>
  
        <Column field="fullName" header="Name" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <Avatar 
                :label="data.firstName.charAt(0) + data.lastName.charAt(0)" 
                class="mr-2" 
                size="normal" 
                shape="circle" 
                :style="{ backgroundColor: getAvatarColor(data.id) }"
              />
              <div>
                <div class="font-medium">{{ data.fullName }}</div>
                <div class="text-sm text-600">{{ data.gender }}</div>
              </div>
            </div>
          </template>
        </Column>
  
        <Column field="gradeName" header="Grade" sortable style="min-width: 10rem">
          <template #body="{ data }">
            <Tag :value="data.gradeName" severity="success" />
          </template>
        </Column>
  
        <Column field="dateOfBirth" header="Age" sortable style="min-width: 6rem">
          <template #body="{ data }">
            {{ calculateAge(data.dateOfBirth) }} years
          </template>
        </Column>
  
        <Column field="guardianName" header="Guardian" sortable style="min-width: 10rem">
          <template #body="{ data }">
            <div>
              <div class="font-medium">{{ data.guardianName }}</div>
              <div class="text-sm text-600">{{ data.guardianPhone }}</div>
            </div>
          </template>
        </Column>
  
        <Column field="enrollmentDate" header="Enrolled" sortable style="min-width: 8rem">
          <template #body="{ data }">
            {{ formatDate(data.enrollmentDate) }}
          </template>
        </Column>
  
        <Column field="isActive" header="Status" style="min-width: 6rem">
          <template #body="{ data }">
            <Tag 
              :value="getStatusLabel(data)" 
              :severity="getStatusSeverity(data)" 
            />
          </template>
        </Column>
  
        <Column header="Actions" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button 
                icon="pi pi-eye" 
                severity="info" 
                text 
                rounded 
                @click="viewStudent(data)"
                v-tooltip.top="'View Details'"
              />
              <Button 
                icon="pi pi-pencil" 
                severity="success" 
                text 
                rounded 
                @click="editStudent(data)"
                v-tooltip.top="'Edit'"
              />
              <Button 
                icon="pi pi-archive" 
                severity="warning" 
                text 
                rounded 
                @click="confirmArchive(data)"
                v-if="!data.isArchived"
                v-tooltip.top="'Archive'"
              />
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                text 
                rounded 
                @click="confirmDelete(data)"
                v-tooltip.top="'Delete'"
              />
            </div>
          </template>
        </Column>
  
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-users text-4xl text-400 mb-3"></i>
            <div class="text-xl text-600 mb-2">No students found</div>
            <div class="text-600">Add your first student to get started</div>
          </div>
        </template>
      </DataTable>
  
      <!-- Student Dialog -->
      <Dialog 
        v-model:visible="studentDialog" 
        :header="dialogHeader"
        modal 
        class="p-fluid" 
        :style="{ width: '25vw' }"
        :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      >
        <form @submit.prevent="saveStudent">
          <div class="grid">
            <!-- Personal Information -->
            <div class="col-12">
              <h4 class="text-lg font-semibold mb-3">Personal Information</h4>
            </div>
            
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">First Name *</label>
              <InputText 
                v-model="student.firstName" 
                class="w-full"
                required 
                :class="{ 'p-invalid': submitted && !student.firstName }" 
              />
              <small class="p-error" v-if="submitted && !student.firstName">First name is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Last Name *</label>
              <InputText 
                v-model="student.lastName" 
                class="w-full"
                required 
                :class="{ 'p-invalid': submitted && !student.lastName }" 
              />
              <small class="p-error" v-if="submitted && !student.lastName">Last name is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Student Number *</label>
              <InputText 
                v-model="student.studentNumber" 
                class="w-full"
                required 
                :class="{ 'p-invalid': submitted && !student.studentNumber }" 
              />
              <small class="p-error" v-if="submitted && !student.studentNumber">Student number is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Gender *</label>
              <Dropdown 
                v-model="student.gender" 
                class="w-full"
                :options="genderOptions" 
                placeholder="Select Gender"
                required
                :class="{ 'p-invalid': submitted && !student.gender }" 
              />
              <small class="p-error" v-if="submitted && !student.gender">Gender is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Date of Birth *</label>
              <Calendar 
                class="w-full"
                v-model="student.dateOfBirth" 
                dateFormat="yy-mm-dd"
                :maxDate="new Date()"
                required
                :class="{ 'p-invalid': submitted && !student.dateOfBirth }" 
              />
              <small class="p-error" v-if="submitted && !student.dateOfBirth">Date of birth is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Grade *</label>
              <Dropdown 
                class="w-full"
                v-model="student.gradeId" 
                :options="gradeOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Select Grade"
                required
                :class="{ 'p-invalid': submitted && !student.gradeId }" 
              />
              <small class="p-error" v-if="submitted && !student.gradeId">Grade is required.</small>
            </div>
  
            <div class="col-12">
              <label class="block text-sm font-medium mb-2">Address</label>
              <Textarea 
                class="w-full"
                v-model="student.address" 
                rows="2" 
                placeholder="Enter full address"
              />
            </div>
  
            <!-- Guardian Information -->
            <div class="col-12 mt-3">
              <h4 class="text-lg font-semibold mb-3">Guardian Information</h4>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Guardian Name *</label>
              <InputText 
               class="w-full"
                v-model="student.guardianName" 
                required 
                :class="{ 'p-invalid': submitted && !student.guardianName }" 
              />
              <small class="p-error" v-if="submitted && !student.guardianName">Guardian name is required.</small>
            </div>
  
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Guardian Phone *</label>
              <InputText 
                class="w-full"
                v-model="student.guardianPhone" 
                required 
                :class="{ 'p-invalid': submitted && !student.guardianPhone }" 
              />
              <small class="p-error" v-if="submitted && !student.guardianPhone">Guardian phone is required.</small>
            </div>
  
            <!-- Status -->
            <div class="col-12 mt-3">
              <div class="flex align-items-center gap-2">
                <InputSwitch v-model="student.isActive" />
                <label class="text-sm font-medium">Active Student</label>
              </div>
            </div>
          </div>
        </form>
  
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button 
            label="Save" 
            icon="pi pi-check" 
            @click="saveStudent" 
            :loading="saving"
          />
        </template>
      </Dialog>
  
      <!-- View Student Dialog -->
      <Dialog 
        v-model:visible="viewDialog" 
        header="Student Details"
        modal 
        class="p-fluid" 
        :style="{ width: '40vw' }"
        :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      >
        <div v-if="selectedStudent" class="grid">
          <div class="col-12 text-center mb-4">
            <Avatar 
              :label="selectedStudent.firstName.charAt(0) + selectedStudent.lastName.charAt(0)" 
              size="xlarge" 
              shape="circle" 
              :style="{ backgroundColor: getAvatarColor(selectedStudent.id) }"
            />
            <h3 class="mt-3 mb-1">{{ selectedStudent.fullName }}</h3>
            <Tag 
              :value="getStatusLabel(selectedStudent)" 
              :severity="getStatusSeverity(selectedStudent)" 
            />
          </div>
  
          <div class="col-12">
            <div class="grid">
              <div class="col-6">
                <strong>Student Number:</strong>
                <div>{{ selectedStudent.studentNumber }}</div>
              </div>
              <div class="col-6">
                <strong>Grade:</strong>
                <div>{{ selectedStudent.gradeName }}</div>
              </div>
              <div class="col-6">
                <strong>Gender:</strong>
                <div>{{ selectedStudent.gender }}</div>
              </div>
              <div class="col-6">
                <strong>Age:</strong>
                <div>{{ calculateAge(selectedStudent.dateOfBirth) }} years</div>
              </div>
              <div class="col-12">
                <strong>Address:</strong>
                <div>{{ selectedStudent.address || 'Not specified' }}</div>
              </div>
              <div class="col-6">
                <strong>Guardian:</strong>
                <div>{{ selectedStudent.guardianName }}</div>
              </div>
              <div class="col-6">
                <strong>Guardian Phone:</strong>
                <div>{{ selectedStudent.guardianPhone }}</div>
              </div>
              <div class="col-6">
                <strong>Enrollment Date:</strong>
                <div>{{ formatDate(selectedStudent.enrollmentDate) }}</div>
              </div>
            </div>
          </div>
        </div>
  
        <template #footer>
          <Button label="Close" icon="pi pi-times" text @click="viewDialog = false" />
          <Button 
            label="Edit" 
            icon="pi pi-pencil" 
            @click="editFromView"
          />
        </template>
      </Dialog>
  
      <!-- Import CSV Dialog -->
      <Dialog 
        v-model:visible="showImportDialog" 
        header="Import Students from CSV"
        modal 
        :style="{ width: '30vw' }"
        :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      >
        <div class="flex flex-column gap-3">
          <div class="text-center">
            <i class="pi pi-upload text-4xl text-primary mb-3"></i>
            <div class="text-lg font-medium mb-2">Upload CSV File</div>
            <div class="text-sm text-600 mb-3">
              Select a CSV file with student data to import
            </div>
          </div>
  
          <FileUpload
            ref="fileUpload"
            mode="basic"
            accept=".csv"
            :maxFileSize="5000000"
            chooseLabel="Choose CSV File"
            class="w-full"
            @select="onFileSelect"
            :auto="false"
          />
  
          <div v-if="selectedFile" class="text-sm text-600">
            Selected: {{ selectedFile.name }}
          </div>
  
          <Message 
            severity="info"
            :closable="false"
          >
            Make sure your CSV file includes columns: firstName, lastName, studentNumber, etc.
          </Message>
        </div>
  
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="showImportDialog = false" />
          <Button 
            label="Import" 
            icon="pi pi-upload" 
            @click="importStudents"
            :disabled="!selectedFile"
            :loading="importing"
          />
        </template>
      </Dialog>
  
      <!-- Delete Confirmation Dialog -->
      <ConfirmDialog />
    </div>
  </template>
  
  <script setup>
  import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { studentService } from '../../service/api.service';
  
  // Composables
  const toast = useToast();
  const confirm = useConfirm();
  
  // Reactive data
  const students = ref([]);
  const student = ref({});
  const selectedStudents = ref([]);
  const selectedStudent = ref(null);
  const studentDialog = ref(false);
  const viewDialog = ref(false);
  const showImportDialog = ref(false);
  const selectedFile = ref(null);
  const submitted = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const importing = ref(false);
  const downloading = ref(false);
  const globalFilter = ref('');
  const selectedGrade = ref(null);
  const includeArchived = ref(false);
  
  // Options
  const genderOptions = ref(['Male', 'Female']);
  const gradeOptions = ref([
    { label: 'Grade 1 Orange', value: 12 },
    { label: 'Grade 2 Blue', value: 13 },
    { label: 'Grade 3 Green', value: 14 },
    // Add more grades as needed
  ]);
  
  // Computed
  const dialogHeader = computed(() => {
    return student.value.id ? 'Edit Student' : 'Add Student';
  });
  
  // Methods
  const loadStudents = async () => {
    try {
      loading.value = true;
      const data = await studentService.getAll(includeArchived.value);
      students.value = data;
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load students',
        life: 3000
      });
    } finally {
      loading.value = false;
    }
  };
  
  const openNew = () => {
    student.value = {
      firstName: '',
      middleName: '',
      lastName: '',
      studentNumber: '',
      dateOfBirth: null,
      phoneNumber: '',
      gender: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
      gradeId: null,
      isActive: true,
      
    };
    submitted.value = false;
    studentDialog.value = true;
  };
  
  const editStudent = (studentData) => {
    student.value = { 
      ...studentData,
      dateOfBirth: new Date(studentData.dateOfBirth)
    };
    studentDialog.value = true;
  };
  
  const viewStudent = (studentData) => {
    selectedStudent.value = studentData;
    viewDialog.value = true;
  };
  
  const editFromView = () => {
    viewDialog.value = false;
    editStudent(selectedStudent.value);
  };
  
  const hideDialog = () => {
    studentDialog.value = false;
    submitted.value = false;
  };
  
  const saveStudent = async () => {
    submitted.value = true;
  
    if (!student.value.firstName || !student.value.lastName || !student.value.studentNumber || 
        !student.value.gender || !student.value.dateOfBirth || !student.value.gradeId ||
        !student.value.guardianName || !student.value.guardianPhone) {
      return;
    }
  
    try {
      saving.value = true;
      const studentData = {
        ...student.value,
        dateOfBirth: student.value.dateOfBirth.toISOString()
      };
  
      if (student.value.id) {
        await studentService.update(student.value.id, studentData);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Student updated successfully',
          life: 3000
        });
      } else {
        await studentService.create(studentData);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Student created successfully',
          life: 3000
        });
      }
  
      studentDialog.value = false;
      await loadStudents();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save student',
        life: 3000
      });
    } finally {
      saving.value = false;
    }
  };
  
  const confirmDelete = (studentData) => {
    confirm.require({
      message: `Are you sure you want to delete ${studentData.fullName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-text p-button-text',
      acceptClass: 'p-button-danger p-button-text',
      accept: () => deleteStudent(studentData)
    });
  };
  
  const deleteStudent = async (studentData) => {
    try {
      await studentService.delete(studentData.id);
      await loadStudents();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student deleted successfully',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete student',
        life: 3000
      });
    }
  };
  
  const confirmArchive = (studentData) => {
    confirm.require({
      message: `Are you sure you want to archive ${studentData.fullName}?`,
      header: 'Archive Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-text p-button-text',
      acceptClass: 'p-button-warning p-button-text',
      accept: () => archiveStudent(studentData)
    });
  };
  
  const archiveStudent = async (studentData) => {
    try {
      await studentService.archive(studentData.id);
      await loadStudents();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Student archived successfully',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to archive student',
        life: 3000
      });
    }
  };
  
  const confirmDeleteSelected = () => {
    confirm.require({
      message: `Are you sure you want to delete ${selectedStudents.value.length} selected students?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-text p-button-text',
      acceptClass: 'p-button-danger p-button-text',
      accept: () => deleteSelectedStudents()
    });
  };
  
  const deleteSelectedStudents = async () => {
    try {
      await Promise.all(
        selectedStudents.value.map(student => studentService.delete(student.id))
      );
      selectedStudents.value = [];
      await loadStudents();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Selected students deleted successfully',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete selected students',
        life: 3000
      });
    }
  };
  
  const confirmArchiveSelected = () => {
    confirm.require({
      message: `Are you sure you want to archive ${selectedStudents.value.length} selected students?`,
      header: 'Archive Confirmation',
      icon: 'pi pi-info-circle',
      rejectClass: 'p-button-text p-button-text',
      acceptClass: 'p-button-warning p-button-text',
      accept: () => archiveSelectedStudents()
    });
  };
  
  const archiveSelectedStudents = async () => {
    try {
      await Promise.all(
        selectedStudents.value.map(student => studentService.archive(student.id))
      );
      selectedStudents.value = [];
      await loadStudents();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Selected students archived successfully',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to archive selected students',
        life: 3000
      });
    }
  };
  
  const onGradeFilter = async () => {
    if (selectedGrade.value) {
      try {
        loading.value = true;
        const data = await studentService.getByGrade(selectedGrade.value);
        students.value = data;
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to filter students by grade',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    } else {
      await loadStudents();
    }
  };
  
  const onFileSelect = (event) => {
    selectedFile.value = event.files[0];
  };
  
  const importStudents = async () => {
    if (!selectedFile.value) return;
  
    try {
      importing.value = true;
      const result = await studentService.importFromCsv(selectedFile.value);
      
      showImportDialog.value = false;
      selectedFile.value = null;
      await loadStudents();
      
      toast.add({
        severity: 'success',
        summary: 'Import Successful',
        detail: `Imported ${result.successCount || 0} students successfully`,
        life: 5000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Import Failed',
        detail: 'Failed to import students from CSV',
        life: 3000
      });
    } finally {
      importing.value = false;
    }
  };
  
  const downloadTemplate = async () => {
    try {
      downloading.value = true;
      const blob = await studentService.downloadTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_import_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Template downloaded successfully',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to download template',
        life: 3000
      });
    } finally {
      downloading.value = false;
    }
  };
  
  // Utility functions
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusLabel = (student) => {
    if (student.isArchived) return 'Archived';
    return student.isActive ? 'Active' : 'Inactive';
  };
  
  const getStatusSeverity = (student) => {
    if (student.isArchived) return 'secondary';
    return student.isActive ? 'success' : 'warning';
  };
  
  const getAvatarColor = (id) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[id % colors.length];
  };
  
  // Lifecycle
  onMounted(() => {
    loadStudents();
  });
  </script>
  
  <style scoped>
  .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.75rem;
  }
  
  .p-avatar {
    color: white;
    font-weight: bold;
  }
  </style>