<template>
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
          </div>
        </template>
      </Dropdown>
      <small v-if="submitted && !selectedTeacher" class="p-error">
        Teacher is required.
      </small>
    </div>

    <div class="field mt-3">
      <label class="block font-medium mb-2">Subjects *</label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="subject in subjects" :key="subject.id" class="flex items-center">
          <input type="checkbox" :id="'subject-' + subject.id" :value="subject.id" v-model="selectedSubjects" :disabled="!selectedTeacher" />
          <label :for="'subject-' + subject.id" class="ml-2">{{ subject.name }}</label>
        </div>
      </div>
      <small v-if="submitted && selectedSubjects.length === 0" class="p-error">
        At least one subject is required.
      </small>
    </div>

    <div class="field mt-3">
      <label class="block font-medium mb-2">Classes *</label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="grade in grades" :key="grade.id" class="flex items-center">
          <input type="checkbox" :id="'grade-' + grade.id" :value="grade.id" v-model="selectedGrades" :disabled="!selectedTeacher" />
          <label :for="'grade-' + grade.id" class="ml-2">{{ grade.fullName }}</label>
        </div>
      </div>
      <small v-if="submitted && selectedGrades.length === 0" class="p-error">
        At least one class is required.
      </small>
    </div>

    <div v-if="getAssignmentPreview().length > 0" class="field">
      <label class="block font-medium mb-2">Assignment Preview</label>
      <div class="border-1 border-200 border-round p-3 bg-50">
        <div v-for="(preview, idx) in getAssignmentPreview()" :key="idx" class="text-sm mb-1">
          {{ preview }}
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
        label="Assign"
        icon="pi pi-check"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup>
import { subjectService } from '@/service/api.service'
import { ref, watch } from 'vue'

const props = defineProps({
  teachers: Array,
  subjects: Array,
  grades: Array
})
const emit = defineEmits(['assignment-created'])

const selectedTeacher = ref(null)
const selectedSubjects = ref([])
const selectedGrades = ref([])
const loading = ref(false)
const loadingTeachers = ref(false)
const submitted = ref(false)

// Track existing assignments for the selected teacher
const existingAssignments = ref([]) // Array of { subjectId, gradeId, assignmentId }

// When teacher changes, fetch their assignments
watch(selectedTeacher, async (teacherId) => {
  selectedSubjects.value = []
  selectedGrades.value = []
  existingAssignments.value = []
  if (!teacherId) return
  // For each subject, get assignments and filter for this teacher
  for (const subject of props.subjects) {
    try {
      const result = await subjectService.getSubjectAssignments(subject.id)
      if (result.assignments) {
        for (const a of result.assignments) {
          if (a.teacherId === teacherId) {
            existingAssignments.value.push({
              subjectId: subject.id,
              gradeId: a.gradeId,
              assignmentId: a.assignmentId
            })
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
  // Pre-check boxes for existing assignments
  selectedSubjects.value = Array.from(new Set(existingAssignments.value.map(a => a.subjectId)))
  selectedGrades.value = Array.from(new Set(existingAssignments.value.map(a => a.gradeId)))
})

function resetForm() {
  selectedTeacher.value = null
  selectedSubjects.value = []
  selectedGrades.value = []
  existingAssignments.value = []
  submitted.value = false
}

function getAssignmentPreview() {
  if (!selectedTeacher.value || selectedSubjects.value.length === 0 || selectedGrades.value.length === 0) return []
  const teacher = props.teachers.find(t => t.id === selectedTeacher.value)
  const previews = []
  for (const subjectId of selectedSubjects.value) {
    const subject = props.subjects.find(s => s.id === subjectId)
    for (const gradeId of selectedGrades.value) {
      const grade = props.grades.find(g => g.id === gradeId)
      previews.push(`${teacher?.fullName || 'Teacher'} → ${subject?.name || 'Subject'} → ${grade?.fullName || 'Class'}`)
    }
  }
  return previews
}

async function handleSubmit() {
  submitted.value = true
  if (!selectedTeacher.value || selectedSubjects.value.length === 0 || selectedGrades.value.length === 0) {
    return
  }
  try {
    loading.value = true
    // Build sets for easy comparison
    const selectedPairs = new Set(selectedSubjects.value.flatMap(subjectId => selectedGrades.value.map(gradeId => `${subjectId}|${gradeId}`)))
    const existingPairs = new Set(existingAssignments.value.map(a => `${a.subjectId}|${a.gradeId}`))
    // To assign: in selected but not in existing
    const toAssign = Array.from(selectedPairs).filter(pair => !existingPairs.has(pair))
    // To unassign: in existing but not in selected
    const toUnassign = existingAssignments.value.filter(a => !selectedPairs.has(`${a.subjectId}|${a.gradeId}`))
    // Assign new
    if (toAssign.length > 0) {
      const assignments = toAssign.map(pair => {
        const [subjectId, gradeId] = pair.split('|').map(Number)
        return {
          teacherId: selectedTeacher.value,
          subjectId,
          gradeId
        }
      })
      await subjectService.bulkAssignTeachersToSubjects({ assignments })
    }
    // Unassign removed
    for (const a of toUnassign) {
      await subjectService.removeTeacherAssignment(a.assignmentId)
    }
    window.$toast?.add({
      severity: 'success',
      summary: 'Success',
      detail: `${toAssign.length} assignment(s) created, ${toUnassign.length} assignment(s) removed`,
      life: 3000
    })
    resetForm()
    emit('assignment-created')
  } catch (error) {
    window.$toast?.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to update assignments',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
</script> 