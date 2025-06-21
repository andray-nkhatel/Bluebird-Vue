<template>
  <div class="assign-teacher-subject">
    <Card>
      <template #title>
        <i class="pi pi-user-plus mr-2"></i>
        Assign Teacher to Subject(s)
      </template>
      
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <div class="field">
            <label for="teacher" class="block font-medium mb-2">Teacher *</label>
            <Dropdown
              id="teacher"
              v-model="selectedTeacher"
              :options="teachers"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Select a teacher"
              :loading="loadingTeachers"
              :class="{ 'p-invalid': submitted && !selectedTeacher }"
              class="w-full"
              filter
              filterBy="fullName"
            >
              <template #option="slotProps">
                <div class="flex flex-column">
                  <span class="font-medium">{{ slotProps.option.fullName }}</span>
                  <!-- <span class="text-sm text-500">{{ slotProps.option.email }}</span> -->
                </div>
              </template>
            </Dropdown>
            <small v-if="submitted && !selectedTeacher" class="p-error">
              Teacher is required.
            </small>
          </div>

          <!-- Assignment Mode Toggle -->
          <div class="field">
            <label class="block font-medium mb-2">Assignment Mode</label>
            <div class="flex gap-3">
              <div class="flex align-items-center">
                <RadioButton 
                  id="single" 
                  v-model="assignmentMode" 
                  value="single" 
                />
                <label for="single" class="ml-2">Single Subject - Single Grade</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton 
                  id="multipleGrades" 
                  v-model="assignmentMode" 
                  value="multipleGrades" 
                />
                <label for="multipleGrades" class="ml-2">Single Subject - Multiple Grades</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton 
                  id="bulk" 
                  v-model="assignmentMode" 
                  value="bulk" 
                />
                <label for="bulk" class="ml-2">Bulk Assignment</label>
              </div>
            </div>
          </div>

          <!-- Single Subject Selection for single and multipleGrades modes -->
          <div v-if="assignmentMode === 'single' || assignmentMode === 'multipleGrades'" class="field">
            <label for="subject" class="block font-medium mb-2">Subject *</label>
            <Dropdown
              id="subject"
              v-model="selectedSubject"
              :options="subjects"
              optionLabel="name"
              optionValue="id"
              placeholder="Select a subject"
              :loading="loadingSubjects"
              :class="{ 'p-invalid': submitted && !selectedSubject }"
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex align-items-center">
                  <span class="font-medium">{{ slotProps.option.name }}</span>
                  <span class="text-sm text-500 ml-2">({{ slotProps.option.code }})</span>
                </div>
              </template>
            </Dropdown>
            <small v-if="submitted && !selectedSubject && (assignmentMode === 'single' || assignmentMode === 'multipleGrades')" class="p-error">
              Subject is required.
            </small>
          </div>

          <!-- Single Grade Selection for single mode -->
          <div v-if="assignmentMode === 'single'" class="field">
            <label for="grade" class="block font-medium mb-2">Grade *</label>
            <Dropdown
              id="grade"
              v-model="selectedGrade"
              :options="grades"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Select a grade"
              :loading="loadingGrades"
              :class="{ 'p-invalid': submitted && !selectedGrade }"
              class="w-full"
            />
            <small v-if="submitted && !selectedGrade && assignmentMode === 'single'" class="p-error">
              Grade is required.
            </small>
          </div>

          <!-- Multiple Grades Selection for multipleGrades mode -->
          <div v-if="assignmentMode === 'multipleGrades'" class="field">
            <label for="grades" class="block font-medium mb-2">Grades *</label>
            <MultiSelect
              id="grades"
              v-model="selectedGrades"
              :options="grades"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Select grades"
              :loading="loadingGrades"
              :class="{ 'p-invalid': submitted && (!selectedGrades || selectedGrades.length === 0) }"
              class="w-full"
              :maxSelectedLabels="3"
              filter
            />
            <small v-if="submitted && (!selectedGrades || selectedGrades.length === 0) && assignmentMode === 'multipleGrades'" class="p-error">
              At least one grade is required.
            </small>
          </div>

          <!-- Bulk Assignment Mode -->
          <div v-if="assignmentMode === 'bulk'" class="field">
            <label class="block font-medium mb-2">Bulk Assignments *</label>
            <div class="border-1 border-200 border-round p-3">
              <div class="flex justify-content-between align-items-center mb-3">
                <!-- <span class="font-medium">Assignment List</span> -->
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="Add Assignment"
                  size="small"
                  class="mx-auto"
                  @click="addBulkAssignment"
                />
              </div>
              
              <div v-if="bulkAssignments.length === 0" class="text-center text-500 py-4">
                No assignments added yet. Click "Add Assignment" to start.
              </div>
              
              <div v-for="(assignment, index) in bulkAssignments" :key="index" class="grid gap-2 mb-3 p-3 border-1 border-200 border-round">
                <div class="col-12 md:col-5">
                  <label class="block text-sm font-medium mb-1">Subject</label>
                  <Dropdown
                    v-model="assignment.subjectId"
                    :options="subjects"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select subject"
                    class="w-full"
                  />
                </div>
                <div class="col-12 md:col-5">
                  <label class="block text-sm font-medium mb-1">Grade</label>
                  <Dropdown
                    v-model="assignment.gradeId"
                    :options="grades"
                    optionLabel="fullName"
                    optionValue="id"
                    placeholder="Select grade"
                    class="w-full"
                  />
                </div>
                <div class="col-12 md:col-2 flex align-items-end">
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    @click="removeBulkAssignment(index)"
                  />
                </div>
              </div>
            </div>
            <small v-if="submitted && bulkAssignments.length === 0 && assignmentMode === 'bulk'" class="p-error">
              At least one assignment is required.
            </small>
          </div>

          <!-- Assignment Preview -->
          <div v-if="getAssignmentPreview()" class="field">
            <label class="block font-medium mb-2">Assignment Preview</label>
            <div class="border-1 border-200 border-round p-3 bg-50">
              <div class="flex align-items-center mb-2">
                <i class="pi pi-info-circle text-blue-500 mr-2"></i>
                <span class="font-medium">{{ getAssignmentPreview() }}</span>
              </div>
              <div v-if="assignmentMode === 'multipleGrades'" class="flex flex-wrap gap-1">
                <Tag 
                  v-for="gradeId in selectedGrades" 
                  :key="gradeId"
                  :value="getGradeName(gradeId)"
                  severity="info"
                />
              </div>
              <div v-if="assignmentMode === 'bulk'" class="flex flex-column gap-1">
                <div v-for="(assignment, index) in bulkAssignments" :key="index" class="text-sm">
                  {{ getSubjectName(assignment.subjectId) }} → {{ getGradeName(assignment.gradeId) }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-content-end gap-2 mt-4">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              @click="resetForm"
              :disabled="loading"
            />
            <Button
              type="submit"
              :label="getSubmitButtonLabel()"
              icon="pi pi-check"
              :loading="loading"
            />

            <Button 
              type="button"
              label="Transfer Assignments" 
              icon="pi pi-arrow-right" 
              @click="showTransferDialog" 
              
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- Assignment History -->
    <Card v-if="recentAssignments.length > 0" class="mt-4"> 
      <!-- <Card class="mt-4"> -->
      <template #title>
        <i class="pi pi-history mr-2"></i>
        Recent Assignments
      </template>
      
      <template #content>
        <DataTable
          :value="recentAssignments"
          :rows="10"
          :paginator="recentAssignments.length > 10"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column field="teacherName" header="Teacher" />
          <Column field="subjectName" header="Subject" />
          <Column field="gradeName" header="Grade" />
          <Column field="assignedDate" header="Assigned Date">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.assignedDate) }}
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                @click="confirmDelete(slotProps.data)"
                v-tooltip="'Remove Assignment'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Assignment Results Modal -->
    <Dialog 
      v-model:visible="showResultsModal" 
      :style="{ width: '50rem' }" 
      header="Assignment Results"
      :modal="true"
    >
      <div v-if="assignmentResults">
        <div class="mb-3">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span class="font-medium text-green-700">
              {{ assignmentResults.successful || assignmentResults.created || 0 }} assignment(s) created successfully
            </span>
          </div>
          
          <div v-if="assignmentResults.errors && assignmentResults.errors.length > 0" class="mt-3">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-exclamation-triangle text-orange-500"></i>
              <span class="font-medium text-orange-700">
                {{ assignmentResults.errors.length }} assignment(s) skipped
              </span>
            </div>
            <ul class="list-none p-0 m-0">
              <li v-for="error in assignmentResults.errors" :key="error" class="text-sm text-600 mb-1">
                • {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Close" 
          icon="pi pi-times" 
          @click="showResultsModal = false" 
          autofocus 
        />
      </template>
    </Dialog>

    <!-- Transfer Assignments Modal -->
    <Dialog 
      v-model:visible="showTransferModal" 
      :style="{ width: '40rem' }" 
      header="Transfer Teacher Assignments"
      :modal="true"
    >
      <form @submit.prevent="handleTransfer" class="p-fluid">
        <div class="field">
          <label for="fromTeacher" class="block font-medium mb-2">From Teacher *</label>
          <Dropdown
            id="fromTeacher"
            v-model="transferForm.fromTeacherId"
            :options="teachers"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Select teacher to transfer from"
            class="w-full"
          />
        </div>
        
        <div class="field">
          <label for="toTeacher" class="block font-medium mb-2">To Teacher *</label>
          <Dropdown
            id="toTeacher"
            v-model="transferForm.toTeacherId"
            :options="teachers"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Select teacher to transfer to"
            class="w-full"
          />
        </div>
      </form>
      
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          severity="secondary"
          @click="showTransferModal = false" 
        />
        <Button 
          label="Transfer" 
          icon="pi pi-arrow-right" 
          @click="handleTransfer"
          :loading="transferLoading"
        />
      </template>
    </Dialog>

    <Toast ref="toast" />
    <ConfirmDialog />
  </div>
</template>

<script>
import { gradeService, subjectService, userService } from '@/service/api.service';

export default {
  name: 'AssignTeacherToSubject',
  
  data() {
    return {
      assignmentMode: 'single', // 'single', 'multipleGrades', 'bulk'
      selectedTeacher: null,
      selectedSubject: null,
      selectedGrade: null,
      selectedGrades: [],
      bulkAssignments: [],
      teachers: [],
      subjects: [],
      grades: [],
      recentAssignments: [],
      loading: false,
      loadingTeachers: false,
      loadingSubjects: false,
      loadingGrades: false,
      submitted: false,
      showResultsModal: false,
      showTransferModal: false,
      assignmentResults: null,
      transferForm: {
        fromTeacherId: null,
        toTeacherId: null
      },
      transferLoading: false
    }
  },

  watch: {
    assignmentMode(newMode) {
      // Clear selections when switching modes
      this.selectedSubject = null;
      this.selectedGrade = null;
      this.selectedGrades = [];
      this.bulkAssignments = [];
      this.submitted = false;
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      await Promise.all([
        this.loadTeachers(),
        this.loadSubjects(),
        this.loadGrades(),
        this.loadRecentAssignments()
      ])
    },

    async loadTeachers() {
      try {
        this.loadingTeachers = true
        const allUsers = await userService.getAll()
        this.teachers = allUsers.filter(user => 
          user.role === 'Teacher' && user.isActive
        )
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teachers',
          life: 3000
        })
      } finally {
        this.loadingTeachers = false
      }
    },

    async loadSubjects() {
      try {
        this.loadingSubjects = true
        this.subjects = await subjectService.getAll()
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load subjects',
          life: 3000
        })
      } finally {
        this.loadingSubjects = false
      }
    },

    async loadGrades() {
      try {
        this.loadingGrades = true
        this.grades = await gradeService.getAll()
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load grades',
          life: 3000
        })
      } finally {
        this.loadingGrades = false
      }
    },

    async loadRecentAssignments() {
      try {
        // Load recent assignments from all subjects
        const allAssignments = []
        for (const subject of this.subjects) {
          try {
            const assignments = await subjectService.getSubjectAssignments(subject.id)
            if (assignments.assignments) {
              allAssignments.push(...assignments.assignments.map(a => ({
                id: a.assignmentId,
                teacherId: a.teacherId,
                teacherName: a.teacherName,
                subjectId: subject.id,
                subjectName: subject.name,
                gradeId: a.gradeId,
                gradeName: a.gradeName,
                assignedDate: new Date().toISOString(), // API doesn't provide this
                isActive: a.isActive
              })))
            }
          } catch (error) {
            console.warn(`Failed to load assignments for subject ${subject.id}:`, error)
          }
        }
        this.recentAssignments = allAssignments.slice(0, 50) // Limit to recent 50
      } catch (error) {
        console.error('Failed to load recent assignments:', error)
      }
    },

    async handleSubmit() {
      this.submitted = true

      // Validation
      if (!this.selectedTeacher) {
        return
      }

      if (this.assignmentMode === 'single') {
        if (!this.selectedSubject || !this.selectedGrade) {
          return
        }
      } else if (this.assignmentMode === 'multipleGrades') {
        if (!this.selectedSubject || !this.selectedGrades || this.selectedGrades.length === 0) {
          return
        }
      } else if (this.assignmentMode === 'bulk') {
        if (this.bulkAssignments.length === 0) {
          return
        }
        // Validate each bulk assignment
        const hasInvalidAssignment = this.bulkAssignments.some(a => !a.subjectId || !a.gradeId)
        if (hasInvalidAssignment) {
          this.$toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'All assignments must have both subject and grade selected',
            life: 3000
          })
          return
        }
      }

      try {
        this.loading = true
        
        if (this.assignmentMode === 'single') {
          await this.handleSingleAssignment()
        } else if (this.assignmentMode === 'multipleGrades') {
          await this.handleMultipleGradesAssignment()
        } else if (this.assignmentMode === 'bulk') {
          await this.handleBulkAssignment()
        }

        this.resetForm()
        this.$emit('assignment-created')
        await this.loadRecentAssignments()
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to assign teacher to subject(s)'
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        })
      } finally {
        this.loading = false
      }
    },

    async handleSingleAssignment() {
      // POST /api/subjects/{subjectId}/assign-teacher
      const assignmentData = {
        teacherId: this.selectedTeacher,
        gradeId: this.selectedGrade
      }

      await subjectService.assignTeacher(this.selectedSubject, assignmentData)

      this.$toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Teacher assigned to subject successfully',
        life: 3000
      })
    },

    async handleMultipleGradesAssignment() {
      // POST /api/subjects/{subjectId}/assign-teacher-multiple-grades
      const assignmentData = {
        teacherId: this.selectedTeacher,
        gradeIds: this.selectedGrades
      }

      const response = await subjectService.assignTeacherToMultipleGrades(this.selectedSubject, assignmentData)

      this.$toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Teacher assigned to ${response.assignedGrades} grade(s) successfully`,
        life: 3000
      })

      if (response.skippedGrades > 0) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `${response.skippedGrades} grade(s) were skipped (already assigned)`,
          life: 5000
        })
      }
    },

    async handleBulkAssignment() {
      // POST /api/subjects/bulk-assign
      const assignmentData = {
        assignments: this.bulkAssignments.map(a => ({
          teacherId: this.selectedTeacher,
          subjectId: a.subjectId,
          gradeId: a.gradeId
        }))
      }

      const response = await subjectService.bulkAssignTeachersToSubjects(assignmentData)

      // Show results modal for bulk assignments
      this.assignmentResults = response
      this.showResultsModal = true

      // Also show toast for quick feedback
      if (response.successful > 0) {
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `${response.successful} assignment(s) created successfully`,
          life: 3000
        })
      }
    },

    async handleTransfer() {
      if (!this.transferForm.fromTeacherId || !this.transferForm.toTeacherId) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select both teachers',
          life: 3000
        })
        return
      }

      if (this.transferForm.fromTeacherId === this.transferForm.toTeacherId) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Cannot transfer to the same teacher',
          life: 3000
        })
        return
      }

      try {
        this.transferLoading = true
        
        // POST /api/subjects/transfer-assignments
        const response = await subjectService.transferAssignments(this.transferForm)
        
        this.showTransferModal = false
        this.transferForm = { fromTeacherId: null, toTeacherId: null }
        
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `${response.transferred} assignment(s) transferred successfully`,
          life: 3000
        })

        if (response.conflicts > 0) {
          this.$toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: `${response.conflicts} assignment(s) had conflicts and were skipped`,
            life: 5000
          })
        }

        await this.loadRecentAssignments()
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Failed to transfer assignments',
          life: 5000
        })
      } finally {
        this.transferLoading = false
      }
    },

    addBulkAssignment() {
      this.bulkAssignments.push({
        subjectId: null,
        gradeId: null
      })
    },

    removeBulkAssignment(index) {
      this.bulkAssignments.splice(index, 1)
    },

    resetForm() {
      this.selectedTeacher = null
      this.selectedSubject = null
      this.selectedGrade = null
      this.selectedGrades = []
      this.bulkAssignments = []
      this.submitted = false
      this.assignmentMode = 'single'
      this.assignmentResults = null
    },

    getSubjectName(subjectId) {
      const subject = this.subjects.find(s => s.id === subjectId)
      return subject ? `${subject.name} (${subject.code})` : 'Unknown Subject'
    },

    getGradeName(gradeId) {
      const grade = this.grades.find(g => g.id === gradeId)
      return grade ? grade.fullName : 'Unknown Grade'
    },

    getAssignmentPreview() {
      if (this.assignmentMode === 'single') {
        return 'Single assignment will be created'
      } else if (this.assignmentMode === 'multipleGrades') {
        return `${this.selectedGrades?.length || 0} assignment(s) will be created for selected grades`
      } else if (this.assignmentMode === 'bulk') {
        return `${this.bulkAssignments.length} assignment(s) will be created`
      }
      return null
    },

    getSubmitButtonLabel() {
      if (this.assignmentMode === 'single') {
        return 'Assign Teacher'
      } else if (this.assignmentMode === 'multipleGrades') {
        return `Assign to ${this.selectedGrades?.length || 0} Grade(s)`
      } else if (this.assignmentMode === 'bulk') {
        return `Create ${this.bulkAssignments.length} Assignment(s)`
      }
      return 'Submit'
    },

    confirmDelete(assignment) {
      this.$confirm.require({
        message: `Are you sure you want to remove ${assignment.teacherName} from ${assignment.subjectName} (${assignment.gradeName})?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => {
          this.deleteAssignment(assignment)
        }
      })
    },

    async deleteAssignment(assignment) {
      try {
        // DELETE /api/subjects/assignments/{assignmentId}
        await subjectService.removeTeacherAssignment(assignment.id)
        
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Assignment removed successfully',
          life: 3000
        })
        
        await this.loadRecentAssignments()
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove assignment',
          life: 3000
        })
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    showTransferDialog() {
      this.showTransferModal = true
    }
  }
}
</script>

<style scoped>
.assign-teacher-subject {
  max-width: 900px;
  margin: 0 auto;
}

.field {
  margin-bottom: 1.5rem;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
}

.col-12 {
  flex: 0 0 100%;
  padding: 0.5rem;
}

.col-5 {
  flex: 0 0 41.66667%;
  padding: 0.5rem;
}

.col-2 {
  flex: 0 0 16.66667%;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .col-5,
  .col-2 {
    flex: 0 0 100%;
  }
}
</style>