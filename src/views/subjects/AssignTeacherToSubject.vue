<template>
    <div class="assign-teacher-subject ">
      <Card>
        <template #title>
          <i class="pi pi-user-plus mr-2"></i>
          Assign Teacher to Subject
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
                filterBy="fullName,email,username"
              >
                <template #option="slotProps">
                  <div class="flex flex-column">
                    <span class="font-medium">{{ slotProps.option.fullName }}</span>
                    <!-- <small class="text-500">{{ slotProps.option.email }}</small>
                    <small class="text-400">@{{ slotProps.option.username }}</small> -->
                  </div>
                </template>
              </Dropdown>
              <small v-if="submitted && !selectedTeacher" class="p-error">
                Teacher is required.
              </small>
            </div>
  
            <div class="field">
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
              <small v-if="submitted && !selectedSubject" class="p-error">
                Subject is required.
              </small>
            </div>
  
            <div class="field">
              <label for="grade" class="block font-medium mb-2">Grade *</label>
              <Dropdown
                id="grade"
                v-model="selectedGrade"
                :options="grades"
                optionLabel="name"
                optionValue="id"
                placeholder="Select a grade"
                :loading="loadingGrades"
                :class="{ 'p-invalid': submitted && !selectedGrade }"
                class="w-full"
              />
              <small v-if="submitted && !selectedGrade" class="p-error">
                Grade is required.
              </small>
            </div>
  
            <div class="field">
              <label for="notes" class="block font-medium mb-2">Notes (Optional)</label>
              <Textarea
                id="notes"
                v-model="notes"
                rows="3"
                placeholder="Any additional notes about this assignment..."
                class="w-full"
              />
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
                label="Assign Teacher"
                icon="pi pi-check"
                :loading="loading"
              />
            </div>
          </form>
        </template>
      </Card>
  
      <!-- Assignment History -->
      <Card v-if="recentAssignments.length > 0" class="mt-4">
        <template #title>
          <i class="pi pi-history mr-2"></i>
          Recent Assignments
        </template>
        
        <template #content>
          <DataTable
            :value="recentAssignments"
            :rows="5"
            :paginator="recentAssignments.length > 5"
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
  
      <Toast ref="toast" />
      <ConfirmDialog />
    </div>
  </template>
  
  <script>
  import { gradeService, subjectService, userService } from '@/service/api.service'; // Assuming you have a grade service

  
  export default {
    name: 'AssignTeacherToSubject',
    
    data() {
      return {
        selectedTeacher: null,
        selectedSubject: null,
        selectedGrade: null,
        notes: '',
        teachers: [],
        subjects: [],
        grades: [],
        recentAssignments: [],
        loading: false,
        loadingTeachers: false,
        loadingSubjects: false,
        loadingGrades: false,
        submitted: false
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
          // Filter users to get only those with 'Teacher' role and are active
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
          // Assuming you have a gradeService
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
          // This would be a separate endpoint to get recent teacher-subject assignments
          // For now, we'll leave it empty
          this.recentAssignments = []
        } catch (error) {
          console.error('Failed to load recent assignments:', error)
        }
      },
  
      async handleSubmit() {
        this.submitted = true
  
        if (!this.selectedTeacher || !this.selectedSubject || !this.selectedGrade) {
          return
        }
  
        try {
          this.loading = true
          
          const assignmentData = {
            teacherId: this.selectedTeacher,
            gradeId: this.selectedGrade,
            notes: this.notes
          }
  
          await subjectService.assignTeacher(this.selectedSubject, assignmentData)
  
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Teacher assigned to subject successfully',
            life: 3000
          })
  
          this.resetForm()
          this.$emit('assignment-created')
          await this.loadRecentAssignments()
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to assign teacher to subject'
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
  
      resetForm() {
        this.selectedTeacher = null
        this.selectedSubject = null
        this.selectedGrade = null
        this.notes = ''
        this.submitted = false
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
          // This would call a delete endpoint
          // await teacherService.removeSubjectAssignment(assignment.id)
          
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
      }
    }
  }
  </script>
  
  <style scoped>
  .assign-teacher-subject {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .field {
    margin-bottom: 1.5rem;
  }
  </style>