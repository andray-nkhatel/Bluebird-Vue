<template>
    <div class="report-card-container">
      <div class="card">
        <div class="card-header">
          <h2 class="text-2xl font-bold mb-4">Report Card Management</h2>
          
          <!-- Tab Navigation -->
          <TabView v-model:activeIndex="activeTab">
            <TabPanel header="Generate Report Cards">
              <div class="p-4">
                <!-- Single Student Report Card Generation -->
                <div class="mb-6">
                  <h3 class="text-lg font-semibold mb-3">Generate Single Student Report Card</h3>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="field">
                      <label for="student-select" class="block text-sm font-medium mb-2">Student</label>
                      <Dropdown
                        id="student-select"
                        v-model="selectedStudent"
                        :options="students"
                        optionLabel="fullName"
                        optionValue="id"
                        placeholder="Select Student"
                        class="w-full"
                        :loading="studentsLoading"
                        filter
                        filterPlaceholder="Search students..."
                      />
                    </div>
                    
                    <div class="field">
                      <label for="academic-year" class="block text-sm font-medium mb-2">Academic Year</label>
                      <Dropdown
                        id="academic-year"
                        v-model="academicYear"
                        :options="academicYears"
                        optionLabel="name"
                        optionValue="year"
                        placeholder="Select Academic Year"
                        class="w-full"
                        :loading="academicYearsLoading"
                        @change="(e) => console.log('🔍 Academic Year Selected:', e.value)"
                      >
                        <template #value="slotProps">
                          <div v-if="slotProps.value">
                            <span>{{ getSelectedAcademicYearInfo(slotProps.value) }}</span>
                          </div>
                          <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                          <div class="flex justify-between items-center w-full">
                            <span>{{ slotProps.option.name }}</span>
                            <div class="flex gap-2">
                              <small class="text-green-600" v-if="slotProps.option.isActive">Active</small>
                              <small class="text-red-600" v-if="slotProps.option.isClosed">Closed</small>
                            </div>
                          </div>
                        </template>
                      </Dropdown>
                    </div>
                    
                    <div class="field">
                      <label for="term" class="block text-sm font-medium mb-2">Term</label>
                      <Dropdown
                        id="term"
                        v-model="selectedTerm"
                        :options="terms"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Term"
                        class="w-full"
                      />
                    </div>
                    
                    <div class="field">
                      <label class="block text-sm font-medium mb-2">&nbsp;</label>
                      <Button
                        @click="generateSingleReportCard"
                        :loading="generating"
                        :disabled="!selectedStudent || !academicYear || !selectedTerm"
                        class="w-full"
                        severity="primary"
                      >
                        Generate Report Card
                      </Button>
                    </div>
                  </div>
                </div>
  
                <Divider />
  
                <!-- Class Report Card Generation -->
                <div class="mb-6">
                  <h3 class="text-lg font-semibold mb-3">Generate Class Report Cards</h3>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="field">
                      <label for="grade-select" class="block text-sm font-medium mb-2">Grade/Class</label>
                      <Dropdown
                        id="grade-select"
                        v-model="selectedGrade"
                        :options="grades"
                        optionLabel="fullName"
                        optionValue="id"
                        placeholder="Select Grade"
                        class="w-full"
                        :loading="gradesLoading"
                        filter
                        filterPlaceholder="Search grades..."
                      >
                        <template #value="slotProps">
                          <div v-if="slotProps.value">
                            <span>{{ getSelectedGradeInfo(slotProps.value) }}</span>
                          </div>
                          <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                          <div class="flex justify-between items-center w-full">
                            <span>{{ slotProps.option.fullName }}</span>
                            <small class="text-gray-500">({{ slotProps.option.studentCount }} students)</small>
                          </div>
                        </template>
                      </Dropdown>
                    </div>
                    
                    <div class="field">
                      <label for="class-academic-year" class="block text-sm font-medium mb-2">Academic Year</label>
                      <Dropdown
                        id="class-academic-year"
                        v-model="classAcademicYear"
                        :options="academicYears"
                        optionLabel="name"
                        optionValue="year"
                        placeholder="Select Academic Year"
                        class="w-full"
                        :loading="academicYearsLoading"
                        @change="(e) => console.log('🔍 Class Academic Year Selected:', e.value)"
                      >
                        <template #value="slotProps">
                          <div v-if="slotProps.value">
                            <span>{{ getSelectedAcademicYearInfo(slotProps.value) }}</span>
                          </div>
                          <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                          <div class="flex justify-between items-center w-full">
                            <span>{{ slotProps.option.name }}</span>
                            <div class="flex gap-2">
                              <small class="text-green-600" v-if="slotProps.option.isActive">Active</small>
                              <small class="text-red-600" v-if="slotProps.option.isClosed">Closed</small>
                            </div>
                          </div>
                        </template>
                      </Dropdown>
                    </div>
                    
                    <div class="field">
                      <label for="class-term" class="block text-sm font-medium mb-2">Term</label>
                      <Dropdown
                        id="class-term"
                        v-model="selectedClassTerm"
                        :options="terms"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Term"
                        class="w-full"
                      />
                    </div>
                    
                    <div class="field">
                      <label class="block text-sm font-medium mb-2">&nbsp;</label>
                      <Button
                        @click="generateClassReportCards"
                        :loading="generatingClass"
                        :disabled="!selectedGrade || !classAcademicYear || !selectedClassTerm"
                        class="w-full"
                        severity="primary"
                      >
                        Generate Class Report Cards
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
  
            <TabPanel header="View Report Cards">
              <div class="p-4">
                <!-- Student Report Cards Viewer -->
                <div class="mb-4">
                  <h3 class="text-lg font-semibold mb-3">Student Report Cards</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                      <label for="view-student-select" class="block text-sm font-medium mb-2">Select Student</label>
                      <Dropdown
                        id="view-student-select"
                        v-model="viewSelectedStudent"
                        :options="students"
                        optionLabel="fullName"
                        optionValue="id"
                        placeholder="Select Student to View Report Cards"
                        class="w-full"
                        :loading="studentsLoading"
                        filter
                        filterPlaceholder="Search for a student..."
                        filterMatchMode="contains"
                        :filterFields="['fullName', 'firstName', 'lastName', 'gradeName']"
                      >
                        <template #option="slotProps">
                          <div class="flex justify-between items-center w-full">
                            <div class="flex flex-col">
                              <span class="font-medium">{{ slotProps.option.fullName }}</span>
                              <small class="text-gray-500">{{ slotProps.option.gradeName }}</small>
                            </div>
                          </div>
                        </template>
                      </Dropdown>
                    </div>
                    <div class="field">
                      <label class="block text-sm font-medium mb-2">&nbsp;</label>
                      <Button
                        @click="loadStudentReportCards"
                        :loading="loadingReportCards"
                        :disabled="!viewSelectedStudent"
                        class="w-full"
                        severity="secondary"
                      >
                        Load Report Cards
                      </Button>
                    </div>
                  </div>
  
                  <!-- Report Cards DataTable -->
                  <DataTable
                    :value="studentReportCards"
                    :loading="loadingReportCards"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]"
                    class="p-datatable-sm"
                    :emptyMessage="viewSelectedStudent ? 'No report cards found for this student.' : 'Please select a student to view report cards.'"
                  >
                    <Column field="id" header="ID" sortable style="width: 80px" />
                    <Column field="academicYear" header="Academic Year" sortable style="width: 120px" />
                    <Column field="term" header="Term" sortable style="width: 80px" />
                    <Column field="generatedAt" header="Generated Date" sortable>
                      <template #body="{ data }">
                        {{ formatDate(data.generatedAt) }}
                      </template>
                    </Column>
                    <Column field="generatedByName" header="Generated By" sortable />
                    <Column header="Actions" style="width: 120px">
                      <template #body="{ data }">
                        <Button
                          @click="downloadReportCard(data.id)"
                          :loading="downloading === data.id"
                          size="small"
                          severity="info"
                          outlined
                        >
                          <i class="pi pi-download mr-1"></i>
                          Download
                        </Button>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
  
      <!-- Recent Report Cards -->
      <div class="card mt-4" v-if="recentReportCards.length > 0">
        <div class="card-header">
          <h3 class="text-lg font-semibold mb-3">Recently Generated Report Cards</h3>
          <DataTable
            :value="recentReportCards"
            class="p-datatable-sm"
            :rows="5"
          >
            <Column field="studentName" header="Student" sortable />
            <Column field="gradeName" header="Grade" sortable />
            <Column field="academicYear" header="Academic Year" sortable />
            <Column field="term" header="Term" sortable />
            <Column field="generatedAt" header="Generated" sortable>
              <template #body="{ data }">
                {{ formatDate(data.generatedAt) }}
              </template>
            </Column>
            <Column field="generatedByName" header="Generated By" sortable />
            <Column header="Actions" style="width: 120px">
              <template #body="{ data }">
                <Button
                  @click="downloadReportCard(data.id)"
                  :loading="downloading === data.id"
                  size="small"
                  severity="info"
                  outlined
                >
                  <i class="pi pi-download mr-1"></i>
                  Download
                </Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
  
      <!-- Toast for notifications -->
      <Toast />
    </div>
  </template>
  
  <script setup>
import { examService, gradeService, reportService, studentService } from '@/service/api.service'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
  
  // PrimeVue Components
  import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Toast from 'primevue/toast'
  
  const toast = useToast()
  
  // Reactive data
  const activeTab = ref(0)
  const students = ref([])
  const grades = ref([])
  const academicYears = ref([])
  const activeAcademicYear = ref(null)
  const terms = ref([
    { label: 'Term 1', value: 1 },
    { label: 'Term 2', value: 2 },
    { label: 'Term 3', value: 3 }
  ])
  
  // Single student generation
  const selectedStudent = ref(null)
  const academicYear = ref(null)
  const selectedTerm = ref(null)
  const generating = ref(false)
  
  // Class generation
  const selectedGrade = ref(null)
  const classAcademicYear = ref(null)
  const selectedClassTerm = ref(null)
  const generatingClass = ref(false)
  
  // Report cards viewing
  const viewSelectedStudent = ref(null)
  const studentReportCards = ref([])
  const loadingReportCards = ref(false)
  
  // Recent report cards
  const recentReportCards = ref([])
  
  // Loading states
  const studentsLoading = ref(false)
  const gradesLoading = ref(false)
  const academicYearsLoading = ref(false)
  const downloading = ref(null)
  
  // API Methods
  const generateSingleReportCard = async () => {
    generating.value = true
    try {
      const response = await reportService.generateReportCard(
        selectedStudent.value, 
        academicYear.value, 
        selectedTerm.value
      )
      
      recentReportCards.value.unshift(response)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Report card generated successfully',
        life: 3000
      })
      
      // Reset form
      selectedStudent.value = null
      selectedTerm.value = null
      
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to generate report card',
        life: 5000
      })
    } finally {
      generating.value = false
    }
  }
  
  const generateClassReportCards = async () => {
    generatingClass.value = true
    try {
      const response = await reportService.generateClassReportCards(
        selectedGrade.value, 
        classAcademicYear.value, 
        selectedClassTerm.value
      )
      
      // Add all generated report cards to recent list
      recentReportCards.value.unshift(...response)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Generated ${response.length} report cards successfully`,
        life: 3000
      })
      
      // Reset form
      selectedGrade.value = null
      selectedClassTerm.value = null
      
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to generate class report cards',
        life: 5000
      })
    } finally {
      generatingClass.value = false
    }
  }
  
  const loadStudentReportCards = async () => {
    if (!viewSelectedStudent.value) return
    
    loadingReportCards.value = true
    try {
      const response = await reportService.getStudentReportCards(viewSelectedStudent.value)
      studentReportCards.value = response
      
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to load report cards',
        life: 5000
      })
      studentReportCards.value = []
    } finally {
      loadingReportCards.value = false
    }
  }
  
  const downloadReportCard = async (reportCardId) => {
    downloading.value = reportCardId
    try {
      const blob = await reportService.downloadReportCard(reportCardId)
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ReportCard_${reportCardId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Report card downloaded successfully',
        life: 3000
      })
      
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to download report card',
        life: 5000
      })
    } finally {
      downloading.value = null
    }
  }
  
  // Load initial data
  const loadStudents = async () => {
    studentsLoading.value = true
    try {
      const response = await studentService.getAll()
      // Filter to only active students and sort by name
      students.value = response
        .filter(student => student.isActive !== false) // Include students where isActive is true or undefined
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map(student => ({
          id: student.id,
          fullName: student.fullName,
          firstName: student.firstName,
          lastName: student.lastName,
          gradeId: student.gradeId,
          gradeName: student.gradeName
        }))
    } catch (error) {
      console.error('Failed to load students:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load students. Please try again.',
        life: 5000
      })
      students.value = []
    } finally {
      studentsLoading.value = false
    }
  }
  
  const loadGrades = async () => {
    gradesLoading.value = true
    try {
      // Using grade service instead of direct API call
      const response = await gradeService.getAll()
      
      // Filter active grades and sort by level for better UX
      grades.value = response
        .filter(grade => grade.isActive)
        .sort((a, b) => a.level - b.level)
        .map(grade => ({
          id: grade.id,
          fullName: grade.fullName,
          name: grade.name,
          stream: grade.stream,
          section: grade.section,
          level: grade.level,
          studentCount: grade.studentCount,
          homeroomTeacherName: grade.homeroomTeacherName
        }))
    } catch (error) {
      console.error('Failed to load grades:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load grades. Please try again.',
        life: 5000
      })
      grades.value = []
    } finally {
      gradesLoading.value = false
    }
  }
  
  const loadAcademicYears = async () => {
    academicYearsLoading.value = true
    try {
      // Load all academic years and active academic year
      const [allYears, activeYear] = await Promise.all([
        examService.getAcademicYears(),
        examService.getActiveAcademicYear()
      ])
      
      console.log('🔍 Academic Years Response:', allYears)
      console.log('🔍 Active Year Response:', activeYear)
      
      // Handle the response structure - it might be direct array or wrapped
      const yearsArray = Array.isArray(allYears) ? allYears : allYears.data || []
      
      // Sort academic years by year descending (most recent first)
      academicYears.value = yearsArray
        .sort((a, b) => {
          const yearA = parseInt(a.name) || 0
          const yearB = parseInt(b.name) || 0
          return yearB - yearA
        })
        .map(year => ({
          id: year.id,
          name: year.name,
          year: parseInt(year.name), // Convert name to number for easier handling
          startDate: year.startDate,
          endDate: year.endDate,
          isActive: year.isActive,
          isClosed: year.isClosed
        }))
      
      console.log('🔍 Processed Academic Years:', academicYears.value)
      
      // Set active academic year as default
      if (activeYear) {
        activeAcademicYear.value = activeYear
        const activeYearValue = parseInt(activeYear.name)
        academicYear.value = activeYearValue
        classAcademicYear.value = activeYearValue
        console.log('🔍 Set Active Year:', activeYearValue)
      }
      
    } catch (error) {
      console.error('Failed to load academic years:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load academic years. Please try again.',
        life: 5000
      })
      academicYears.value = []
    } finally {
      academicYearsLoading.value = false
    }
  }
  
  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSelectedGradeInfo = (gradeId) => {
    const grade = grades.value.find(g => g.id === gradeId)
    return grade ? `${grade.fullName} (${grade.studentCount} students)` : ''
  }
  
  const getSelectedAcademicYearInfo = (yearValue) => {
    const year = academicYears.value.find(y => y.year === yearValue)
    return year ? year.name : yearValue
  }
  
  // Lifecycle
  onMounted(() => {
    loadAcademicYears()
    loadStudents()
    loadGrades()
  })
  </script>
  
  <style scoped>
  .report-card-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  .card-header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
  
  .field {
    display: flex;
    flex-direction: column;
  }
  
  .grid {
    display: grid;
    gap: 1rem;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .md\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  
  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .font-semibold {
    font-weight: 600;
  }
  
  .font-medium {
    font-weight: 500;
  }
  
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  
  .mb-3 {
    margin-bottom: 0.75rem;
  }
  
  .mb-4 {
    margin-bottom: 1rem;
  }
  
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  
  .mt-4 {
    margin-top: 1rem;
  }
  
  .mr-1 {
    margin-right: 0.25rem;
  }
  
  .w-full {
    width: 100%;
  }
  
  .block {
    display: block;
  }
  
  .flex {
    display: flex;
  }
  
  .flex-col {
    flex-direction: column;
  }
  
  .justify-between {
    justify-content: space-between;
  }
  
  .items-center {
    align-items: center;
  }
  
  .text-gray-500 {
    color: #6b7280;
  }
  
  .text-green-600 {
    color: #059669;
  }
  
  .text-red-600 {
    color: #dc2626;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
  </style>