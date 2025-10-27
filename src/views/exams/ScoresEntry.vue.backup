<template>
  <div class="score-entry bg-surface-0 p-4 md:p-8 rounded-xl shadow-md">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0 border-b pb-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-10 h-10">
          <i class="pi pi-pencil text-2xl"></i>
        </span>
        <h2 class="text-2xl md:text-3xl font-bold text-900 m-0">Mark Entry</h2>
      </div>
      <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        <!-- Bulk Absent Management Button -->
         <!--
        <Button
          label="Manage Absent"
          icon="pi pi-users"
          class="p-button-secondary w-full md:w-auto shadow-sm"
          @click="showBulkAbsentDialog = true"
          :disabled="!students.length"
          v-tooltip.top="'Bulk mark students as absent or present'"
        /> -->
        <Button
          id="mark-schedule-btn"
          label="Mark-Schedule"
          icon="pi pi-file-pdf"
          class="p-button-warning w-full md:w-auto shadow-sm"
          @click="exportMarkSchedulePdf"
          :disabled="!canLoadStudents"
          v-tooltip.top="{ value: 'Done entering results for particular test in your class? - you can download the grade book', class: 'max-w-xs', showDelay: 200, hideDelay: 100 }"
          aria-label="Download Markschedule"
        />
      </div>
    </div>

    <!-- Filters Card -->
    <Card class="mb-6 bg-surface-50 border-0 shadow-none rounded-lg">
      <template #content>
        <div class="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6">
          <div class="flex-1 min-w-[220px]">
            <label for="assignment" class="block font-semibold mb-2 text-900">Subject & Grade *</label>
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
          <div class="flex-1 min-w-[180px]">
            <label for="academicYear" class="block font-semibold mb-2 text-900">Academic Year *</label>
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
          <div class="flex-1 min-w-[140px]">
            <label for="term" class="block font-semibold mb-2 text-900">Term *</label>
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
          <div class="flex-1 min-w-[160px]">
            <label for="examType" class="block font-semibold mb-2 text-900">Exam Type *</label>
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
        <div class="flex flex-col md:flex-row justify-center items-center mt-6 gap-2">
          <Button
            label="Load Students"
            icon="pi pi-search"
            class="w-full md:w-auto p-button-primary shadow-sm"
            :disabled="!canLoadStudents"
            @click="loadStudentScores"
            :loading="loadingScores"
          />
        </div>
      </template>
    </Card>

    <!-- Scores DataTable (Desktop) -->
    <Card v-if="students.length > 0 && !isMobile" class="shadow-lg border-0 rounded-xl">
      <template #content>
        <!-- Search Bar -->
        <div class="mb-3 flex flex-col md:flex-row md:items-center gap-2">
          <input
            v-model="studentSearch"
            type="text"
            placeholder="Search student by name..."
            class="p-2 border border-gray-300 rounded w-full md:w-1/3"
          />
          <!-- Quick Stats -->
          <div class="flex gap-4 text-sm">
            <span class="text-green-600">Present: {{ presentCount }}</span>
            <span class="text-red-600">Absent: {{ absentCount }}</span>
            <span class="text-blue-600">Total: {{ students.length }}</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <DataTable
            v-model:editingRows="editingRows"
            :value="filteredStudents"
            :striped-rows="true"
            :row-hover="true"
            :show-gridlines="false"
            editMode="row"
            dataKey="studentId"
            :loading="loadingScores"
            responsiveLayout="scroll"
            :scrollable="true"
            scrollHeight="60vh"
            class="p-datatable-sm min-w-[700px] md:min-w-0 modern-table"
            @row-edit-save="onRowEditSave"
            @row-edit-cancel="onRowEditCancel"
            @row-click="onRowClick"
            style="cursor:pointer"
          >
            <Column field="studentName" header="Student Name" style="width: 25%">
              <template #body="slotProps">
                <div class="flex items-center gap-2" :class="{ 'opacity-60': slotProps.data.isAbsent }">
                  <span class="inline-flex items-center justify-center bg-surface-200 text-blue-700 rounded-full w-8 h-8 font-bold">
                    {{ getInitials(slotProps.data.studentName) }}
                  </span>
                  <span class="font-medium text-900">{{ slotProps.data.studentName }}</span>
                  <i v-if="slotProps.data.isAbsent" class="pi pi-minus-circle text-red-500 text-sm" 
                     v-tooltip="'Student marked as absent'"></i>
                </div>
              </template>
            </Column>
            <Column field="currentScore" header="Current Score" style="width: 18%" bodyStyle="text-align:center;">
              <template #body="slotProps">
                <div v-if="slotProps.data.isAbsent" class="flex items-center justify-center gap-2">
                  <Tag value="ABSENT" severity="danger" class="text-sm font-semibold" />
                  <small class="text-400">(Score: 0)</small>
                </div>
                <Tag
                  v-else-if="slotProps.data.currentScore !== null && slotProps.data.currentScore !== undefined"
                  :value="slotProps.data.currentScore"
                  class="align-items-center justify-content-center text-base font-semibold px-3 py-1"
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
                  :disabled="slotProps.data.isAbsent"
                  class="w-full"
                  :class="{ 'opacity-50': slotProps.data.isAbsent }"
                  placeholder="Enter score"
                  :inputStyle="{ width: '100%' }"
                />
              </template>
            </Column>
            <Column field="isAbsent" header="Attendance" style="width: 15%" bodyStyle="text-align:center;">
              <template #body="slotProps">
                <Button
                  :label="slotProps.data.isAbsent ? 'Absent' : 'Present'"
                  :icon="slotProps.data.isAbsent ? 'pi pi-times' : 'pi pi-check'"
                  :class="slotProps.data.isAbsent ? 'p-button-danger p-button-sm' : 'p-button-success p-button-sm'"
                  @click="toggleAbsentStatus(slotProps.data)"
                  :loading="slotProps.data.toggleLoading"
                  size="small"
                />
              </template>
            </Column>
            <Column v-if="selectedExamType === 4" field="comments" header="Comments" style="width: 25%" bodyStyle="text-align:center;">
              <template #body="slotProps">
                <div v-if="slotProps.data.comments" class="flex items-center gap-2">
                  <i class="pi pi-comment text-blue-500"></i>
                  <span class="text-sm text-700 line-height-3 truncate max-w-[120px] md:max-w-[200px]">
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
                <transition name="fade-slide">
                  <div v-show="selectedExamType === 4">
                    <label class="block text-xs font-semibold mb-1 text-900 flex items-center gap-1">
                      Comments
                      <i class="pi pi-info-circle text-yellow-600" v-tooltip.top="'Comments are only required for End-of-Term exams.'"></i>
                    </label>
                    <Textarea
                      v-model="slotProps.data.comments"
                      :maxlength="100"
                      rows="3"
                      :disabled="slotProps.data.isAbsent"
                      class="w-full mt-2 comment-highlight"
                      :class="{ 'opacity-50': slotProps.data.isAbsent }"
                      placeholder="Enter comment."
                      :autoResize="true"
                    />
                    <div class="text-right text-xs text-gray-500 mt-1">
                      {{ 100 - (slotProps.data.comments?.length || 0) }} characters left
                    </div>
                  </div>
                </transition>
              </template>
            </Column>
            <Column :rowEditor="true" style="width: 17%" bodyStyle="text-align:center;">
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
            <template #footer> 
              <div class="text-right text-700 font-medium">
                In total there are {{ students ? students.length : 0 }} students.
                Present: {{ presentCount }}, Absent: {{ absentCount }}
              </div> 
            </template>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- Mobile Card Layout -->
    <div v-if="students.length > 0 && isMobile" class="flex flex-col gap-4 mt-2">
      <!-- Search Bar and Stats -->
      <div class="mb-3 flex flex-col gap-2">
        <input
          v-model="studentSearch"
          type="text"
          placeholder="Search student by name..."
          class="p-2 border border-gray-300 rounded w-full"
        />
        <div class="flex justify-center gap-4 text-sm">
          <span class="text-green-600">Present: {{ presentCount }}</span>
          <span class="text-red-600">Absent: {{ absentCount }}</span>
          <span class="text-blue-600">Total: {{ students.length }}</span>
        </div>
      </div>
      
      <Panel
        v-for="(student, idx) in filteredStudents"
        :key="student.studentId"
        :header="student.studentName"
        :toggleable="true"
        class="w-full student-mobile-card border-0 shadow-md rounded-lg"
        :class="{ 'absent-card': student.isAbsent }"
      >
        <template #icons>
          <div class="flex items-center gap-2">
            <Button
              :label="student.isAbsent ? 'Absent' : 'Present'"
              :icon="student.isAbsent ? 'pi pi-times' : 'pi pi-check'"
              :class="student.isAbsent ? 'p-button-danger p-button-sm' : 'p-button-success p-button-sm'"
              @click="toggleAbsentStatus(student)"
              :loading="student.toggleLoading"
              size="small"
            />
            <span v-if="!student.isAbsent && student.currentScore !== null" 
                  :class="['badge', getScoreSeverityClass(student.currentScore)]">
              {{ student.currentScore }}
            </span>
            <span v-else-if="student.isAbsent" class="badge bg-red-100 text-red-800">ABSENT</span>
            <span v-else class="text-gray-400 text-sm">No score</span>
          </div>
        </template>
        
        <div class="mb-2">
          <label class="block text-xs font-semibold mb-1 text-900">Score</label>
          <InputNumber
            v-model="student.currentScore"
            :min="0"
            :max="150"
            :maxFractionDigits="1"
            :disabled="student.isAbsent"
            class="w-full"
            :class="{ 'opacity-50': student.isAbsent }"
            placeholder="Enter score"
            @blur="onMobileScoreEdit(idx)"
            @change="onMobileScoreEdit(idx)"
          />
        </div>
        
        <div v-if="selectedExamType === 4" class="mb-2">
          <label class="block text-xs font-semibold mb-1 text-900 flex items-center gap-1">
            Comments
            <i class="pi pi-info-circle text-yellow-600" v-tooltip.top="'Comments are only required for End-of-Term exams.'"></i>
          </label>
          <transition name="fade-slide">
            <div v-show="selectedExamType === 4">
              <Textarea
                v-model="student.comments"
                :maxlength="100"
                rows="2"
                :disabled="student.isAbsent"
                class="w-full comment-highlight"
                :class="{ 'opacity-50': student.isAbsent }"
                placeholder="Enter comment"
                :autoResize="true"
                @blur="onMobileScoreEdit(idx)"
                @change="onMobileScoreEdit(idx)"
              />
              <div class="text-right text-xs text-gray-400">
                {{ 100 - (student.comments?.length || 0) }} left
              </div>
            </div>
          </transition>
        </div>
        
        <div class="flex justify-between items-center gap-2 mt-2">
          <div>
            <Button
              v-if="selectedExamType === 4 && student.comments"
              icon="pi pi-eye"
              size="small"
              text
              rounded
              @click="viewComment(student)"
              v-tooltip.top="'View full comment'"
            />
            <Button
              icon="pi pi-list"
              label="All Subject Scores"
              size="small"
              text
              rounded
              class="ml-2"
              @click="onRowClick({ data: student })"
              v-tooltip.top="'View/edit all subject scores'"
            />
          </div>
          <div class="flex items-center gap-1">
            <Button
              icon="pi pi-save"
              size="small"
              class="p-button-success p-button-sm"
              @click="onMobileScoreEdit(idx)"
              :disabled="saving"
              v-tooltip.top="'Save changes for this student'"
            />
            <span v-if="mobileSaveStatus[student.studentId] === 'saving'" class="text-xs text-blue-500 ml-1">Saving...</span>
            <span v-else-if="mobileSaveStatus[student.studentId] === 'saved'" class="text-xs text-green-600 ml-1">Saved!</span>
            <span v-else-if="mobileSaveStatus[student.studentId] === 'error'" class="text-xs text-red-500 ml-1">Error</span>
          </div>
        </div>
        <div v-if="student.lastUpdated" class="text-xs text-gray-400 mt-1">
          <i class="pi pi-clock mr-1"></i>
          Last updated: {{ formatDate(student.lastUpdated) }}
          <span v-if="student.recordedBy">by {{ student.recordedBy }}</span>
        </div>
      </Panel>
    </div>

    <!-- Bulk Absent Management Dialog -->
    <Dialog
      v-model:visible="showBulkAbsentDialog"
      header="Bulk Absent Management"
      :modal="true"
      :closable="true"
      :style="{ width: '95vw', maxWidth: '800px' }"
      class="rounded-xl shadow-lg"
    >
      <div class="mb-4">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <Button
            label="Select All"
            icon="pi pi-check-square"
            class="p-button-secondary flex-1"
            @click="selectAllStudents"
          />
          <Button
            label="Clear Selection"
            icon="pi pi-square"
            class="p-button-secondary flex-1"
            @click="clearStudentSelection"
          />
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <Button
            :label="`Mark ${selectedStudents.length} as Absent`"
            icon="pi pi-times"
            class="p-button-danger flex-1"
            :disabled="selectedStudents.length === 0 || bulkAbsentLoading"
            :loading="bulkAbsentLoading"
            @click="bulkMarkAbsent(true)"
          />
          <Button
            :label="`Mark ${selectedStudents.length} as Present`"
            icon="pi pi-check"
            class="p-button-success flex-1"
            :disabled="selectedStudents.length === 0 || bulkAbsentLoading"
            :loading="bulkAbsentLoading"
            @click="bulkMarkAbsent(false)"
          />
        </div>
      </div>

      <DataTable
        :value="students"
        :selection="selectedStudents"
        v-model:selection="selectedStudents"
        dataKey="studentId"
        :scrollable="true"
        scrollHeight="400px"
        class="p-datatable-sm"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="studentName" header="Student Name"></Column>
        <Column field="isAbsent" header="Current Status" bodyStyle="text-align:center;">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.isAbsent ? 'Absent' : 'Present'"
              :severity="slotProps.data.isAbsent ? 'danger' : 'success'"
            />
          </template>
        </Column>
        <Column field="currentScore" header="Score" bodyStyle="text-align:center;">
          <template #body="slotProps">
            <span v-if="slotProps.data.isAbsent" class="text-400">0 (Absent)</span>
            <span v-else>{{ slotProps.data.currentScore ?? 'No score' }}</span>
          </template>
        </Column>
      </DataTable>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Close"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="showBulkAbsentDialog = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Rest of your existing dialogs and components -->
    <!-- Multi-Subject Student Scores Dialog -->
    <Dialog
      v-model:visible="showStudentDialog"
      :header="selectedStudent ? selectedStudent.studentName + ' - All Subject Scores' : 'Student Scores'"
      :modal="true"
      :closable="true"
      :style="{ width: '95vw', maxWidth: '600px' }"
      class="rounded-xl shadow-lg"
      @hide="onDialogCancel"
    >
      <div v-if="selectedStudent">
        <div class="mb-4 bg-surface-100 p-3 rounded-lg">
          <strong>Exam Type:</strong> {{ getExamTypeName(selectedExamType) }}<br />
          <strong>Term:</strong> {{ getTermName(selectedTerm) }}
        </div>
        <div class="flex flex-col gap-4">
          <div v-for="subject in dialogSubjects" :key="subject.id" class="mb-2">
            <label class="block mb-1 font-semibold text-900">{{ subject.name }}</label>
            <div class="flex items-center gap-2 mb-2">
              <Button
                :label="dialogStudentScores[subject.id]?.isAbsent ? 'Absent' : 'Present'"
                :icon="dialogStudentScores[subject.id]?.isAbsent ? 'pi pi-times' : 'pi pi-check'"
                :class="dialogStudentScores[subject.id]?.isAbsent ? 'p-button-danger p-button-sm' : 'p-button-success p-button-sm'"
                @click="toggleDialogAbsent(subject.id)"
                size="small"
              />
            </div>
            <InputNumber
              v-model="dialogStudentScores[subject.id].score"
              :min="0"
              :max="150"
              :maxFractionDigits="1"
              :disabled="dialogStudentScores[subject.id]?.isAbsent"
              class="w-full"
              :class="{ 'opacity-50': dialogStudentScores[subject.id]?.isAbsent }"
              placeholder="Enter score"
            />
            <div v-if="selectedExamType === 4" class="mt-2">
              <label class="block mb-1 font-semibold text-900 flex items-center gap-1">
                Comments
                <i class="pi pi-info-circle text-yellow-600" v-tooltip.top="'Comments are only required for End-of-Term exams.'"></i>
              </label>
              <transition name="fade-slide">
                <div v-show="selectedExamType === 4">
                  <Textarea
                    v-model="dialogStudentScores[subject.id].comments"
                    :maxlength="100"
                    rows="2"
                    :disabled="dialogStudentScores[subject.id]?.isAbsent"
                    class="w-full comment-highlight"
                    :class="{ 'opacity-50': dialogStudentScores[subject.id]?.isAbsent }"
                    placeholder="Enter comment."
                    :autoResize="true"
                  />
                  <div class="text-right text-xs text-gray-500 mt-1">
                    {{ 100 - (dialogStudentScores[subject.id].comments?.length || 0) }} characters left
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" text @click="onDialogCancel" class="p-button-secondary" />
          <Button label="Save" icon="pi pi-check" @click="onDialogSave" :disabled="!dialogHasChanges" class="p-button-primary" />
        </div>
      </template>
    </Dialog>

    <!-- Initial State -->
    <Card v-if="!selectedAssignment">
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
      class="rounded-xl shadow-lg"
    >
      <div class="mb-4">
        <label class="block font-semibold mb-2 text-900">Comments:</label>
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
          class="w-full md:w-auto p-button-secondary" 
        />
      </template>
    </Dialog>

    <Toast ref="toast" />
    <ConfirmDialog />
  </div>
</template>

<script>
import { examService, markScheduleService } from '@/service/api.service';

export default {
  name: 'ScoreEntryWithAbsent',

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
      studentSearch: '',

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
      dialogStudentScores: {}, // { [subjectId]: { score, comments, scoreId, isAbsent } }
      dialogOriginalScores: {},

      // Mobile detection
      isMobile: false,
      // Per-student save status for mobile
      mobileSaveStatus: {}, // { [studentId]: 'idle' | 'saving' | 'saved' | 'error' }

      // Absent management
      showBulkAbsentDialog: false,
      selectedStudents: [],
      bulkAbsentLoading: false,
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
        return curr && orig && (
          curr.score !== orig.score || 
          curr.comments !== orig.comments ||
          curr.isAbsent !== orig.isAbsent
        );
      });
    },

    filteredStudents() {
      if (!this.studentSearch) return this.students;
      return this.students.filter(s =>
        s.studentName && s.studentName.toLowerCase().includes(this.studentSearch.toLowerCase())
      );
    },

    presentCount() {
      return this.students.filter(s => !s.isAbsent).length;
    },

    absentCount() {
      return this.students.filter(s => s.isAbsent).length;
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
    // Absent management methods
    async toggleAbsentStatus(student) {
      if (student.toggleLoading) return;
      
      student.toggleLoading = true;
      
      try {
        let response;
        
        // If no scoreId exists, we need to create a score record first
        if (!student.scoreId) {
          console.log('No scoreId found, creating score record first');
          
          // Create initial score record
          const scoreData = {
            studentId: student.studentId,
            subjectId: this.selectedAssignment.subjectId,
            examTypeId: this.selectedExamType,
            academicYear: this.selectedAcademicYear,
            term: this.selectedTerm,
            score: 0, // Default score for new absent student
            isAbsent: !student.isAbsent, // Toggle the current status
            gradeId: this.selectedAssignment.gradeId,
            comments: '',
          };
          
          const createResponse = await examService.submitScore(scoreData);
          
          // Update student with new scoreId and absent status
          student.scoreId = createResponse.id;
          student.isAbsent = createResponse.isAbsent;
          student.currentScore = createResponse.score;
          student.lastUpdated = createResponse.recordedAt;
          student.recordedBy = createResponse.recordedByName;
          
          response = createResponse;
        } else {
          try {
            // Score exists, use toggle API
            response = await examService.toggleAbsentStatus(student.scoreId, student.isAbsent);
            
            // Update the student data
            student.isAbsent = response.isAbsent;
            student.currentScore = response.score;
            student.lastUpdated = response.recordedAt;
            student.recordedBy = response.recordedByName;
          } catch (toggleError) {
            // If toggle fails with 404, the score record might have been deleted
            // Fall back to creating a new score record
            if (toggleError.response && toggleError.response.status === 404) {
              console.log('Score record not found, creating new score record');
              
              const scoreData = {
                studentId: student.studentId,
                subjectId: this.selectedAssignment.subjectId,
                examTypeId: this.selectedExamType,
                academicYear: this.selectedAcademicYear,
                term: this.selectedTerm,
                score: 0,
                isAbsent: !student.isAbsent, // Toggle the current status
                gradeId: this.selectedAssignment.gradeId,
                comments: '',
              };
              
              const createResponse = await examService.submitScore(scoreData);
              
              // Update student with new scoreId and absent status
              student.scoreId = createResponse.id;
              student.isAbsent = createResponse.isAbsent;
              student.currentScore = createResponse.score;
              student.lastUpdated = createResponse.recordedAt;
              student.recordedBy = createResponse.recordedByName;
              
              response = createResponse;
            } else {
              // Re-throw other errors
              throw toggleError;
            }
          }
        }
        
        // Update original data to reflect the change
        const originalIndex = this.originalStudents.findIndex(s => s.studentId === student.studentId);
        if (originalIndex !== -1) {
          this.originalStudents[originalIndex].isAbsent = response.isAbsent;
          this.originalStudents[originalIndex].currentScore = response.score;
          this.originalStudents[originalIndex].scoreId = student.scoreId;
        }
        
        this.showSuccess(`Student marked as ${response.isAbsent ? 'absent' : 'present'}`);
      } catch (error) {
        console.error('Error toggling absent status:', error);
        this.showError('Failed to update absent status');
      } finally {
        student.toggleLoading = false;
      }
    },

    async bulkMarkAbsent(isAbsent) {
      if (this.selectedStudents.length === 0) return;
      
      this.bulkAbsentLoading = true;
      
      try {
        const studentIds = this.selectedStudents.map(s => s.studentId);
        
        const response = await examService.bulkMarkAbsent({
          StudentIds: studentIds,
          SubjectId: this.selectedAssignment.subjectId,
          ExamTypeId: this.selectedExamType,
          AcademicYear: this.selectedAcademicYear,
          Term: this.selectedTerm,
          IsAbsent: isAbsent
        });
        
        // Update local data
        this.students.forEach(student => {
          if (studentIds.includes(student.studentId)) {
            student.isAbsent = isAbsent;
            if (isAbsent) {
              student.currentScore = 0;
            }
          }
        });
        
        // Update original data
        this.originalStudents.forEach(student => {
          if (studentIds.includes(student.studentId)) {
            student.isAbsent = isAbsent;
            if (isAbsent) {
              student.currentScore = 0;
            }
          }
        });
        
        this.selectedStudents = [];
        this.showBulkAbsentDialog = false;
        this.showSuccess(response.Message || `Successfully marked ${studentIds.length} students as ${isAbsent ? 'absent' : 'present'}`);
      } catch (error) {
        console.error('Error bulk marking absent:', error);
        this.showError('Failed to bulk update absent status');
      } finally {
        this.bulkAbsentLoading = false;
      }
    },

    selectAllStudents() {
      this.selectedStudents = [...this.students];
    },

    clearStudentSelection() {
      this.selectedStudents = [];
    },

    toggleDialogAbsent(subjectId) {
      if (this.dialogStudentScores[subjectId]) {
        this.dialogStudentScores[subjectId].isAbsent = !this.dialogStudentScores[subjectId].isAbsent;
        
        // Set score to 0 if marking as absent
        if (this.dialogStudentScores[subjectId].isAbsent) {
          this.dialogStudentScores[subjectId].score = 0;
        }
      }
    },

    handleResize() {
      this.isMobile = window.innerWidth < 768
    },

    async saveSingleChange(change) {
      const scoreData = {
        ...change,
        studentId: change.studentId,
        subjecId: change.subjectId,
        examTypeId: change.examTypeId,
        academicYearId: change.academicYear,
        term: change.term,
        score: change.score,
        isAbsent: change.isAbsent || false,
        gradeId: this.selectedAssignment.gradeId,
        comments: change.comments || '',
      };
      return await examService.submitScore(scoreData);
    },

    // Add absent functionality to existing methods
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
            isAbsent: existingScore ? existingScore.isAbsent : false,
            lastUpdated: existingScore ? existingScore.recordedAt : null,
            recordedBy: existingScore ? existingScore.recordedByName : null,
            comments: existingScore ? existingScore.comments : null,
            commentsUpdatedAt: existingScore ? existingScore.commentsUpdatedAt : null,
            commentsUpdatedBy: existingScore ? existingScore.commentsUpdatedByName : null,
            toggleLoading: false
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
      const absentChanged = student.isAbsent !== originalStudent.isAbsent

      if (scoreChanged || commentsChanged || absentChanged) {
        const pendingChange = {
          studentId: student.studentId,
          subjectId: this.selectedAssignment.subjectId,
          examTypeId: this.selectedExamType,
          score: student.currentScore,
          isAbsent: student.isAbsent,
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

      // 3. Build dialogStudentScores: { [subjectId]: { score, comments, scoreId, isAbsent } }
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
          scoreId: s ? s.id : null,
          isAbsent: s ? s.isAbsent : false
        };
      });

      // 4. Save original for change detection
      this.dialogOriginalScores = JSON.parse(JSON.stringify(this.dialogStudentScores));
      this.showStudentDialog = true;
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
          curr.comments !== orig.comments ||
          curr.isAbsent !== orig.isAbsent
        ) {
          // Update students array if this is the current subject
          if (subject.id === this.selectedAssignment.subjectId) {
            const idx = this.students.findIndex(s => s.studentId === studentId);
            if (idx !== -1) {
              this.students[idx].currentScore = curr.score;
              this.students[idx].isAbsent = curr.isAbsent;
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
            isAbsent: curr.isAbsent,
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

    // All your existing methods remain the same
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
            subjectId: change.subjectId,
            examTypeId: this.selectedExamType,
            academicYearId: this.selectedAcademicYear,
            term: this.selectedTerm,
            score: change.score,
            isAbsent: change.isAbsent || false,
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
              isAbsent: savedScore.isAbsent,
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

    async exportMarkSchedulePdf() {
      if (!this.selectedAssignment || !this.selectedAcademicYear || !this.selectedTerm || !this.selectedExamType) {
        this.showWarn('Please select all required fields.');
        return;
      }

      try {
        const gradeId = this.selectedAssignment.gradeId;
        const academicYearId = this.selectedAcademicYear;
        const term = this.selectedTerm;
        const examTypeObj = this.examTypes.find(e => e.id === this.selectedExamType);
        const examTypeName = examTypeObj ? examTypeObj.name : '';

        const pdfBlob = await markScheduleService.getMarkSchedulePdfForGrade(gradeId, academicYearId, term, examTypeName);
        
        if (pdfBlob.type === 'application/json') {
          const errorText = await pdfBlob.text();
          console.error('Backend error response:', errorText);
          this.showError('No scores found for this grade, academic year, term, and exam type. Please ensure you have entered and saved scores before exporting.');
          return;
        }
        
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MarkSchedule_${this.selectedAssignment.gradeName}_Year${academicYearId}_Term${term}_${examTypeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showSuccess('Mark Schedule PDF exported successfully!');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        if (!(error && error.message && error.message.includes('No scores found for this grade'))) {
          this.showError('Failed to export Mark Schedule PDF. Please try again.');
        }
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
      const absentChanged = student.isAbsent !== originalStudent.isAbsent;

      this.mobileSaveStatus[student.studentId] = 'saving';

      if (scoreChanged || commentsChanged || absentChanged) {
        const pendingChange = {
          studentId: student.studentId,
          subjectId: this.selectedAssignment.subjectId,
          examTypeId: this.selectedExamType,
          score: student.currentScore,
          isAbsent: student.isAbsent,
          academicYear: this.selectedAcademicYear,
          term: this.selectedTerm,
          comments: student.comments || ''
        };

        this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId);
        this.pendingChanges.push(pendingChange);

        try {
          this.saving = true;
          const result = await this.$options.methods.saveSingleChange.call(this, pendingChange);
          this.originalStudents[idx] = { ...student };
          this.pendingChanges = this.pendingChanges.filter(change => change.studentId !== student.studentId);
          this.mobileSaveStatus[student.studentId] = 'saved';
          setTimeout(() => {
            if (this.mobileSaveStatus[student.studentId] === 'saved') {
              this.mobileSaveStatus[student.studentId] = 'idle';
            }
          }, 1500);
          this.showSuccess('Score saved!');
        } catch (e) {
          this.mobileSaveStatus[student.studentId] = 'error';
          this.showError('Failed to save score');
        } finally {
          this.saving = false;
        }
      } else {
        this.mobileSaveStatus[student.studentId] = 'idle';
      }
    },

    onDialogCancel() {
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
    },
    
    getAcademicYearNameById(id) {
      const year = this.academicYears.find(y => y.id === id);
      return year ? year.name : id;
    }
  }
}
</script>

<style scoped>
/* Existing styles */
.modern-table .p-datatable-tbody > tr:hover {
  background: #f3f6fa !important;
  transition: background 0.2s;
}

.modern-table .p-datatable-tbody > tr > td {
  vertical-align: middle;
  font-size: 1rem;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
}

.modern-table .p-datatable-thead > tr > th {
  font-size: 1.05rem;
  font-weight: 600;
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
}

.student-mobile-card {
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  background: #f8fafc;
  padding: 1.2rem 1rem 1rem 1rem;
  transition: all 0.3s ease;
}

/* Absent-specific styles */
.absent-card {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.score-entry {
  background: #f8fafc;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  min-height: 90vh;
}

.comment-highlight {
  background: #fffbe6 !important;
  border: 1.5px solid #ffe58f !important;
  border-radius: 0.5rem;
  transition: background 0.3s, border 0.3s;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Badge styles for mobile */
.badge {
  display: inline-block;
  padding: 0.25em 0.75em;
  border-radius: 9999px;
  font-size: 0.95em;
  font-weight: 600;
  min-width: 2.5em;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 768px) {
  .score-entry {
    padding: 0.5rem !important;
    border-radius: 0.75rem;
  }
  
  .student-mobile-card {
    border-radius: 0.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    border: 1px solid #e5e7eb;
    background: #fff;
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }
  
  .absent-card {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
  }
}
</style> 