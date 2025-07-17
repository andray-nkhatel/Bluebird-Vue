<template>
  <div class="report-card-container">
    <div class="card">
      <div class="card-header">
        <h2 class="text-2xl font-bold mb-4">My Students' Report Cards</h2>
        
        
        
          
            
            <!-- Class Report Cards Viewer -->
            <Divider />

            
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">Class Report Cards</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="field">
                  <label for="class-view-grade-select" class="block text-sm font-medium mb-2">Grade/Class</label>
                  <Dropdown
                    id="class-view-grade-select"
                    v-model="classViewSelectedGrade"
                    :options="assignedGrades"
                    optionLabel="fullName"
                    optionValue="id"
                    placeholder="Select Grade"
                    class="w-full"
                    :loading="gradesLoading"
                    filter
                    filterPlaceholder="Search grades..."
                  />
                </div>
                <div class="field">
                  <label for="class-view-academic-year" class="block text-sm font-medium mb-2">Academic Year</label>
                  <Dropdown
                    id="class-view-academic-year"
                    v-model="classViewAcademicYear"
                    :options="academicYears"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Academic Year"
                    class="w-full"
                    :loading="academicYearsLoading"
                  />
                </div>
                <div class="field">
                  <label for="class-view-term" class="block text-sm font-medium mb-2">Term</label>
                  <Dropdown id="class-view-term" v-model="classViewSelectedTerm" :options="terms" optionLabel="label" optionValue="value" placeholder="Select Term" class="w-full" />
                </div>
                <div class="field">
                  <Button @click="loadClassViewReportCards" :loading="loadingClassViewBlobsTab" :disabled="!classViewSelectedGrade || !classViewAcademicYear || !classViewSelectedTerm" class="w-full mt-7" severity="secondary">
                    Load All Class Report Cards
                  </Button>
                </div>
              </div>
              <div v-if="loadingClassViewBlobsTab">
                <ProgressBar mode="indeterminate" style="height: 1px" />
                <div class="text-center mt-2">Loading class report cards...</div>
              </div>
              <div v-if="classViewReportCards.length > 0">
                <DataTable :value="classViewReportCards" stripedRows   class="p-datatable-sm">
                  <Column field="studentName" header="Student" />
                  <Column field="gradeName" header="Grade" />
                  <Column header="Actions" style="width: 180px">
                    <template #body="{ data }">
                      <Button @click="openPdfModal(data.id, data.studentName)" size="small" severity="secondary" outlined>
                        <i class="pi pi-eye mr-1"></i>
                        View
                      </Button>
                    </template>
                  </Column>
                </DataTable>
                <div v-if="classViewReportCards.length > 0" class="text-right text-sm text-gray-600 mt-2">
                  Total: {{ classViewReportCards.length }} students report cards.
                </div>
                <div v-if="classViewReportCards.length > 0" class="mt-4 flex justify-end">
                  <Button
                    @click="downloadClassReportCardsZipClient"
                    :loading="downloadingClassBundle"
                    :disabled="downloadingClassBundle"
                    severity="info"
                    icon="pi pi-download"
                    class="w-full"
                  >
                    Download All as ZIP
                  </Button>
                </div>
                <ProgressBar v-if="isZipDownloaded" mode="indeterminate" class="mt-0.5" style="height: 2px"></ProgressBar>
              </div>
              <div v-else-if="!loadingClassViewBlobsTab">
                <span>No class report cards loaded yet.</span>
              </div>
            </div>
          
        
      </div>
    </div>
    <!-- PDF Modal -->
    <Dialog v-model:visible="showPdfModal" modal header="Report Card PDF" :style="{ width: '80vw' }" @hide="closePdfModal">
      <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600px" style="border: none"></iframe>
    </Dialog>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { examService, gradeService, reportService, studentService, authService } from '@/service/api.service';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import TabPanel from 'primevue/tabpanel';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import { zipSync } from 'fflate';

const toast = useToast();

const userProfile = ref(null);
const assignments = ref([]);
const assignedStudents = ref([]);
const assignedGrades = ref([]);
const studentsLoading = ref(false);
const gradesLoading = ref(false);
const academicYearsLoading = ref(false);
const academicYears = ref([]);
const terms = ref([
  { label: 'Term 1', value: 1 },
  { label: 'Term 2', value: 2 },
  { label: 'Term 3', value: 3 }
]);

const viewSelectedStudent = ref(null);
const studentReportCards = ref([]);
const loadingReportCards = ref(false);

const classViewSelectedGrade = ref(null);
const classViewAcademicYear = ref(null);
const classViewSelectedTerm = ref(null);
const classViewReportCards = ref([]);
const loadingClassViewBlobsTab = ref(false);
const downloadingClassBundle = ref(false);
const isZipDownloaded = ref(false);

const showPdfModal = ref(false);
const pdfUrl = ref('');

const fetchUserProfile = async () => {
  try {
    userProfile.value = await authService.getProfile();
  } catch (error) {
    console.error('Failed to fetch user profile', error);
  }
};

const fetchAssignments = async () => {
  try {
    const response = await examService.getTeacherAssignments();
    assignments.value = response;
  } catch (error) {
    console.error('Error fetching assignments:', error);
  }
};

const loadAcademicYears = async () => {
  academicYearsLoading.value = true;
  try {
    const [allYears] = await Promise.all([
      examService.getAcademicYears()
    ]);
    const yearsArray = Array.isArray(allYears) ? allYears : allYears.data || [];
    academicYears.value = yearsArray
      .sort((a, b) => {
        const yearA = parseInt(a.name) || 0;
        const yearB = parseInt(b.name) || 0;
        return yearB - yearA;
      })
      .map((year) => ({
        id: year.id,
        name: year.name,
        year: parseInt(year.name),
        startDate: year.startDate,
        endDate: year.endDate,
        isActive: year.isActive,
        isClosed: year.isClosed
      }));
  } catch (error) {
    console.error('Failed to load academic years:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load academic years. Please try again.',
      life: 5000
    });
    academicYears.value = [];
  } finally {
    academicYearsLoading.value = false;
  }
};

const loadAssignmentsData = async () => {
  studentsLoading.value = true;
  gradesLoading.value = true;
  try {
    // Fetch all students and grades
    const [allStudents, allGrades] = await Promise.all([
      studentService.getAll(),
      gradeService.getAll()
    ]);
    // Filter students and grades by assignments
    const assignedStudentIds = new Set();
    const assignedGradeIds = new Set();
    (assignments.value || []).forEach(a => {
      if (a.studentId) assignedStudentIds.add(a.studentId);
      if (a.gradeId) assignedGradeIds.add(a.gradeId);
    });
    assignedStudents.value = allStudents
      .filter(s => assignedStudentIds.has(s.id))
      .map(student => ({
        id: student.id,
        fullName: student.fullName,
        firstName: student.firstName,
        lastName: student.lastName,
        gradeId: student.gradeId,
        gradeName: student.gradeName
      }));
    assignedGrades.value = allGrades
      .filter(g => assignedGradeIds.has(g.id))
      .map(grade => ({
        id: grade.id,
        fullName: grade.fullName,
        name: grade.name,
        stream: grade.stream,
        section: grade.section,
        level: grade.level,
        studentCount: grade.studentCount,
        homeroomTeacherName: grade.homeroomTeacherName
      }));
  } catch (error) {
    console.error('Failed to load students/grades:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load students/grades. Please try again.',
      life: 5000
    });
    assignedStudents.value = [];
    assignedGrades.value = [];
  } finally {
    studentsLoading.value = false;
    gradesLoading.value = false;
  }
};

const loadStudentReportCards = async () => {
  if (!viewSelectedStudent.value) return;
  loadingReportCards.value = true;
  try {
    const response = await reportService.getStudentReportCards(viewSelectedStudent.value);
    studentReportCards.value = response;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load report cards',
      life: 5000
    });
    studentReportCards.value = [];
  } finally {
    loadingReportCards.value = false;
  }
};

const loadClassViewReportCards = async () => {
  if (!classViewSelectedGrade.value || !classViewAcademicYear.value || !classViewSelectedTerm.value) return;
  loadingClassViewBlobsTab.value = true;
  classViewReportCards.value = [];
  try {
    const ids = await reportService.getClassReportCardIds(classViewSelectedGrade.value, classViewAcademicYear.value, classViewSelectedTerm.value);
    classViewReportCards.value = ids;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load class report cards',
      life: 5000
    });
    classViewReportCards.value = [];
  } finally {
    loadingClassViewBlobsTab.value = false;
  }
};

const downloadClassReportCardsZipClient = async () => {
  if (!classViewReportCards.value.length) return;
  downloadingClassBundle.value = true;
  isZipDownloaded.value = !isZipDownloaded.value;
  try {
    const fetchPromises = classViewReportCards.value.map(async (rc) => {
      try {
        const blob = await reportService.fetchReportCardBlob(rc.id);
        const arrayBuffer = await blob.arrayBuffer();
        const safeName = rc.studentName.replace(/[^a-z0-9]/gi, '_');
        const fileName = `${safeName}_${rc.gradeName || ''}_${rc.id}.pdf`;
        return { fileName, data: new Uint8Array(arrayBuffer) };
      } catch (err) {
        return null;
      }
    });
    const files = (await Promise.all(fetchPromises)).filter(Boolean);
    const zipObj = {};
    for (const file of files) {
      zipObj[file.fileName] = file.data;
    }
    let className = 'Class';
    if (classViewSelectedGrade.value) {
      const gradeObj = assignedGrades.value.find(g => g.id === classViewSelectedGrade.value);
      if (gradeObj && gradeObj.fullName) {
        className = gradeObj.fullName.replace(/[^a-z0-9]/gi, '_');
      }
    }
    const zipFileName = `${className}_Report_Cards.zip`;
    const url = window.URL.createObjectURL(new Blob([zipSync(zipObj)], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    isZipDownloaded.value = !isZipDownloaded.value;
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All class report cards downloaded as ZIP!',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create ZIP',
      life: 5000
    });
  } finally {
    downloadingClassBundle.value = false;
  }
};

async function openPdfModal(reportCardId) {
  try {
    const blob = await reportService.fetchReportCardBlob(reportCardId);
    const url = window.URL.createObjectURL(blob);
    pdfUrl.value = url;
    showPdfModal.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load PDF',
      life: 5000
    });
  }
}

function closePdfModal() {
  showPdfModal.value = false;
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = '';
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  await fetchUserProfile();
  await fetchAssignments();
  await loadAssignmentsData();
  await loadAcademicYears();
});
</script>

<style scoped>
.report-card-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
.card {
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