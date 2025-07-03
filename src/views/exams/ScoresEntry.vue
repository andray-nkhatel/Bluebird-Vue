<template>
  <div class="score-entry">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-0">
      <h2 class="text-xl md:text-2xl font-semibold text-900 m-0 flex items-center gap-2">
        <i class="pi pi-pencil"></i>
        Mark Entry
      </h2>
      <div class="w-full md:w-auto mt-2 md:mt-0">
        <Button
          label="Save All Changes"
          icon="pi pi-save"
          class="p-button-primary w-full md:w-auto"
          :disabled="!hasUnsavedChanges || loading"
          @click="saveChangesManually"
          :loading="saving"
        />
      </div>
    </div>

    <!-- Filters Card -->
    <Card class="mb-4">
      <template #content>
        <div class="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4">
          <div class="flex-1 min-w-0">
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
          <div class="flex-1 min-w-0">
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
          <div class="flex-1 min-w-0">
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
          <div class="flex-1 min-w-0">
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
        </div>
        <div class="flex flex-col md:flex-row justify-center items-center mt-4 gap-2">
          <div class="w-full md:w-auto">
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
 <!-- Scores DataTable (Desktop) -->
 <Card v-if="students.length > 0 && !isMobile">
      <!-- ... (title unchanged) ... -->
      <template #content>
        <div class="overflow-x-auto">
          <DataTable
            v-model:editingRows="editingRows"
            :value="students"
            :striped-rows="true"
            :row-hover="true"
            :show-gridlines="true"
            editMode="row"
            dataKey="studentId"
            :loading="loadingScores"
            responsiveLayout="scroll"
            :scrollable="true"
            scrollHeight="60vh"
            class="p-datatable-sm min-w-[600px] md:min-w-0"
            @row-edit-save="onRowEditSave"
            @row-edit-cancel="onRowEditCancel"
            @row-click="onRowClick"
            style="cursor:pointer"
          >
            <Column field="studentName" header="Student Name" style="width: 25%">
              <template #body="slotProps">
                <div class="flex align-items-center text-bold">
                  <span class="font-medium text-bold">{{ slotProps.data.studentName }}</span>
                </div>
              </template>
            </Column>
            <Column field="currentScore" header="Current Score" style="width: 25%" bodyStyle="text-align:center;">
              <template #body="slotProps">
                <Tag
                  v-if="slotProps.data.currentScore !== null && slotProps.data.currentScore !== undefined"
                  :value="slotProps.data.currentScore"
                  class="align-items-center justify-content-center"
                  :severity="getScoreSeverity(slotProps.data.currentScore)"
                />
                <span v-else class="text-400">No score</span>
              </template>
              <template #editor="slotProps">
                <InputNumber
                  v-model="slotProps.data.currentScore"
                  :min="0"
                  :max="150"
                  :maxFractionDigits="1"
                  class="w-full"
                  placeholder="Enter score"
                  :inputStyle="{ width: '100%' }"
                />
              </template>
            </Column>
            <Column v-if="selectedExamType === 3" field="comments" header="Comments" style="width: 25%" bodyStyle="text-align:center;">
              <template #body="slotProps">
                <div v-if="slotProps.data.comments" class="flex align-items-center">
                  <i class="pi pi-comment text-blue-500 mr-2"></i>
                  <span class="text-sm text-600 line-height-3 truncate max-w-[120px] md:max-w-[200px]">
                    {{ slotProps.data.comments }}
                  </span>
                  <Button
                    icon="pi pi-eye"
                    size="small"
                    text
                    rounded
                    class="ml-2"
                    @click.stop="viewComment(slotProps.data)"
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
                    class="w-full mt-2"
                    placeholder="Enter comment."
                    :autoResize="true"
                  />
                  <div class="text-right text-sm text-gray-500 mt-1">
                    {{ 100 - (slotProps.data.comments?.length || 0) }} characters left
                  </div>
                </div>
              </template>
            </Column>
            <Column :rowEditor="true" style="width: 25%" bodyStyle="text-align:center;">
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
            <template #footer> In total there are {{ students ? students.length : 0 }} students. </template>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- Multi-Subject Student Scores Dialog -->
    <Dialog
      v-model:visible="showStudentDialog"
      :header="selectedStudent ? selectedStudent.studentName + ' - All Subject Scores' : 'Student Scores'"
      :modal="true"
      :closable="true"
      :style="{ width: '600px' }"
      @hide="onDialogCancel"
    >
      <div v-if="selectedStudent">
        <div class="mb-4">
          <strong>Exam Type:</strong> {{ getExamTypeName(selectedExamType) }}<br />
          <strong>Term:</strong> {{ getTermName(selectedTerm) }}
        </div>
        <div class="flex flex-col gap-4">
          <div v-for="subject in dialogSubjects" :key="subject.id" class="mb-2">
            <label class="block mb-1 font-medium">{{ subject.name }}</label>
            <InputNumber
              v-model="dialogStudentScores[subject.id].score"
              :min="0"
              :max="150"
              :maxFractionDigits="1"
              class="w-full"
              placeholder="Enter score"
            />
            <div v-if="selectedExamType === 3" class="mt-2">
              <label class="block mb-1 font-medium">Comments</label>
              <Textarea
                v-model="dialogStudentScores[subject.id].comments"
                :maxlength="100"
                rows="2"
                class="w-full"
                placeholder="Enter comment."
                :autoResize="true"
              />
              <div class="text-right text-xs text-gray-500 mt-1">
                {{ 100 - (dialogStudentScores[subject.id].comments?.length || 0) }} characters left
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="onDialogCancel" />
        <Button label="Save" icon="pi pi-check" @click="onDialogSave" :disabled="!dialogHasChanges" />
      </template>


    </Dialog>
    <!-- Mobile Card Layout -->
<div v-if="students.length > 0 && isMobile" class="flex flex-col gap-3" header="Student Scores" :toggleable="true" :collapsed="false">
  <Panel
    v-for="(student, idx) in students"
    :key="student.studentId"
    :header="student.studentName"
    :toggleable="true"
    class="w-full"
  >
    <template #icons>
      <span v-if="student.currentScore !== null" :class="['badge', getScoreSeverityClass(student.currentScore)]">
        {{ student.currentScore }}
      </span>
      <span v-else class="text-gray-400 text-sm">No score</span>
    </template>
    <div class="mb-2">
      <label class="block text-xs font-medium mb-1">Score</label>
      <InputNumber
        v-model="student.currentScore"
        :min="0"
        :max="150"
        :maxFractionDigits="1"
        class="w-full"
        placeholder="Enter score"
        @blur="onMobileScoreEdit(idx)"
      />
    </div>
    <div v-if="selectedExamType === 3" class="mb-2">
      <label class="block text-xs font-medium mb-1">Comments</label>
      <Textarea
        v-model="student.comments"
        :maxlength="100"
        rows="2"
        class="w-full"
        placeholder="Enter comment"
        :autoResize="true"
        @blur="onMobileScoreEdit(idx)"
      />
      <div class="text-right text-xs text-gray-400">
        {{ 100 - (student.comments?.length || 0) }} left
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-2">
      <Button
        v-if="selectedExamType === 3 && student.comments"
        icon="pi pi-eye"
        size="small"
        text
        rounded
        @click="viewComment(student)"
        v-tooltip.top="'View full comment'"
      />
    </div>
    <div v-if="student.lastUpdated" class="text-xs text-gray-400 mt-1">
      <i class="pi pi-clock mr-1"></i>
      Last updated: {{ formatDate(student.lastUpdated) }}
      <span v-if="student.recordedBy">by {{ student.recordedBy }}</span>
    </div>
  </Panel>
  <div class="flex flex-col gap-2 mt-4">
    <Button
      label="Save All Changes"
      icon="pi pi-save"
      class="p-button-primary w-full"
      :disabled="!hasUnsavedChanges || loading"
      @click="saveChangesManually"
      :loading="saving"
    />
    <Button
      label="Reset All"
      icon="pi pi-refresh"
      class="p-button-secondary w-full"
      @click="resetChanges"
      :disabled="!hasUnsavedChanges"
    />
    <Button
      label="Export"
      icon="pi pi-download"
      class="p-button-help w-full"
      @click="exportMarkSchedule"
      :disabled="!canLoadStudents"
    />
  </div>
</div>
    <!-- Initial State -->
    <Card v-else-if="!selectedAssignment">
      <template #content>
        <div class="text-center py-6">
          <i class="pi pi-info-circle text-6xl text-400 mb-3"></i>
          <h3 class="text-lg md:text-xl text-600 mb-2">Select Assignment</h3>
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
      :style="{ width: '90vw', maxWidth: '600px' }"
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
          class="w-full md:w-auto"
        />
      </template>
    </Dialog>

    <Toast ref="toast" />
    <ConfirmDialog />
  </div>
</template>


<script>
import { examService } from '@/service/api.service';
import * as XLSX from 'xlsx';

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
      pendingChanges: [],

      // Comment dialog
      commentDialog: {
        visible: false,
        student: null
      },

      // Multi-subject dialog state
      showStudentDialog: false,
      selectedStudent: null,
      dialogSubjects: [],
      dialogStudentScores: {}, // { [subjectId]: { score, comments, scoreId } }
      dialogOriginalScores: {},

      // Mobile detection
      isMobile: false
    }
  },

  computed: {
    canLoadStudents() {
      return this.selectedAssignment &&
        this.selectedAcademicYear &&
        this.selectedTerm &&
        this.selectedExamType
    },

    showCommentsField() {
      return this.selectedExamType === 3;
    },

    hasUnsavedChanges() {
      return this.pendingChanges.length > 0
    },

    isDevelopment() {
      return process.env.NODE_ENV === 'development'
    },

    dialogHasChanges() {
      if (!this.dialogSubjects || !this.dialogOriginalScores) return false;
      return this.dialogSubjects.some(subject => {
        const orig = this.dialogOriginalScores[subject.id];
        const curr = this.dialogStudentScores[subject.id];
        return curr && orig && (curr.score !== orig.score || curr.comments !== orig.comments);
      });
    }
  },

  mounted() {
    this.initializeData()
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('resize', this.handleResize)
    if (this.hasUnsavedChanges) {
      const answer = confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!answer) {
        return false
      }
    }
  },

  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 768
    },

    async saveSingleChange(change) {
  const scoreData = {
    ...change,
    studentId: change.studentId,
    subjectId: change.subjectId,
    examTypeId: change.examTypeId,
    academicYearId: change.academicYear,
    term: change.term,
    score: change.score,
    gradeId: this.selectedAssignment.gradeId,
    comments: change.comments || '',
  };
  return await examService.submitScore(scoreData);
},

    exportScoresUI() {
      if (!this.students.length) {
        this.showWarn('No student data to export.');
        return;
      }
      // Prepare data for export
      const subject = this.selectedAssignment?.subjectName || '';
      const grade = this.selectedAssignment?.gradeName || '';
      const examType = this.examTypes.find(e => e.id === this.selectedExamType)?.name || '';
      const academicYear = this.academicYears.find(y => y.id === this.selectedAcademicYear)?.name || '';
      const term = this.terms.find(t => t.id === this.selectedTerm)?.name || '';

      const exportData = this.students.map(student => ({
        'Student Name': student.studentName,
        'Student Number': student.studentNumber,
        'Score': student.currentScore,
        ...(this.selectedExamType === 3 ? { 'Comments': student.comments } : {}),
        'Last Updated': student.lastUpdated ? this.formatDate(student.lastUpdated) : '',
        'Recorded By': student.recordedBy || ''
      }));

      // Add a header row with context info
      const contextRows = [
        [`Subject:`, subject],
        [`Grade:`, grade],
        [`Exam Type:`, examType],
        [`Academic Year:`, academicYear],
        [`Term:`, term],
        [],
      ];

      // Convert to worksheet
      const ws = XLSX.utils.json_to_sheet(exportData, { origin: contextRows.length });
      // Insert context rows at the top
      XLSX.utils.sheet_add_aoa(ws, contextRows, { origin: 0 });

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Scores');

      // Generate filename
      const filename = `Scores_${subject}_${grade}_${examType}_${academicYear}_${term}.xlsx`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\-\.]/g, '');

      // Export to file
      XLSX.writeFile(wb, filename);

      this.showSuccess('Scores exported successfully!');
    },

    async exportMarkSchedule() {
      if (!this.selectedAssignment || !this.selectedAcademicYear || !this.selectedTerm || !this.selectedExamType) {
        this.showWarn('Please select all required fields.');
        return;
      }

      try {
        // 1. Get all subjects for the selected grade
        const gradeId = this.selectedAssignment.gradeId;
        const academicYearId = this.selectedAcademicYear;
        const term = this.selectedTerm;
        const examTypeId = this.selectedExamType;

        // Get all assignments for this grade (to get all subjects)
        let assignments = this.teacherAssignments.filter(a => a.gradeId === gradeId);

        // Get unique subjects for the grade
        const subjects = [];
        const subjectMap = {};
        assignments.forEach(a => {
          if (!subjectMap[a.subjectId]) {
            subjects.push({ id: a.subjectId, name: a.subjectName });
            subjectMap[a.subjectId] = true;
          }
        });

        // 2. Get all students in the grade
        const students = await examService.getStudentsByGrade(gradeId);

        // 3. Get all scores for the grade, academic year, term
        const allScores = await examService.getGradeScores(gradeId, academicYearId, term);

        // 4. Build a map: { studentId: { subjectId: score } }
        const scoreMap = {};
        allScores.forEach(score => {
          if (score.examTypeId !== examTypeId) return;
          if (!scoreMap[score.studentId]) scoreMap[score.studentId] = {};
          scoreMap[score.studentId][score.subjectId] = score.score;
        });

        // 5. Build export data: one row per student, columns: Student Name, Subject1, Subject2, ...
        const exportData = students.map(student => {
          const row = { 'Student Name': student.fullName };
          subjects.forEach(subject => {
            row[subject.name] = (scoreMap[student.id] && scoreMap[student.id][subject.id] != null)
              ? scoreMap[student.id][subject.id]
              : '';
          });
          return row;
        });

        // 6. Add context rows at the top
        const gradeName = this.selectedAssignment.gradeName || '';
        const examTypeName = this.examTypes.find(e => e.id === examTypeId)?.name || '';
        const academicYearName = this.academicYears.find(y => y.id === academicYearId)?.name || '';
        const termName = this.terms.find(t => t.id === term)?.name || '';

        const contextRows = [
          [`Grade:`, gradeName],
          [`Exam Type:`, examTypeName],
          [`Academic Year:`, academicYearName],
          [`Term:`, termName],
          [],
        ];

        // 7. Convert to worksheet
        const ws = XLSX.utils.json_to_sheet(exportData, { origin: contextRows.length });
        XLSX.utils.sheet_add_aoa(ws, contextRows, { origin: 0 });

        // 8. Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mark Schedule');

        // 9. Generate filename
        const filename = `MarkSchedule_${gradeName}_${examTypeName}_${academicYearName}_${termName}.xlsx`
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_\-\.]/g, '');

        // 10. Export to file
        XLSX.writeFile(wb, filename);

        this.showSuccess('Mark Schedule exported successfully!');
      } catch (err) {
        this.showError('Failed to export Mark Schedule.');
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    },

    async initializeData() {
      try {
        await Promise.all([
          this.loadTeacherAssignments(),
          this.loadAcademicYears(),
          this.loadExamTypes()
        ])

        if (this.academicYears.length > 0) {
          const currentYear = this.academicYears.find(y => y.isActive && !y.isClosed)
          this.selectedAcademicYear = currentYear ? currentYear.id : this.academicYears[0].id
        }
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
        if (this.isDevelopment) {
          try {
            const debugResult = await examService.debugAuth()
            console.log('🔍 Auth Debug Result:', debugResult)
          } catch (debugError) {
            console.warn('⚠️ Debug endpoint failed:', debugError.message)
          }
        }
        const assignments = await examService.getTeacherAssignments()
        this.teacherAssignments = assignments.map(assignment => ({
          ...assignment,
          displayName: `${assignment.subjectName} - ${assignment.gradeName}`
        }))
        if (this.teacherAssignments.length === 0) {
          this.showInfo('No subject assignments found. Please contact your administrator.')
        }
      } catch (error) {
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
        this.academicYears = await examService.getAcademicYears()
      } catch (error) {
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
        this.examTypes = await examService.getExamTypes()
      } catch (error) {
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
        this.pendingChanges = []

        const gradeStudents = await examService.getStudentsByGrade(this.selectedAssignment.gradeId)

        if (gradeStudents.length === 0) {
          this.showInfo('No students found in the selected grade')
          return
        }

        const scores = await examService.getGradeScores(
          this.selectedAssignment.gradeId,
          this.selectedAcademicYear,
          this.selectedTerm
        )

        const relevantScores = scores.filter(score =>
          score.subjectId === this.selectedAssignment.subjectId &&
          score.examTypeId === this.selectedExamType
        )

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
            comments: existingScore ? existingScore.comments : null,
            commentsUpdatedAt: existingScore ? existingScore.commentsUpdatedAt : null,
            commentsUpdatedBy: existingScore ? existingScore.commentsUpdatedByName : null
          }
        })

        this.students.sort((a, b) => a.studentName.localeCompare(b.studentName))
        this.originalStudents = JSON.parse(JSON.stringify(this.students))
        this.showSuccess(`Loaded ${this.students.length} students`)

      } catch (error) {
        this.showError('Failed to load student scores')
      } finally {
        this.loadingScores = false
      }
    },

    onAssignmentChange() {
      this.students = []
      this.originalStudents = []
      this.pendingChanges = []
    },

    onFiltersChange() {
      this.students = []
      this.originalStudents = []
      this.pendingChanges = []
    },

    scheduleAutoSave() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
      }
      this.autoSaveTimeout = setTimeout(async () => {
        if (this.hasUnsavedChanges && !this.saving) {
          try {
            await this.saveAllChanges(true)
            this.showSuccess('Changes auto-saved. ZESCO got nothing on you!', 5000)
          } catch (error) {
            this.showError('Auto-save failed - please save manually')
          }
        }
      }, 2000)
    },

    onRowEditSave(event) {
      const { newData, index } = event
      if (this.saving) {
        this.showInfo('Please wait for current save to complete')
        return
      }
      this.students[index] = { ...newData }
      const student = this.students[index]
      const originalStudent = this.originalStudents[index]
      const scoreChanged = student.currentScore !== originalStudent.currentScore
      const commentsChanged = student.comments !== originalStudent.comments

      if (scoreChanged || commentsChanged) {
        const pendingChange = {
          studentId: student.studentId,
          subjectId: this.selectedAssignment.subjectId,
          examTypeId: this.selectedExamType,
          score: student.currentScore,
          academicYear: this.selectedAcademicYear,
          term: this.selectedTerm,
          comments: student.comments || ''
        }
        this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId)
        this.pendingChanges.push(pendingChange)
        this.scheduleAutoSave()
      } else {
        this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId)
      }
    },

    onRowEditCancel(event) {
      const { index } = event
      const student = this.students[index]
      this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId)
      if (this.pendingChanges.length === 0 && this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = null
      }
      this.students[index] = { ...this.originalStudents[index] }
    },

    async saveChangesManually() {
      if (!this.hasUnsavedChanges) {
        this.showInfo('No changes to save')
        return
      }
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = null
      }
      await this.saveAllChanges(false)
    },

    async saveAllChanges() {
      if (this.pendingChanges.length === 0) return;
      if (!this.selectedAssignment) {
        this.showError('Please select a subject and grade before saving scores.');
        return;
      }
      if (!this.selectedExamType) {
        this.showError('Please select an exam type before saving scores.');
        return;
      }
      if (!this.selectedAcademicYear) {
        this.showError('Please select an academic year before saving scores.');
        return;
      }
      if (!this.selectedTerm) {
        this.showError('Please select a term before saving scores.');
        return;
      }
      try {
        this.saving = true;
        const promises = this.pendingChanges.map(async change => {
          const scoreData = {
            ...change,
            studentId: change.studentId,
            subjectId: change.subjectId, // Use the subjectId from the change (for multi-subject)
            examTypeId: this.selectedExamType,
            academicYearId: this.selectedAcademicYear,
            term: this.selectedTerm,
            score: change.score,
            gradeId: this.selectedAssignment.gradeId,
            comments: change.comments || '',
          };
          return examService.submitScore(scoreData);
        });
        const results = await Promise.all(promises);
        this.updateStudentsWithSavedData(results);
        this.pendingChanges = [];
        this.originalStudents = JSON.parse(JSON.stringify(this.students));
        this.showSuccess(`Successfully saved ${results.length} score(s)`);
      } catch (error) {
        this.showError('Failed to save scores. Please try again.');
      } finally {
        this.saving = false;
      }
    },

    updateStudentsWithSavedData(savedScores) {
      // Only update the main students array for the currently selected subject
      savedScores.forEach(savedScore => {
        if (savedScore.subjectId === this.selectedAssignment.subjectId) {
          const studentIndex = this.students.findIndex(s => s.studentId === savedScore.studentId)
          if (studentIndex !== -1) {
            this.students[studentIndex] = {
              ...this.students[studentIndex],
              scoreId: savedScore.id,
              lastUpdated: savedScore.recordedAt,
              recordedBy: savedScore.recordedByName,
              commentsUpdatedAt: savedScore.commentsUpdatedAt,
              commentsUpdatedBy: savedScore.commentsUpdatedByName,
              currentScore: savedScore.score,
              comments: savedScore.comments
            }
          }
        }
      })
    },

    handleVisibilityChange() {
      if (document.hidden && this.hasUnsavedChanges && !this.saving) {
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
          if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout)
            this.autoSaveTimeout = null
          }
          this.students = JSON.parse(JSON.stringify(this.originalStudents))
          this.pendingChanges = []
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
        this.showError('Failed to export scores')
      }
    },

    viewComment(student) {
      this.commentDialog.student = student
      this.commentDialog.visible = true
    },

    getInitials(name) {
      if (!name) return '??'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    getScoreSeverity(score) {
      if (score >= 80) return 'success'
      if (score >= 70) return 'info'
      if (score >= 60) return 'warning'
      return 'danger'
    },

    getScoreSeverityClass(score) {
      if (score >= 80) return 'bg-green-100 text-green-800';
      if (score >= 70) return 'bg-blue-100 text-blue-800';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const utcDate = new Date(dateString)
      const zambiaTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))
      const day = zambiaTime.getUTCDate()
      const month = zambiaTime.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      const hours = zambiaTime.getUTCHours().toString().padStart(2, '0')
      const minutes = zambiaTime.getUTCMinutes().toString().padStart(2, '0')
      return `${month} ${day}, ${hours}:${minutes} hrs`
    },

    showSuccess(message, duration = 3000) {
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
    },

    async onMobileScoreEdit(idx) {
  const student = this.students[idx];
  const originalStudent = this.originalStudents[idx];
  const scoreChanged = student.currentScore !== originalStudent.currentScore;
  const commentsChanged = student.comments !== originalStudent.comments;

  if (scoreChanged || commentsChanged) {
    const pendingChange = {
      studentId: student.studentId,
      subjectId: this.selectedAssignment.subjectId,
      examTypeId: this.selectedExamType,
      score: student.currentScore,
      academicYear: this.selectedAcademicYear,
      term: this.selectedTerm,
      comments: student.comments || ''
    };
    // Optionally update pendingChanges for consistency
    this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId);
    this.pendingChanges.push(pendingChange);

    // Persist immediately
    try {
      this.saving = true;
      const result = await this.$options.methods.saveSingleChange.call(this, pendingChange);
      // Update originalStudents to reflect the saved value
      this.originalStudents[idx] = { ...student };
      // Remove from pendingChanges
      this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId);
      this.showSuccess('Score saved!');
    } catch (e) {
      this.showError('Failed to save score');
    } finally {
      this.saving = false;
    }
  }
},

    // --- Multi-subject dialog logic ---
    async onRowClick(event) {
      const student = event.data;
      this.selectedStudent = student;

      // 1. Get all subjects for the grade
      const gradeId = this.selectedAssignment.gradeId;
      let subjects = [];
      if (this.teacherAssignments && this.teacherAssignments.length > 0) {
        const subjectMap = {};
        this.teacherAssignments.forEach(a => {
          if (a.gradeId === gradeId && !subjectMap[a.subjectId]) {
            subjects.push({ id: a.subjectId, name: a.subjectName });
            subjectMap[a.subjectId] = true;
          }
        });
      }
      this.dialogSubjects = subjects;

      // 2. Get all scores for this student, examType, term, academicYear
      const scores = await examService.getStudentScores(
        student.studentId,
        this.selectedAcademicYear,
        this.selectedTerm
      );
      // scores: [{subjectId, examTypeId, score, comments, id}, ...]

      // 3. Build dialogStudentScores: { [subjectId]: { score, comments, scoreId } }
      this.dialogStudentScores = {};
      subjects.forEach(subject => {
        const s = scores.find(
          sc =>
            sc.subjectId === subject.id &&
            sc.examTypeId === this.selectedExamType
        );
        this.dialogStudentScores[subject.id] = {
          score: s ? s.score : null,
          comments: s ? s.comments : '',
          scoreId: s ? s.id : null
        };
      });

      // 4. Save original for change detection
      this.dialogOriginalScores = JSON.parse(JSON.stringify(this.dialogStudentScores));
      this.showStudentDialog = true;
    },

    onDialogCancel() {
      this.showStudentDialog = false;
      this.selectedStudent = null;
      this.dialogSubjects = [];
      this.dialogStudentScores = {};
      this.dialogOriginalScores = {};
    },

    async onDialogSave() {
      if (!this.selectedStudent) return;
      const studentId = this.selectedStudent.studentId;
      const academicYear = this.selectedAcademicYear;
      const term = this.selectedTerm;
      const examTypeId = this.selectedExamType;
      const gradeId = this.selectedAssignment.gradeId;

      // For each subject, if changed, add to pendingChanges and update students array
      for (const subject of this.dialogSubjects) {
        const orig = this.dialogOriginalScores[subject.id];
        const curr = this.dialogStudentScores[subject.id];
        if (
          curr.score !== orig.score ||
          curr.comments !== orig.comments
        ) {
          // Update students array if this is the current subject
          if (subject.id === this.selectedAssignment.subjectId) {
            const idx = this.students.findIndex(s => s.studentId === studentId);
            if (idx !== -1) {
              this.students[idx].currentScore = curr.score;
              if ('comments' in this.students[idx]) {
                this.students[idx].comments = curr.comments;
              }
            }
          }
          // Add to pendingChanges (replace if exists)
          this.pendingChanges = this.pendingChanges.filter(
            ch =>
              !(
                ch.studentId === studentId &&
                ch.subjectId === subject.id &&
                ch.examTypeId === examTypeId &&
                ch.academicYear === academicYear &&
                ch.term === term
              )
          );
          this.pendingChanges.push({
            studentId,
            subjectId: subject.id,
            examTypeId,
            score: curr.score,
            academicYear,
            term,
            comments: curr.comments || '',
            gradeId
          });
        }
      }
      this.scheduleAutoSave();
      this.showStudentDialog = false;
      this.selectedStudent = null;
      this.dialogSubjects = [];
      this.dialogStudentScores = {};
      this.dialogOriginalScores = {};
    },

    getExamTypeName(typeId) {
      const found = this.examTypes.find(e => e.id === typeId);
      return found ? found.name : '';
    },
    getTermName(termId) {
      const found = this.terms.find(t => t.id === termId);
      return found ? found.name : '';
    }
  }
}
</script>





<style scoped>
/* Extra mobile tweaks */
@media (max-width: 768px) {
  .score-entry .p-card {
    padding: 0.5rem !important;
  }
  .score-entry .p-card-content {
    padding: 0.5rem !important;
  }
  .score-entry .p-datatable {
    font-size: 0.95rem;
  }
  .score-entry .p-datatable .p-datatable-thead > tr > th,
  .score-entry .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.5rem 0.25rem;
  }
  .score-entry .p-dialog {
    width: 95vw !important;
    max-width: 95vw !important;
  }
  .score-entry .p-toast {
    width: 95vw !important;
    left: 2.5vw !important;
  }
  .score-entry .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .student-card {
    border-radius: 0.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    border: 1px solid #e5e7eb;
    background: #fff;
  }
  .badge {
    display: inline-block;
    padding: 0.25em 0.75em;
    border-radius: 9999px;
    font-size: 0.95em;
    font-weight: 600;
    min-width: 2.5em;
    text-align: center;
  }
}
</style>