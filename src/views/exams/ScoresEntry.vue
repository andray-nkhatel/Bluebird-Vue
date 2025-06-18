<template>
  <div class="score-entry">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-2xl font-semibold text-900 m-0">
          <i class="pi pi-pencil mr-2"></i>
          Mark Entry
        </h2>
        <p class="text-600 mt-1 mb-0">Enter and manage exam marks for your assigned subjects</p>
      </div>
      <div class="ml-auto">
      <Button
        label="Save All Changes"
        icon="pi pi-save"
        class="p-button-primary ml-auto"
        :disabled="!hasUnsavedChanges || loading"
        @click="saveChangesManually"
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
                <span class="font-medium">{{ slotProps.data.studentName }}</span>
              </div>
            </template>
          </Column>

          <!-- <Column field="studentNumber" header="Student #" style="min-width: 120px;">
            <template #body="slotProps">
              <span class="text-500">{{ slotProps.data.studentNumber }}</span>
            </template>
          </Column> -->

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

          <Column field="comments" header="Comments" style="min-width: 250px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.comments" class="flex align-items-center">
                <i class="pi pi-comment text-blue-500 mr-2"></i>
                <span class="text-sm text-600 line-height-3" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ slotProps.data.comments }}
                </span>
                <Button
                  icon="pi pi-eye"
                  size="small"
                  text
                  rounded
                  class="ml-2"
                  @click="viewComment(slotProps.data)"
                  v-tooltip.top="'View full comment'"
                />
              </div>
              <span v-else class="text-400 text-sm">No comments</span>
            </template>
            <template #editor="slotProps">
              <div>
                <Textarea
                  v-model="slotProps.data.comments"
                  :maxlength="100"
                  rows="3"
                  class="w-full"
                  placeholder="Enter comments (optional)"
                  :autoResize="true"
                />
                <div class="text-right text-sm text-gray-500 mt-1">
                  {{ 100 - (slotProps.data.comments?.length || 0) }} characters left
                </div>
              </div>
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
              <div v-if="slotProps.data.lastUpdated">
                <span class="text-500 text-sm">{{ formatDate(slotProps.data.lastUpdated) }}</span>
                <div v-if="slotProps.data.recordedBy" class="text-xs text-400 mt-1">
                  by {{ slotProps.data.recordedBy }}
                </div>
              </div>
              <span v-else class="text-400">Never</span>
            </template>
          </Column>

          <Column field="commentsInfo" header="Comment Info" style="min-width: 150px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.commentsUpdatedAt">
                <span class="text-500 text-sm">{{ formatDate(slotProps.data.commentsUpdatedAt) }}</span>
                <div v-if="slotProps.data.commentsUpdatedBy" class="text-xs text-400 mt-1">
                  by {{ slotProps.data.commentsUpdatedBy }}
                </div>
              </div>
              <span v-else class="text-400 text-sm">No comments</span>
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

    <!-- Comment Viewer Dialog -->
    <Dialog 
      v-model:visible="commentDialog.visible" 
      :header="`Comments for ${commentDialog.student?.studentName}`"
      :style="{ width: '600px' }"
      modal
    >
      <div class="mb-4">
        <label class="block font-medium mb-2">Comments:</label>
        <div class="p-3 border-1 surface-border border-round bg-surface-50">
          <p class="m-0 line-height-3" style="white-space: pre-wrap;">
            {{ commentDialog.student?.comments || 'No comments available' }}
          </p>
        </div>
      </div>
      
      <div v-if="commentDialog.student?.commentsUpdatedAt" class="text-sm text-500">
        <i class="pi pi-clock mr-1"></i>
        Last updated: {{ formatDate(commentDialog.student.commentsUpdatedAt) }}
        <span v-if="commentDialog.student.commentsUpdatedBy">
          by {{ commentDialog.student.commentsUpdatedBy }}
        </span>
      </div>

      <template #footer>
        <Button 
          label="Close" 
          icon="pi pi-times" 
          @click="commentDialog.visible = false"
          autofocus 
        />
      </template>
    </Dialog>

    <Toast ref="toast" />
    <ConfirmDialog />
  </div>
</template>

<script scope>
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
      pendingChanges: new Map(),

      // Comment dialog
      commentDialog: {
        visible: false,
        student: null
      }
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
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },

  beforeUnmount() {
    // Clear auto-save timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    // Remove visibility change listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)

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
            recordedBy: existingScore ? existingScore.recordedByName : null,
            // Add comment fields
            comments: existingScore ? existingScore.comments : null,
            commentsUpdatedAt: existingScore ? existingScore.commentsUpdatedAt : null,
            commentsUpdatedBy: existingScore ? existingScore.commentsUpdatedByName : null
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
        if (this.hasUnsavedChanges && !this.saving) {
          try {
            await this.saveAllChanges(true) // Pass flag to indicate auto-save
            this.showSuccess('Changes auto-saved. ZESCO got nothing on you!', 3000)
          } catch (error) {
            this.showError('Auto-save failed - please save manually')
          }
        }
      }, 2000) // 2 second delay
    },

    onRowEditSave(event) {
      const { newData, index } = event
      
      // Check if currently saving to prevent conflicts
      if (this.saving) {
        this.showInfo('Please wait for current save to complete')
        return
      }

      this.students[index] = { ...newData }
      const student = this.students[index] 
      const originalStudent = this.originalStudents[index]

      // Check if score or comments actually changed
      const scoreChanged = student.currentScore !== originalStudent.currentScore
      const commentsChanged = student.comments !== originalStudent.comments

      if (scoreChanged || commentsChanged) {
        this.pendingChanges.set(student.studentId, {
          studentId: student.studentId,
          subjectId: this.selectedAssignment.subjectId,
          examTypeId: this.selectedExamType,
          score: student.currentScore,
          academicYear: this.selectedAcademicYear,
          term: this.selectedTerm,
          comments: student.comments
        })
        this.scheduleAutoSave()
      } else {
        this.pendingChanges.delete(student.studentId)
      }
    },

    onRowEditCancel(event) {
      const { index } = event
      
      // Cancel any pending auto-save for this student
      const student = this.students[index]
      this.pendingChanges.delete(student.studentId)
      
      // If no more pending changes, clear the auto-save timeout
      if (this.pendingChanges.size === 0 && this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = null
      }
      
      // Restore original value
      this.students[index] = { ...this.originalStudents[index] }
    },

    // Enhanced method to handle manual save with user feedback
    async saveChangesManually() {
      if (!this.hasUnsavedChanges) {
        this.showInfo('No changes to save')
        return
      }

      // Cancel auto-save since we're doing manual save
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = null
      }

      await this.saveAllChanges(false)
    },

    async saveAllChanges(isAutoSave = false) {
      if (!this.hasUnsavedChanges || this.saving) return

      try {
        this.saving = true
        const changes = Array.from(this.pendingChanges.values())

        console.log(`💾 ${isAutoSave ? 'Auto-saving' : 'Saving'} ${changes.length} changes`)

        // Submit each score individually
        const results = await Promise.all(
          changes.map(change => examService.submitScore(change))
        )

        // Update the student records with the returned data instead of reloading
        this.updateStudentsWithSavedData(results)
        
        this.pendingChanges.clear()
        
        // Update originalStudents to reflect the new saved state
        this.originalStudents = JSON.parse(JSON.stringify(this.students))

        if (!isAutoSave) {
          this.showSuccess(`Successfully saved ${changes.length} score(s)`)
        }

      } catch (error) {
        console.error('Failed to save scores:', error)
        this.showError('Failed to save scores. Please try again.')
      } finally {
        this.saving = false
      }
    },

    // New method to update students with saved data without reloading
    updateStudentsWithSavedData(savedScores) {
      savedScores.forEach(savedScore => {
        const studentIndex = this.students.findIndex(s => s.studentId === savedScore.studentId)
        if (studentIndex !== -1) {
          // Update the student record with the saved data
          this.students[studentIndex] = {
            ...this.students[studentIndex],
            scoreId: savedScore.id,
            lastUpdated: savedScore.recordedAt,
            recordedBy: savedScore.recordedByName,
            commentsUpdatedAt: savedScore.commentsUpdatedAt,
            commentsUpdatedBy: savedScore.commentsUpdatedByName
          }
        }
      })
    },

    // Add this to handle tab visibility (auto-save when tab becomes hidden)
    handleVisibilityChange() {
      if (document.hidden && this.hasUnsavedChanges && !this.saving) {
        // User switched tabs/minimized - auto-save immediately
        this.saveAllChanges(true)
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
          // Clear any pending auto-save
          if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout)
            this.autoSaveTimeout = null
          }
          
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

    // Comment methods
    viewComment(student) {
      this.commentDialog.student = student
      this.commentDialog.visible = true
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

      // Format in military time (24-hour format)
      const day = zambiaTime.getUTCDate()
      const month = zambiaTime.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      const hours = zambiaTime.getUTCHours().toString().padStart(2, '0')
      const minutes = zambiaTime.getUTCMinutes().toString().padStart(2, '0')

      return `${month} ${day}, ${hours}:${minutes} hrs`
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
        life: 4000
      })
    },

    showWarn(message) {
      this.$toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: message,
        life: 4000
      })
    }
  },

  // Add computed property for development mode detection
  computed: {
    canLoadStudents() {
      return this.selectedAssignment && 
             this.selectedAcademicYear && 
             this.selectedTerm && 
             this.selectedExamType
    },

    hasUnsavedChanges() {
      return this.pendingChanges.size > 0
    },

    isDevelopment() {
      return process.env.NODE_ENV === 'development'
    }
  }
}
</script>