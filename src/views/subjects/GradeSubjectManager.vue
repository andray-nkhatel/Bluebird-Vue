<template>
  <div class="grade-subject-manager">
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-2xl font-semibold m-0">
            <i class="pi pi-cog mr-2"></i>
            Grade Subject Configuration
          </h2>
          <p class="text-500 mt-2 mb-0">
            Manage which subjects are core or optional for each grade. 
            <span class="text-primary font-medium">Optional subjects</span> require student enrollment before teachers can enter scores.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <label for="gradeFilter" class="block font-medium mb-2">Filter by Grade</label>
          <Dropdown
            id="gradeFilter"
            v-model="selectedGradeFilter"
            :options="gradesWithAll"
            optionLabel="fullName"
            optionValue="id"
            placeholder="All Grades"
            class="w-full"
            showClear
            @change="loadGradeSubjects"
          />
        </div>
        <div class="col-12 md:col-4">
          <label for="subjectSearch" class="block font-medium mb-2">Search Subject</label>
          <InputText
            id="subjectSearch"
            v-model="subjectSearch"
            placeholder="Search by subject name..."
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-4">
          <label for="typeFilter" class="block font-medium mb-2">Subject Type</label>
          <Dropdown
            id="typeFilter"
            v-model="typeFilter"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Types"
            class="w-full"
            showClear
          />
        </div>
      </div>

      <!-- Info Banner -->
      <Message severity="info" :closable="false" class="mb-4">
        <div class="flex align-items-center">
          <i class="pi pi-info-circle mr-2"></i>
          <div>
            <strong>Core vs Optional Subjects:</strong>
            <ul class="m-0 pl-4 mt-2">
              <li><strong>Core subjects:</strong> All students in the grade automatically have this subject. Teachers can enter scores for any student.</li>
              <li><strong>Optional subjects:</strong> Students must be enrolled first. Teachers can only enter scores for enrolled students.</li>
            </ul>
          </div>
        </div>
      </Message>

      <!-- Data Table -->
      <DataTable
        :value="filteredGradeSubjects"
        :loading="loading"
        :paginator="true"
        :rows="15"
        :rowsPerPageOptions="[10, 15, 25, 50]"
        dataKey="id"
        filterDisplay="row"
        responsiveLayout="scroll"
        :globalFilterFields="['gradeName', 'subjectName', 'subjectCode']"
        class="p-datatable-sm"
        stripedRows
        :sortField="'gradeLevel'"
        :sortOrder="1"
      >
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-inbox text-4xl text-300 mb-3"></i>
            <p class="text-500">No grade-subject assignments found.</p>
          </div>
        </template>

        <Column field="gradeName" header="Grade" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <div class="flex align-items-center">
              <Tag :value="data.gradeName" severity="secondary" class="mr-2" />
            </div>
          </template>
        </Column>

        <Column field="subjectName" header="Subject" sortable style="min-width: 14rem">
          <template #body="{ data }">
            <div>
              <span class="font-medium">{{ data.subjectName }}</span>
              <span class="text-500 text-sm ml-2">({{ data.subjectCode }})</span>
            </div>
          </template>
        </Column>

        <Column field="isOptional" header="Subject Type" sortable style="min-width: 10rem">
          <template #body="{ data }">
            <Tag 
              :value="data.isOptional ? 'Optional' : 'Core'" 
              :severity="data.isOptional ? 'warning' : 'success'"
              :icon="data.isOptional ? 'pi pi-star' : 'pi pi-check-circle'"
            />
          </template>
        </Column>

        <Column header="Actions" style="min-width: 14rem">
          <template #body="{ data }">
            <div class="flex gap-2 align-items-center">
              <Button
                v-if="data.isOptional"
                label="Make Core"
                icon="pi pi-check-circle"
                severity="success"
                size="small"
                outlined
                @click="updateSubjectType(data, false)"
                :loading="updatingId === data.id"
                v-tooltip.top="'All students will automatically have this subject'"
              />
              <Button
                v-else
                label="Make Optional"
                icon="pi pi-star"
                severity="warning"
                size="small"
                outlined
                @click="confirmMakeOptional(data)"
                :loading="updatingId === data.id"
                v-tooltip.top="'Only enrolled students can receive scores'"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Summary Stats -->
      <div class="grid mt-4" v-if="!loading && filteredGradeSubjects.length > 0">
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3 text-center">
            <div class="text-2xl font-bold text-primary">{{ totalCount }}</div>
            <div class="text-500 text-sm">Total Assignments</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3 text-center">
            <div class="text-2xl font-bold text-green-500">{{ coreCount }}</div>
            <div class="text-500 text-sm">Core Subjects</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3 text-center">
            <div class="text-2xl font-bold text-orange-500">{{ optionalCount }}</div>
            <div class="text-500 text-sm">Optional Subjects</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog 
      v-model:visible="showConfirmDialog" 
      :style="{ width: '450px' }" 
      header="Confirm Change to Optional"
      :modal="true"
    >
      <div class="flex align-items-center gap-3 mb-3">
        <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
        <div>
          <p class="m-0">
            Are you sure you want to make <strong>{{ selectedItem?.subjectName }}</strong> 
            an <strong>optional subject</strong> for <strong>{{ selectedItem?.gradeName }}</strong>?
          </p>
          <p class="text-500 text-sm mt-2 mb-0">
            <i class="pi pi-info-circle mr-1"></i>
            Students will need to be enrolled in this subject before teachers can enter scores for them.
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="showConfirmDialog = false" />
        <Button label="Make Optional" icon="pi pi-star" severity="warning" @click="confirmUpdateToOptional" :loading="updatingId !== null" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script>
import { gradeService, subjectService } from '@/service/api.service';

export default {
  name: 'GradeSubjectManager',
  
  data() {
    return {
      gradeSubjects: [],
      grades: [],
      loading: false,
      selectedGradeFilter: null,
      subjectSearch: '',
      typeFilter: null,
      typeOptions: [
        { label: 'Core Subjects', value: 'core' },
        { label: 'Optional Subjects', value: 'optional' }
      ],
      updatingId: null,
      showConfirmDialog: false,
      selectedItem: null
    };
  },

  computed: {
    gradesWithAll() {
      return this.grades;
    },

    filteredGradeSubjects() {
      let filtered = [...this.gradeSubjects];

      // Filter by subject search
      if (this.subjectSearch) {
        const search = this.subjectSearch.toLowerCase();
        filtered = filtered.filter(gs => 
          gs.subjectName.toLowerCase().includes(search) ||
          gs.subjectCode.toLowerCase().includes(search)
        );
      }

      // Filter by type
      if (this.typeFilter) {
        if (this.typeFilter === 'core') {
          filtered = filtered.filter(gs => !gs.isOptional);
        } else if (this.typeFilter === 'optional') {
          filtered = filtered.filter(gs => gs.isOptional);
        }
      }

      return filtered;
    },

    totalCount() {
      return this.filteredGradeSubjects.length;
    },

    coreCount() {
      return this.filteredGradeSubjects.filter(gs => !gs.isOptional).length;
    },

    optionalCount() {
      return this.filteredGradeSubjects.filter(gs => gs.isOptional).length;
    }
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadGrades(),
          this.loadGradeSubjects()
        ]);
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load data',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    async loadGrades() {
      try {
        this.grades = await gradeService.getAll();
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    },

    async loadGradeSubjects() {
      this.loading = true;
      try {
        this.gradeSubjects = await subjectService.getGradeSubjects(this.selectedGradeFilter);
      } catch (error) {
        console.error('Error loading grade subjects:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load grade-subject assignments',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    confirmMakeOptional(item) {
      this.selectedItem = item;
      this.showConfirmDialog = true;
    },

    async confirmUpdateToOptional() {
      if (this.selectedItem) {
        await this.updateSubjectType(this.selectedItem, true);
        this.showConfirmDialog = false;
        this.selectedItem = null;
      }
    },

    async updateSubjectType(item, isOptional) {
      this.updatingId = item.id;
      try {
        await subjectService.updateGradeSubject(item.id, { isOptional });
        
        // Update local state
        const index = this.gradeSubjects.findIndex(gs => gs.id === item.id);
        if (index !== -1) {
          this.gradeSubjects[index].isOptional = isOptional;
        }

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `${item.subjectName} is now ${isOptional ? 'optional' : 'a core subject'} for ${item.gradeName}`,
          life: 4000
        });
      } catch (error) {
        console.error('Error updating subject type:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update subject type',
          life: 3000
        });
      } finally {
        this.updatingId = null;
      }
    }
  }
};
</script>

<style scoped>
.grade-subject-manager {
  padding: 1rem;
}

.card {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: var(--surface-50);
  font-weight: 600;
}

:deep(.p-tag) {
  font-size: 0.75rem;
}

:deep(.p-message) {
  margin: 0;
}

:deep(.p-message .p-message-wrapper) {
  padding: 0.75rem 1rem;
}
</style>

