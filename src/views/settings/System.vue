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
</template>

<script setup>
import { examService } from '@/service/api.service';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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
        console.error('Error closing academic year:', error)
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
        console.error('Error promoting students:', error)
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
        
        // Emit event when entire process is complete
        if (isProcessComplete.value) {
            emit('process-complete', {
                academicYearId: currentAcademicYearId.value,
                completedSteps: ['close', 'promote', 'archive']
            })
        }
    } catch (error) {
        steps.value.archiveGraduates.status = 'error'
        steps.value.archiveGraduates.error = error.message || 'Failed to archive graduates'
        console.error('Error archiving graduates:', error)
    } finally {
        steps.value.archiveGraduates.loading = false
    }
}

const createNewAcademicYear = () => {
    //emit('create-new-year')
    router.push({name: 'ManageYears'});
}

// Computed property to check if entire process is complete
const isProcessComplete = computed(() => {
    return steps.value.closeYear.status === 'completed' &&
           steps.value.promoteStudents.status === 'completed' &&
           steps.value.archiveGraduates.status === 'completed'
})

// Load active academic year on component mount
import { onMounted } from 'vue';
onMounted(() => {
    loadActiveAcademicYear()
})
</script>