<template>
  <div class="score-entry">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-2xl font-semibold text-900 m-0">
          <i class="pi pi-pencil mr-2"></i>
          Score Entry
        </h2>
        <p class="text-600 mt-1 mb-0">Enter and manage exam scores for your assigned subjects</p>
      </div>
      <div class="ml-auto">
      <Button
        label="Save All Changes"
        icon="pi pi-save"
        class="p-button-primary ml-auto"
        :disabled="!hasUnsavedChanges || loading"
        @click="saveAllChanges"
        :loading="saving"
      />
    </div>
    </div>

    <!-- Filters Card -->
    <Card class="mb-4">
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-3">
            <label for="assignment" class="block font-medium mb-2">Subject & Grade *</label>
            <Select
              id="assignment"
              v-model="selectedAssignment"
              :options="teacherAssignments"
              optionLabel="displayName"
              placeholder="Select assignment"
              :loading="loadingAssignments"
              class="w-full"
              @change="onAssignmentChange"
            >
              <template #option="slotProps">
                <div>
                  <div class="font-medium">{{ slotProps.option.subjectName }}</div>
                  <small class="text-500">{{ slotProps.option.gradeName }}</small>
                </div>
              </template>
            </Select>
          </div>

          <div class="col-12 md:col-2">
            <label for="academicYear" class="block font-medium mb-2">Academic Year *</label>
            <Select
              id="academicYear"
              v-model="selectedAcademicYear"
              :options="academicYears"
              optionLabel="name"
              optionValue="id"
              placeholder="Select year"
              :loading="loadingYears"
              class="w-full"
              @change="onFiltersChange"
            />
          </div>

          <div class="col-12 md:col-2">
            <label for="term" class="block font-medium mb-2">Term *</label>
            <Select
              id="term"
              v-model="selectedTerm"
              :options="terms"
              optionLabel="name"
              optionValue="id"
              placeholder="Select term"
              :loading="loadingTerms"
              class="w-full"
              @change="onFiltersChange"
            />
          </div>

          <div class="col-12 md:col-3">
            <label for="examType" class="block font-medium mb-2">Exam Type *</label>
            <Select
              id="examType"
              v-model="selectedExamType"
              :options="examTypes"
              optionLabel="name"
              optionValue="id"
              placeholder="Select exam type"
              :loading="loadingExamTypes"
              class="w-full"
              @change="onFiltersChange"
            />
          </div>

          <div class="col-12 md:col-2">
            <label class="block font-medium mb-2">&nbsp;</label>
            <Button
              label="Load Students"
              icon="pi pi-search"
              class="w-full"
              :disabled="!canLoadStudents"
              @click="loadStudentScores"
              :loading="loadingScores"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Scores DataTable -->
    <Card v-if="students.length > 0">
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <div>
            <span>Student Scores</span>
            <Badge 
              v-if="hasUnsavedChanges" 
              value="Unsaved Changes" 
              severity="warning" 
              class="ml-2"
            />
          </div>
          <div class="flex gap-2 ml-auto">
            <Button
              label="Reset Changes"
              icon="pi pi-refresh"
              severity="secondary"
              size="small"
              @click="resetChanges"
              :disabled="!hasUnsavedChanges"
            />
            <Button
              label="Export"
              icon="pi pi-download"
              severity="help"
              size="small"
              @click="exportScores"
              :disabled="!canLoadStudents"
            />
          </div>
        </div>
      </template>
      
      <template #content>
        <DataTable
          v-model:editingRows="editingRows"
          :value="students"
          editMode="row"
          dataKey="studentId"
          :loading="loadingScores"
          responsiveLayout="scroll"
          :scrollable="true"
          scrollHeight="60vh"
          class="p-datatable-sm"
          @row-edit-save="onRowEditSave"
          @row-edit-cancel="onRowEditCancel"
        >
          <Column field="studentName" header="Student Name" style="min-width: 200px;">
            <template #body="slotProps">
              <div class="flex align-items-center">
                <!-- <Avatar
                  :label="getInitials(slotProps.data.studentName)"
                  size="small"
                  shape="circle"
                  class="mr-2"
                /> -->
                <span class="font-medium">{{ slotProps.data.studentName }}</span>
              </div>
            </template>
          </Column>

          <Column field="studentNumber" header="Student #" style="min-width: 120px;">
            <template #body="slotProps">
              <span class="text-500">{{ slotProps.data.studentNumber }}</span>
            </template>
          </Column>

          <Column field="currentScore" header="Current Score" style="min-width: 120px;">
            <template #body="slotProps">
              <Tag
                v-if="slotProps.data.currentScore !== null && slotProps.data.currentScore !== undefined"
                :value="slotProps.data.currentScore"
                :severity="getScoreSeverity(slotProps.data.currentScore)"
              />
              <span v-else class="text-400">No score</span>
            </template>
            <template #editor="slotProps">
              <InputNumber
                v-model="slotProps.data.currentScore"
                :min="0"
                :max="100"
                :maxFractionDigits="1"
                class="w-full"
                placeholder="Enter score"
                :inputStyle="{ width: '100%' }"
              />
            </template>
          </Column>

          <Column field="grade" header="Grade" style="min-width: 100px;">
            <template #body="slotProps">
              <Tag
                v-if="slotProps.data.currentScore !== null && slotProps.data.currentScore !== undefined"
                :value="calculateGrade(slotProps.data.currentScore)"
                :severity="getGradeSeverity(calculateGrade(slotProps.data.currentScore))"
              />
            </template>
          </Column>

          <Column field="lastUpdated" header="Last Updated" style="min-width: 150px;">
            <template #body="slotProps">
              <span v-if="slotProps.data.lastUpdated" class="text-500">
                {{ formatDate(slotProps.data.lastUpdated) }}
              </span>
              <span v-else class="text-400">Never</span>
            </template>
          </Column>

          <Column :rowEditor="true" style="width: 10%; min-width: 8rem;" bodyStyle="text-align:center">
            <template #roweditoriniticon>
              <i class="pi pi-pencil"></i>
            </template>
            <template #roweditorsaveicon>
              <i class="pi pi-check"></i>
            </template>
            <template #roweditorcancelicon>
              <i class="pi pi-times"></i>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Empty State -->
    <Card v-else-if="!loadingScores && selectedAssignment && canLoadStudents">
      <template #content>
        <div class="text-center py-6">
          <i class="pi pi-users text-6xl text-400 mb-3"></i>
          <h3 class="text-xl text-600 mb-2">No Students Found</h3>
          <p class="text-500 mb-4">
            No students are enrolled in the selected grade.
          </p>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            @click="loadStudentScores"
          />
        </div>
      </template>
    </Card>

    <!-- Initial State -->
    <Card v-else-if="!selectedAssignment">
      <template #content>
        <div class="text-center py-6">
          <i class="pi pi-info-circle text-6xl text-400 mb-3"></i>
          <h3 class="text-xl text-600 mb-2">Select Assignment</h3>
          <p class="text-500">
            Please select a subject, academic year, term, and exam type to begin entering scores.
          </p>
        </div>
      </template>
    </Card>

    <Toast ref="toast" />
    <ConfirmDialog />
  </div>
</template>

<script>
import { examService } from '@/service/api.service'

export default {
  name: 'ScoreEntry',
  
  data() {
    return {
      // Selection data
      selectedAssignment: null,
      selectedAcademicYear: null,
      selectedTerm: null,
      selectedExamType: null,
      autoSaveTimeout: null,

      // Options
      teacherAssignments: [],
      academicYears: [],
      terms: [
        { id: 1, name: 'Term 1' },
        { id: 2, name: 'Term 2' },
        { id: 3, name: 'Term 3' }
      ],
      examTypes: [],

      // Student data
      students: [],
      originalStudents: [],
      editingRows: [],

      // Loading states
      loading: false,
      saving: false,
      loadingAssignments: false,
      loadingYears: false,
      loadingTerms: false,
      loadingExamTypes: false,
      loadingScores: false,

      // Change tracking
      pendingChanges: new Map()
    }
  },

  computed: {
    canLoadStudents() {
      return this.selectedAssignment && 
             this.selectedAcademicYear && 
             this.selectedTerm && 
             this.selectedExamType
    },

    hasUnsavedChanges() {
      return this.pendingChanges.size > 0
    }
  },

  async mounted() {
    await this.initializeData()
  },

  beforeUnmount() {
    if (this.hasUnsavedChanges) {
      const answer = confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!answer) {
        return false
      }
    }
  },

  methods: {
    async initializeData() {
      try {
        await Promise.all([
          this.loadTeacherAssignments(),
          this.loadAcademicYears(),
          this.loadExamTypes()
        ])
        
        // Set current year if available
        if (this.academicYears.length > 0) {
          const currentYear = this.academicYears.find(y => y.isActive && !y.isClosed)
          this.selectedAcademicYear = currentYear ? currentYear.id : this.academicYears[0].id
        }

        // Set first term by default
        if (this.terms.length > 0) {
          this.selectedTerm = this.terms[0].id
        }
      } catch (error) {
        this.showError('Failed to initialize data. Please refresh the page.')
      }
    },

    async loadTeacherAssignments() {
      try {
        this.loadingAssignments = true
        console.log('🔄 Loading teacher assignments...')
        
        // Test connectivity first if in development
        if (this.isDevelopment) {
          try {
            const debugResult = await examService.debugAuth()
            console.log('🔍 Auth Debug Result:', debugResult)
          } catch (debugError) {
            console.warn('⚠️ Debug endpoint failed:', debugError.message)
          }
        }

        const assignments = await examService.getTeacherAssignments()
        console.log('✅ Teacher assignments loaded:', assignments)
        
        this.teacherAssignments = assignments.map(assignment => ({
          ...assignment,
          displayName: `${assignment.subjectName} - ${assignment.gradeName}`
        }))
        
        if (this.teacherAssignments.length === 0) {
          this.showInfo('No subject assignments found. Please contact your administrator.')
        }
      } catch (error) {
        console.error('❌ Failed to load teacher assignments:', error)
        
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          this.showError('Access denied. Please ensure you have Teacher role assigned.')
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          this.showError('Authentication required. Please log in again.')
        } else if (error.message.includes('Network error')) {
          this.showError('Cannot connect to server. Please check if the backend is running.')
        } else {
          this.showError('Failed to load teacher assignments. Please check your permissions.')
        }
      } finally {
        this.loadingAssignments = false
      }
    },

    async loadAcademicYears() {
      try {
        this.loadingYears = true
        console.log('🔄 Loading academic years...')
        this.academicYears = await examService.getAcademicYears()
        console.log('✅ Academic years loaded:', this.academicYears)
      } catch (error) {
        console.error('❌ Failed to load academic years:', error)
        if (error.message.includes('Network error')) {
          this.showError('Cannot connect to server. Please check if the backend is running.')
        } else {
          this.showError('Failed to load academic years')
        }
      } finally {
        this.loadingYears = false
      }
    },

    async loadExamTypes() {
      try {
        this.loadingExamTypes = true
        console.log('🔄 Loading exam types...')
        this.examTypes = await examService.getExamTypes()
        console.log('✅ Exam types loaded:', this.examTypes)
      } catch (error) {
        console.error('❌ Failed to load exam types:', error)
        if (error.message.includes('Network error')) {
          this.showError('Cannot connect to server. Please check if the backend is running.')
        } else {
          this.showError('Failed to load exam types')
        }
      } finally {
        this.loadingExamTypes = false
      }
    },

    async loadStudentScores() {
      if (!this.canLoadStudents) {
        this.showError('Please select all required fields before loading students')
        return
      }

      try {
        this.loadingScores = true
        this.students = []
        this.originalStudents = []
        this.pendingChanges.clear()

        // Get all students for the grade
        const gradeStudents = await examService.getStudentsByGrade(this.selectedAssignment.gradeId)

        if (gradeStudents.length === 0) {
          this.showInfo('No students found in the selected grade')
          return
        }

        // Get existing scores for the grade
        const scores = await examService.getGradeScores(
          this.selectedAssignment.gradeId,
          this.selectedAcademicYear,
          this.selectedTerm
        )

        // Filter scores for selected subject and exam type
        const relevantScores = scores.filter(score => 
          score.subjectId === this.selectedAssignment.subjectId &&
          score.examTypeId === this.selectedExamType
        )

        // Combine student data with scores
        this.students = gradeStudents.map(student => {
          const existingScore = relevantScores.find(score => score.studentId === student.id)
          return {
            studentId: student.id,
            studentName: student.fullName,
            studentNumber: student.studentNumber,
            currentScore: existingScore ? existingScore.score : null,
            scoreId: existingScore ? existingScore.id : null,
            lastUpdated: existingScore ? existingScore.recordedAt : null,
            recordedBy: existingScore ? existingScore.recordedByName : null
          }
        })

        // Sort students by name
        this.students.sort((a, b) => a.studentName.localeCompare(b.studentName))

        // Create a deep copy for tracking changes
        this.originalStudents = JSON.parse(JSON.stringify(this.students))

        this.showSuccess(`Loaded ${this.students.length} students`)

      } catch (error) {
        console.error('Failed to load student scores:', error)
        this.showError('Failed to load student scores')
      } finally {
        this.loadingScores = false
      }
    },

    onAssignmentChange() {
      this.students = []
      this.originalStudents = []
      this.pendingChanges.clear()
    },

    onFiltersChange() {
      // Clear students when any filter changes
      this.students = []
      this.originalStudents = []
      this.pendingChanges.clear()
    },

    scheduleAutoSave() {
  // Clear existing timeout
  if (this.autoSaveTimeout) {
    clearTimeout(this.autoSaveTimeout)
  }
  
  // Schedule new auto-save
  this.autoSaveTimeout = setTimeout(async () => {
    if (this.hasUnsavedChanges) {
      try {
        await this.saveAllChanges()
        this.showSuccess('Changes auto-saved. ZESCO got notthing on you!', 10000)
      } catch (error) {
        this.showError('Auto-save failed - please save manually')
      }
    }
  }, 2000) // 2 second delay
},

    onRowEditSave(event) {
    const { newData, index } = event
    this.students[index] = { ...newData }
    const student = this.students[index] 
    const originalStudent = this.originalStudents[index]

    // Check if score actually changed
    if (student.currentScore !== originalStudent.currentScore) {
      this.pendingChanges.set(student.studentId, {
        studentId: student.studentId,
        subjectId: this.selectedAssignment.subjectId,
        examTypeId: this.selectedExamType,
        score: student.currentScore,
        academicYear: this.selectedAcademicYear,
        term: this.selectedTerm
      })
      this.scheduleAutoSave();
      //this.showSuccess('Score Autosaved. Not even a power outage can lose this!');
    } else {
      this.pendingChanges.delete(student.studentId)
    }
},

    onRowEditCancel(event) {
      const { index } = event
      // Restore original value
      this.students[index] = { ...this.originalStudents[index] }
      this.pendingChanges.delete(this.students[index].studentId)
    },

    async saveAllChanges() {
      if (!this.hasUnsavedChanges) return

      try {
        this.saving = true
        const changes = Array.from(this.pendingChanges.values())

        // Submit each score individually using your existing endpoint
        const promises = changes.map(change => examService.submitScore(change))
        await Promise.all(promises)

        this.pendingChanges.clear()
        this.showSuccess(`Successfully saved ${changes.length} score(s)`)
        
        // Reload to get updated data
        await this.loadStudentScores()

      } catch (error) {
        console.error('Failed to save scores:', error)
        this.showError('Failed to save scores. Please try again.')
      } finally {
        this.saving = false
      }
    },

    resetChanges() {
      this.$confirm.require({
        message: 'Are you sure you want to reset all unsaved changes?',
        header: 'Reset Changes',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => {
          this.students = JSON.parse(JSON.stringify(this.originalStudents))
          this.pendingChanges.clear()
          this.showInfo('All changes have been reset')
        }
      })
    },

    async exportScores() {
      try {
        if (!this.canLoadStudents) {
          this.showError('Please select all required fields first')
          return
        }

        const blob = await examService.exportGradeBook(
          this.selectedAssignment.gradeId,
          this.selectedAssignment.subjectId,
          this.selectedAcademicYear,
          this.selectedTerm
        )
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `scores_${this.selectedAssignment.subjectName}_${this.selectedAcademicYear}_T${this.selectedTerm}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
        
      } catch (error) {
        console.error('Failed to export scores:', error)
        this.showError('Failed to export scores')
      }
    },

    // Utility methods
    getInitials(name) {
      if (!name) return '??'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    calculateGrade(score) {
      if (score === null || score === undefined) return ''
      if (score >= 90) return 'A'
      if (score >= 80) return 'B'
      if (score >= 70) return 'C'
      if (score >= 60) return 'D'
      return 'F'
    },

    getScoreSeverity(score) {
      if (score >= 80) return 'success'
      if (score >= 70) return 'info'
      if (score >= 60) return 'warning'
      return 'danger'
    },

    getGradeSeverity(grade) {
      if (['A', 'B'].includes(grade)) return 'success'
      if (grade === 'C') return 'info'
      if (grade === 'D') return 'warning'
      return 'danger'
    },

    formatDate(dateString) {
  if (!dateString) return ''
  
  const utcDate = new Date(dateString)
  
  // Manually add 2 hours for Zambia time
  const zambiaTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))
  
  return zambiaTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
},

    // Toast methods
    showSuccess(message, duration=3000) {
      this.$toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: duration
      })
    },

    showError(message) {
      this.$toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
      })
    },

    showInfo(message) {
      this.$toast.add({
        severity: 'info',
        summary: 'Info',
        detail: message,
        life: 3000
      })
    }
  }
}
</script>

<style scoped>
.score-entry {
  padding: 1rem;
}

.p-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem;
}

.p-datatable :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
}

.p-datatable :deep(.p-row-editor-init),
.p-datatable :deep(.p-row-editor-save),
.p-datatable :deep(.p-row-editor-cancel) {
  margin-right: 0.5rem;
}

.p-datatable :deep(.p-inputnumber-input) {
  width: 100% !important;
}
</style>