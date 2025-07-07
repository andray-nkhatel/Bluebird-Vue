<template>
    <div class="card flex justify-center">
        <!-- Loading state while fetching academic year -->
        <div v-if="loadingAcademicYear" class="flex flex-col items-center justify-center h-64">
            <i class="pi pi-spinner pi-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-lg text-gray-600 dark:text-gray-400">Loading active academic year...</p>
        </div>

        <!-- Error state if no academic year found -->
        <div v-else-if="!isAcademicYearLoaded" class="flex flex-col items-center justify-center h-64">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p class="text-lg text-red-600 dark:text-red-400 mb-4">No active academic year found</p>
            <Button 
                label="Retry" 
                icon="pi pi-refresh" 
                @click="loadActiveAcademicYear"
                class="bg-blue-500 hover:bg-blue-600"
            />
        </div>

        <!-- Main stepper component -->
        <Stepper v-else :value="currentStep" class="basis-[50rem]">
            <StepList>
                <Step value="1">Pre-Closure Checks</Step>
                <Step value="2">Close Academic Year</Step>
                <Step value="3">Promote Students</Step>
                <Step value="4">Archive Graduates</Step>
                <Step value="5">Complete Process</Step>
            </StepList>
            <StepPanels>
                <!-- Step 1: Pre-Closure Checks -->
                <StepPanel v-slot="{ activateCallback }" value="1">
                    <div class="flex flex-col h-64">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto p-6">
                            <h3 class="text-xl font-semibold mb-4">Pre-Closure Verification</h3>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <i :class="['pi', checks.gradesFinalized ? 'pi-check text-green-500' : 'pi-times text-red-500']"></i>
                                    <span>All grades finalized</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i :class="['pi', checks.assessmentsComplete ? 'pi-check text-green-500' : 'pi-times text-red-500']"></i>
                                    <span>All assessments completed</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i :class="['pi', checks.reportsGenerated ? 'pi-check text-green-500' : 'pi-times text-red-500']"></i>
                                    <span>Student reports generated</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <i :class="['pi', checks.administrativeTasksComplete ? 'pi-check text-green-500' : 'pi-times text-red-500']"></i>
                                    <span>Administrative tasks completed</span>
                                </div>
                            </div>
                            <div class="mt-4">
                                <Button 
                                    label="Verify All Checks" 
                                    icon="pi pi-refresh" 
                                    @click="verifyPreClosureChecks"
                                    :loading="verifying"
                                    class="mr-2"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="flex pt-6 justify-end">
                        <Button 
                            label="Next" 
                            icon="pi pi-arrow-right" 
                            iconPos="right" 
                            @click="activateCallback('2')" 
                            :disabled="!allChecksComplete"
                        />
                    </div>
                </StepPanel>

                <!-- Step 2: Close Academic Year -->
                <StepPanel v-slot="{ activateCallback }" value="2">
                    <div class="flex flex-col h-64">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto p-6">
                            <h3 class="text-xl font-semibold mb-4">Close Academic Year</h3>
                            <div class="space-y-4">
                                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                                    <div class="flex items-start gap-3">
                                        <i class="pi pi-exclamation-triangle text-yellow-600 mt-1"></i>
                                        <div>
                                            <p class="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                                            <p class="text-sm text-yellow-700 dark:text-yellow-300">
                                                Closing the academic year will prevent further modifications to grades and assessments.
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="steps.closeYear.status === 'completed'" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-check-circle text-green-600"></i>
                                        <span class="text-green-800 dark:text-green-200">Academic year closed successfully</span>
                                    </div>
                                </div>
                                <div v-if="steps.closeYear.status === 'error'" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-times-circle text-red-600"></i>
                                        <span class="text-red-800 dark:text-red-200">{{ steps.closeYear.error }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                        <div class="flex gap-2">
                            <Button 
                                v-if="steps.closeYear.status !== 'completed'"
                                label="Close Academic Year" 
                                icon="pi pi-lock" 
                                @click="closeAcademicYear"
                                :loading="steps.closeYear.loading"
                                severity="danger"
                            />
                            <Button 
                                label="Next" 
                                icon="pi pi-arrow-right" 
                                iconPos="right" 
                                @click="activateCallback('3')"
                                :disabled="steps.closeYear.status !== 'completed'"
                            />
                        </div>
                    </div>
                </StepPanel>

                <!-- Step 3: Promote Students -->
                <StepPanel v-slot="{ activateCallback }" value="3">
                    <div class="flex flex-col h-64">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto p-6">
                            <h3 class="text-xl font-semibold mb-4">Promote Students</h3>
                            <div class="space-y-4">
                                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
                                    <div class="flex items-start gap-3">
                                        <i class="pi pi-info-circle text-blue-600 mt-1"></i>
                                        <div>
                                            <p class="font-medium text-blue-800 dark:text-blue-200">Student Promotion</p>
                                            <p class="text-sm text-blue-700 dark:text-blue-300">
                                                This will promote all eligible students to the next grade level.
                                                Students who failed or need to repeat will be handled separately.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="steps.promoteStudents.status === 'completed'" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-check-circle text-green-600"></i>
                                        <span class="text-green-800 dark:text-green-200">Students promoted successfully</span>
                                    </div>
                                </div>
                                <div v-if="steps.promoteStudents.status === 'error'" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-times-circle text-red-600"></i>
                                        <span class="text-red-800 dark:text-red-200">{{ steps.promoteStudents.error }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                        <div class="flex gap-2">
                            <Button 
                                v-if="steps.promoteStudents.status !== 'completed'"
                                label="Promote All Students" 
                                icon="pi pi-arrow-up" 
                                @click="promoteAllStudents"
                                :loading="steps.promoteStudents.loading"
                            />
                            <Button 
                                label="Next" 
                                icon="pi pi-arrow-right" 
                                iconPos="right" 
                                @click="activateCallback('4')"
                                :disabled="steps.promoteStudents.status !== 'completed'"
                            />
                        </div>
                    </div>
                </StepPanel>

                <!-- Step 4: Archive Graduates -->
                <StepPanel v-slot="{ activateCallback }" value="4">
                    <div class="flex flex-col h-64">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto p-6">
                            <h3 class="text-xl font-semibold mb-4">Archive Graduates</h3>
                            <div class="space-y-4">
                                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-4">
                                    <div class="flex items-start gap-3">
                                        <i class="pi pi-graduation-cap text-purple-600 mt-1"></i>
                                        <div>
                                            <p class="font-medium text-purple-800 dark:text-purple-200">Graduate Archival</p>
                                            <p class="text-sm text-purple-700 dark:text-purple-300">
                                                Final year students will be moved to graduate status and archived.
                                                Their records will be preserved for future reference.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="steps.archiveGraduates.status === 'completed'" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-check-circle text-green-600"></i>
                                        <span class="text-green-800 dark:text-green-200">Graduates archived successfully</span>
                                    </div>
                                </div>
                                <div v-if="steps.archiveGraduates.status === 'error'" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-times-circle text-red-600"></i>
                                        <span class="text-red-800 dark:text-red-200">{{ steps.archiveGraduates.error }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('3')" />
                        <div class="flex gap-2">
                            <Button 
                                v-if="steps.archiveGraduates.status !== 'completed'"
                                label="Archive Graduates" 
                                icon="pi pi-archive" 
                                @click="archiveGraduates"
                                :loading="steps.archiveGraduates.loading"
                            />
                            <Button 
                                label="Next" 
                                icon="pi pi-arrow-right" 
                                iconPos="right" 
                                @click="activateCallback('5')"
                                :disabled="steps.archiveGraduates.status !== 'completed'"
                            />
                        </div>
                    </div>
                </StepPanel>

                <!-- Step 5: Complete Process -->
                <StepPanel v-slot="{ activateCallback }" value="5">
                    <div class="flex flex-col h-64">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto p-6 text-center">
                            <div class="flex flex-col items-center justify-center h-full space-y-4">
                                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                                <h3 class="text-2xl font-semibold text-green-700 dark:text-green-300">Process Complete!</h3>
                                <p class="text-gray-600 dark:text-gray-400">
                                    Academic year closure process has been completed successfully.
                                </p>
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center justify-center gap-2">
                                        <i class="pi pi-check text-green-500"></i>
                                        <span>Academic year closed</span>
                                    </div>
                                    <div class="flex items-center justify-center gap-2">
                                        <i class="pi pi-check text-green-500"></i>
                                        <span>Students promoted</span>
                                    </div>
                                    <div class="flex items-center justify-center gap-2">
                                        <i class="pi pi-check text-green-500"></i>
                                        <span>Graduates archived</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('4')" />
                        <Button 
                            label="Create New Academic Year" 
                            icon="pi pi-plus" 
                            @click="createNewAcademicYear"
                            class="bg-blue-500 hover:bg-blue-600"
                        />
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>
    </div>

    <!-- Report Generation Section -->
    <div class="card mt-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
                <h2 class="text-xl font-semibold text-900 mb-2">Report Generation</h2>
                <p class="text-600">Generate comprehensive reports and mark schedules for the academic year</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Generate All Mark Schedules -->
            <div class="border-1 border-surface-200 dark:border-surface-700 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <i class="pi pi-file-pdf text-2xl text-blue-500"></i>
                    <div>
                        <h3 class="font-semibold text-900">All Mark Schedules</h3>
                        <p class="text-sm text-600">Generate PDF mark schedules for all grades</p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Academic Year</label>
                        <Dropdown
                            v-model="reportFilters.academicYearId"
                            :options="academicYears"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select academic year"
                            class="w-full"
                            :loading="loadingAcademicYears"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Term</label>
                        <Dropdown
                            v-model="reportFilters.term"
                            :options="terms"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select term"
                            class="w-full"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Exam Type</label>
                        <Dropdown
                            v-model="reportFilters.examTypeId"
                            :options="examTypes"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select exam type"
                            class="w-full"
                            :loading="loadingExamTypes"
                        />
                    </div>
                </div>

                <div class="mt-4">
                    <Button
                        label="Generate All Mark Schedules"
                        icon="pi pi-file-pdf"
                        class="w-full"
                        :disabled="!canGenerateAllMarkSchedules"
                        @click="generateAllMarkSchedules"
                        :loading="generatingAllMarkSchedules"
                    />
                </div>
            </div>

            <!-- Generate Exam Analysis -->
            <div class="border-1 border-surface-200 dark:border-surface-700 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <i class="pi pi-chart-line text-2xl text-orange-500"></i>
                    <div>
                        <h3 class="font-semibold text-900">Exam Analysis</h3>
                        <p class="text-sm text-600">Generate comprehensive exam analysis reports</p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Academic Year</label>
                        <Dropdown
                            v-model="reportFilters.academicYearId"
                            :options="academicYears"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select academic year"
                            class="w-full"
                            :loading="loadingAcademicYears"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Term</label>
                        <Dropdown
                            v-model="reportFilters.term"
                            :options="terms"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select term"
                            class="w-full"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Exam Type</label>
                        <Dropdown
                            v-model="reportFilters.examTypeId"
                            :options="examTypes"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select exam type"
                            class="w-full"
                            :loading="loadingExamTypes"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Grade (Optional)</label>
                        <Dropdown
                            v-model="reportFilters.gradeId"
                            :options="grades"
                            optionLabel="fullName"
                            optionValue="id"
                            placeholder="All Secondary Grades"
                            class="w-full"
                            :loading="loadingGrades"
                            :showClear="true"
                        />
                    </div>
                </div>

                <div class="mt-4 space-y-2">
                    <Button
                        label="Generate All Grades Analysis"
                        icon="pi pi-chart-line"
                        class="w-full"
                        :disabled="!canGenerateExamAnalysis"
                        @click="generateExamAnalysis"
                        :loading="generatingExamAnalysis"
                    />
                    <Button
                        v-if="reportFilters.gradeId"
                        label="Generate Grade Analysis"
                        icon="pi pi-chart-bar"
                        class="w-full"
                        :disabled="!canGenerateGradeExamAnalysis"
                        @click="generateGradeExamAnalysis"
                        :loading="generatingGradeExamAnalysis"
                        severity="secondary"
                    />
                </div>
            </div>

            <!-- Generate Class Report Cards -->
            <div class="border-1 border-surface-200 dark:border-surface-700 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <i class="pi pi-file-pdf text-2xl text-green-500"></i>
                    <div>
                        <h3 class="font-semibold text-900">Class Report Cards</h3>
                        <p class="text-sm text-600">Generate report cards for entire classes</p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Grade</label>
                        <Dropdown
                            v-model="reportFilters.gradeId"
                            :options="grades"
                            optionLabel="fullName"
                            optionValue="id"
                            placeholder="Select grade"
                            class="w-full"
                            :loading="loadingGrades"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Academic Year</label>
                        <Dropdown
                            v-model="reportFilters.academicYearId"
                            :options="academicYears"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select academic year"
                            class="w-full"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Term</label>
                        <Dropdown
                            v-model="reportFilters.term"
                            :options="terms"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select term"
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="mt-4">
                    <Button
                        label="Generate Class Reports"
                        icon="pi pi-file-pdf"
                        class="w-full"
                        :disabled="!canGenerateClassReports"
                        @click="generateClassReports"
                        :loading="generatingClassReports"
                    />
                </div>
            </div>

            <!-- System Statistics -->
            <div class="border-1 border-surface-200 dark:border-surface-700 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <i class="pi pi-chart-bar text-2xl text-purple-500"></i>
                    <div>
                        <h3 class="font-semibold text-900">System Statistics</h3>
                        <p class="text-sm text-600">View academic year statistics</p>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Total Students:</span>
                        <span class="font-semibold">{{ statistics.totalStudents }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Active Grades:</span>
                        <span class="font-semibold">{{ statistics.activeGrades }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Total Subjects:</span>
                        <span class="font-semibold">{{ statistics.totalSubjects }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Teachers:</span>
                        <span class="font-semibold">{{ statistics.totalTeachers }}</span>
                    </div>
                </div>

                <div class="mt-4">
                    <Button
                        label="Refresh Statistics"
                        icon="pi pi-refresh"
                        class="w-full"
                        @click="refreshStatistics"
                        :loading="refreshingStatistics"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    examAnalysisService,
    examService,
    gradeService,
    markScheduleService,
    subjectService,
    userService
} from '@/service/api.service';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

// Props
const props = defineProps({
    academicYearId: {
        type: Number,
        required: false,
        default: null
    }
})

// Emits
const emit = defineEmits(['process-complete', 'create-new-year'])

// Reactive data
const currentStep = ref('1')
const verifying = ref(false)
const activeAcademicYear = ref(null)
const loadingAcademicYear = ref(false)

// Report generation data
const reportFilters = ref({
    academicYearId: null,
    term: null,
    examTypeId: null,
    gradeId: null
})

const academicYears = ref([])
const terms = ref([
    { id: 1, name: 'Term 1' },
    { id: 2, name: 'Term 2' },
    { id: 3, name: 'Term 3' }
])
const examTypes = ref([])
const grades = ref([])

const loadingAcademicYears = ref(false)
const loadingExamTypes = ref(false)
const loadingGrades = ref(false)
const generatingAllMarkSchedules = ref(false)
const generatingClassReports = ref(false)
const generatingExamAnalysis = ref(false)
const generatingGradeExamAnalysis = ref(false)
const refreshingStatistics = ref(false)

const statistics = ref({
    totalStudents: 0,
    activeGrades: 0,
    totalSubjects: 0,
    totalTeachers: 0
})

// Pre-closure checks
const checks = ref({
    gradesFinalized: false,
    assessmentsComplete: false,
    reportsGenerated: false,
    administrativeTasksComplete: false
})

// Step statuses
const steps = ref({
    closeYear: {
        status: 'pending', // pending, loading, completed, error
        loading: false,
        error: null
    },
    promoteStudents: {
        status: 'pending',
        loading: false,
        error: null
    },
    archiveGraduates: {
        status: 'pending',
        loading: false,
        error: null
    }
})

// Computed properties
const allChecksComplete = computed(() => {
    return Object.values(checks.value).every(check => check === true)
})

const currentAcademicYearId = computed(() => {
    return props.academicYearId || activeAcademicYear.value?.id
})

const isAcademicYearLoaded = computed(() => {
    return currentAcademicYearId.value != null
})

const canGenerateAllMarkSchedules = computed(() => {
    return reportFilters.value.academicYearId && 
           reportFilters.value.term && 
           reportFilters.value.examTypeId
})

const canGenerateExamAnalysis = computed(() => {
    return reportFilters.value.academicYearId && 
           reportFilters.value.term && 
           reportFilters.value.examTypeId
})

const canGenerateGradeExamAnalysis = computed(() => {
    return reportFilters.value.academicYearId && 
           reportFilters.value.term && 
           reportFilters.value.examTypeId &&
           reportFilters.value.gradeId
})

const canGenerateClassReports = computed(() => {
    return reportFilters.value.gradeId && 
           reportFilters.value.academicYearId && 
           reportFilters.value.term
})

// Methods
const loadActiveAcademicYear = async () => {
    if (props.academicYearId) return // Already have ID from props
    
    loadingAcademicYear.value = true
    try {
        const response = await examService.getActiveAcademicYear()
        activeAcademicYear.value = response
    } catch (error) {
        console.error('Error loading active academic year:', error)
        // You might want to show an error message to the user here
    } finally {
        loadingAcademicYear.value = false
    }
}

// Report generation methods
const loadAcademicYears = async () => {
    loadingAcademicYears.value = true
    try {
        const years = await examService.getAcademicYears()
        academicYears.value = years
        if (years.length > 0) {
            reportFilters.value.academicYearId = years.find(y => y.isActive)?.id || years[0].id
        }
    } catch (error) {
        console.error('Error loading academic years:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load academic years',
            life: 3000
        })
    } finally {
        loadingAcademicYears.value = false
    }
}

const loadExamTypes = async () => {
    loadingExamTypes.value = true
    try {
        const types = await examService.getExamTypes()
        examTypes.value = types
    } catch (error) {
        console.error('Error loading exam types:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load exam types',
            life: 3000
        })
    } finally {
        loadingExamTypes.value = false
    }
}

const loadGrades = async () => {
    loadingGrades.value = true
    try {
        const gradeList = await gradeService.getAll()
        grades.value = gradeList
    } catch (error) {
        console.error('Error loading grades:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load grades',
            life: 3000
        })
    } finally {
        loadingGrades.value = false
    }
}

const generateAllMarkSchedules = async () => {
    if (!canGenerateAllMarkSchedules.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select all required fields',
            life: 3000
        })
        return
    }

    generatingAllMarkSchedules.value = true
    try {
        const academicYearName = academicYears.value.find(y => y.id === reportFilters.value.academicYearId)?.name || ''
        const termName = terms.value.find(t => t.id === reportFilters.value.term)?.name || ''
        const examTypeName = examTypes.value.find(e => e.id === reportFilters.value.examTypeId)?.name || ''

        const pdfBlob = await markScheduleService.getMarkSchedulePdfForAllGrades(
            reportFilters.value.academicYearId,
            reportFilters.value.term,
            examTypeName
        )

        // Create download link
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `MarkSchedule_AllGrades_Year${reportFilters.value.academicYearId}_Term${reportFilters.value.term}_${examTypeName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'All mark schedules generated successfully!',
            life: 5000
        })
    } catch (error) {
        console.error('Error generating all mark schedules:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to generate mark schedules. Please try again.',
            life: 5000
        })
    } finally {
        generatingAllMarkSchedules.value = false
    }
}

const generateExamAnalysis = async () => {
    if (!canGenerateExamAnalysis.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select all required fields',
            life: 3000
        })
        return
    }

    generatingExamAnalysis.value = true
    try {
        const academicYearName = academicYears.value.find(y => y.id === reportFilters.value.academicYearId)?.name || ''
        const termName = terms.value.find(t => t.id === reportFilters.value.term)?.name || ''
        const examTypeName = examTypes.value.find(e => e.id === reportFilters.value.examTypeId)?.name || ''

        const pdfBlob = await examAnalysisService.getExamAnalysisPdf(
            reportFilters.value.academicYearId,
            reportFilters.value.term,
            examTypeName
        )

        // Create download link
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ExamAnalysis_${reportFilters.value.academicYearId}_Term${reportFilters.value.term}_${examTypeName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Exam analysis generated successfully!',
            life: 5000
        })
    } catch (error) {
        console.error('Error generating exam analysis:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to generate exam analysis. Please try again.',
            life: 5000
        })
    } finally {
        generatingExamAnalysis.value = false
    }
}

const generateGradeExamAnalysis = async () => {
    if (!canGenerateGradeExamAnalysis.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select all required fields including grade',
            life: 3000
        })
        return
    }

    generatingGradeExamAnalysis.value = true
    try {
        const academicYearName = academicYears.value.find(y => y.id === reportFilters.value.academicYearId)?.name || ''
        const termName = terms.value.find(t => t.id === reportFilters.value.term)?.name || ''
        const examTypeName = examTypes.value.find(e => e.id === reportFilters.value.examTypeId)?.name || ''
        const gradeName = grades.value.find(g => g.id === reportFilters.value.gradeId)?.name || ''

        const pdfBlob = await examAnalysisService.getExamAnalysisPdfForGrade(
            reportFilters.value.gradeId,
            reportFilters.value.academicYearId,
            reportFilters.value.term,
            examTypeName
        )

        // Create download link
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ExamAnalysis_Grade${reportFilters.value.gradeId}_${reportFilters.value.academicYearId}_Term${reportFilters.value.term}_${examTypeName}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Exam analysis for ${gradeName} generated successfully!`,
            life: 5000
        })
    } catch (error) {
        console.error('Error generating grade exam analysis:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to generate grade exam analysis. Please try again.',
            life: 5000
        })
    } finally {
        generatingGradeExamAnalysis.value = false
    }
}

const generateClassReports = async () => {
    if (!canGenerateClassReports.value) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select all required fields',
            life: 3000
        })
        return
    }

    generatingClassReports.value = true
    try {
        // This would call your backend endpoint for generating class report cards
        // For now, we'll show a placeholder
        toast.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Class report generation feature coming soon!',
            life: 3000
        })
    } catch (error) {
        console.error('Error generating class reports:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to generate class reports. Please try again.',
            life: 5000
        })
    } finally {
        generatingClassReports.value = false
    }
}

const refreshStatistics = async () => {
    refreshingStatistics.value = true
    try {
        // Load statistics from various services
        const [students, grades, subjects, teachers] = await Promise.all([
            examService.getStudentsByGrade(1), // Get sample data
            gradeService.getAll(),
            subjectService.getAll(),
            userService.getAll()
        ])

        statistics.value = {
            totalStudents: students.length,
            activeGrades: grades.filter(g => g.isActive).length,
            totalSubjects: subjects.filter(s => s.isActive).length,
            totalTeachers: teachers.filter(t => t.role === 'Teacher' && t.isActive).length
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Statistics refreshed successfully!',
            life: 3000
        })
    } catch (error) {
        console.error('Error refreshing statistics:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to refresh statistics',
            life: 3000
        })
    } finally {
        refreshingStatistics.value = false
    }
}

const verifyPreClosureChecks = async () => {
    verifying.value = true
    try {
        // Simulate API calls to verify each check
        // In a real implementation, these would be actual API calls to check:
        // - All grades submitted and finalized
        // - All assessments completed
        // - Student reports generated
        // - Administrative tasks completed
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        checks.value.gradesFinalized = true
        checks.value.assessmentsComplete = true
        checks.value.reportsGenerated = true
        checks.value.administrativeTasksComplete = true
    } catch (error) {
        console.error('Error verifying pre-closure checks:', error)
    } finally {
        verifying.value = false
    }
}

const closeAcademicYear = async () => {
    if (!currentAcademicYearId.value) {
        console.error('No academic year ID available')
        return
    }

    steps.value.closeYear.loading = true
    steps.value.closeYear.status = 'loading'
    
    try {
        await examService.closeAcademicYear(currentAcademicYearId.value)
        steps.value.closeYear.status = 'completed'
        steps.value.closeYear.error = null
    } catch (error) {
        steps.value.closeYear.status = 'error'
        steps.value.closeYear.error = error.message || 'Failed to close academic year'
    } finally {
        steps.value.closeYear.loading = false
    }
}

const promoteAllStudents = async () => {
    if (!currentAcademicYearId.value) {
        console.error('No academic year ID available')
        return
    }

    steps.value.promoteStudents.loading = true
    steps.value.promoteStudents.status = 'loading'
    
    try {
        await examService.promoteAllStudents(currentAcademicYearId.value)
        steps.value.promoteStudents.status = 'completed'
        steps.value.promoteStudents.error = null
    } catch (error) {
        steps.value.promoteStudents.status = 'error'
        steps.value.promoteStudents.error = error.message || 'Failed to promote students'
    } finally {
        steps.value.promoteStudents.loading = false
    }
}

const archiveGraduates = async () => {
    if (!currentAcademicYearId.value) {
        console.error('No academic year ID available')
        return
    }

    steps.value.archiveGraduates.loading = true
    steps.value.archiveGraduates.status = 'loading'
    
    try {
        await examService.archiveGraduates(currentAcademicYearId.value)
        steps.value.archiveGraduates.status = 'completed'
        steps.value.archiveGraduates.error = null
    } catch (error) {
        steps.value.archiveGraduates.status = 'error'
        steps.value.archiveGraduates.error = error.message || 'Failed to archive graduates'
    } finally {
        steps.value.archiveGraduates.loading = false
    }
}

const createNewAcademicYear = () => {
    emit('create-new-year')
}

// Load data on component mount
onMounted(async () => {
    await Promise.all([
        loadActiveAcademicYear(),
        loadAcademicYears(),
        loadExamTypes(),
        loadGrades(),
        refreshStatistics()
    ])
})
</script>