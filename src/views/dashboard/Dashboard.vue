<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-blue-100 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Total Teachers</h2>
      <p class="text-2xl text-blue-900">{{ teacherCount }}</p>
    </div>
    <div class="bg-blue-100 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Active Teachers</h2>
      <p class="text-2xl text-blue-900">{{ activeTeacherCount }}</p>
    </div>
    <div class="bg-blue-100 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Students</h2>
      <p class="text-2xl text-blue-900">{{ students }}</p>
    </div>
    <div class="bg-blue-100 p-4 dark:bg-black dark:text-blue-50 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Classes</h2>
      <p class="text-2xl text-blue-900">{{ grades.length }}</p>
    </div>
    <div class="bg-blue-100 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Active Assignments</h2>
      <p class="text-2xl text-blue-900">{{ teacherAssignmentStats.totalActiveAssignments }}</p>
    </div>
    <div class="bg-blue-100 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <h2 class="text-lg font-semibold text-blue-900">Teachers with Assignments</h2>
      <p class="text-2xl text-blue-900">{{ teacherAssignmentStats.totalTeachersWithAssignments }}</p>
    </div>
  </div>

  <Divider class="my-10" />

  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <!-- Bar Chart: Grade Distribution -->
    <div class="bg-blue-50 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <Chart
        type="bar"
        :data="gradeChartData"
        :options="gradeChartOptions"
        class="w-full md:w-[30rem] h-[28rem] "
      />
    </div>

    <!-- Radar Chart: Exam Stats -->
    <div class="bg-blue-50 p-4 dark:bg-black dark:text-blue-50 rounded shadow">
      <Chart
        type="radar"
        :data="examRadarChartData"
        :options="examRadarChartOptions"
        class="w-full md:w-[30rem] h-[28rem]"
      />
    </div>

    <!-- Doughnut Chart: Teacher Assignment Stats -->
    <div class="bg-blue-50 dark:bg-black dark:text-blue-50 p-4 rounded shadow">
      <Chart
        type="doughnut"
        :data="assignmentDoughnutChartData"
        :options="assignmentDoughnutChartOptions"
        class="w-full md:w-[30rem] h-[28rem]"
      />
    </div>
  </div>

  <Divider class="my-10" />
  <h3 class="text-blue-900">Class Overview</h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="grade in grades"
      :key="grade.id"
      class="bg-blue-50 dark:bg-black p-4 rounded shadow"
       
    >
      <h2 class="text-lg font-semibold dark:text-blue-50 text-blue-900">{{ grade.fullName }}</h2>
      <small class="pi pi-user dark:text-blue-50 text-blue-800">
        <span class="ml-3 dark:text-blue-50">{{ grade.studentCount }} students</span>
      </small>
      <p class="text-l text-blue-800 dark:text-blue-50">{{ grade.homeroomTeacherName || 'N/A' }}</p>
    </div>
  </div>
</template>

<script setup>
import { examService, gradeService, studentService, userService } from '@/service/api.service';
import { computed, onMounted, ref } from 'vue';

const teacherCount = ref(0);
const activeTeacherCount = ref(0);
const students = ref(0);
const grades = ref([]);

const teacherAssignmentStats = ref({
  totalActiveAssignments: 0,
  totalTeachersWithAssignments: 0,
  assignmentsBySubjectAndGrade: []
});

const examStats = ref({
  Count: 0,
  Average: 0,
  Minimum: 0,
  Maximum: 0,
  PassingRate: 0,
  GradeDistribution: {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0
  }
});

// Monotone blue palette for cards (cycling through blue shades)
const colorPalette = [
  'bg-blue-50',
  'bg-blue-100',
  'bg-blue-200',
  'bg-blue-300',
  'bg-blue-400',
  'bg-blue-500',
  'bg-blue-600',
  'bg-blue-700',
  'bg-blue-800',
  'bg-blue-900'
];

// Monotone blue palette for charts
const chartColors = [
  '#eff6ff', // blue-50
  '#dbeafe', // blue-100
  '#bfdbfe', // blue-200
  '#93c5fd', // blue-300
  '#60a5fa', // blue-400
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#1e40af', // blue-800
  '#1e3a8a'  // blue-900
];

// 1. Bar Chart: Grade Distribution (students per grade)
const gradeChartData = computed(() => {
  if (!grades.value.length) return { labels: [], datasets: [] };
  return {
    labels: grades.value.map(g => g.fullName),
    datasets: [
      {
        label: 'Students per Grade',
        data: grades.value.map(g => g.studentCount),
        backgroundColor: grades.value.map((_, idx) => chartColors[idx % chartColors.length]),
        borderColor: grades.value.map((_, idx) => chartColors[(idx + 2) % chartColors.length]),
        borderWidth: 2,
      }
    ]
  };
});

const gradeChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.75,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        color: '#1e3a8a', // blue-900
        font: { size: 14 }
      }
    },
    title: {
      display: true,
      text: 'Student Distribution by Grade',
      color: '#1e3a8a',
      font: { size: 18 }
    }
  },
  scales: {
    x: {
      ticks: { color: '#1e3a8a', font: { size: 12 } },
      grid: { color: '#dbeafe' }
    },
    y: {
      ticks: { color: '#1e3a8a', font: { size: 12 } },
      grid: { color: '#dbeafe' }
    }
  }
}));

// 2. Doughnut Chart: Teacher Assignment Stats (by subject)
const assignmentDoughnutChartData = computed(() => {
  const data = teacherAssignmentStats.value.assignmentsBySubjectAndGrade || [];
  if (!data.length) return { labels: [], datasets: [] };
  // Group by subject and sum teacherCount per subject
  const subjectMap = {};
  data.forEach(item => {
    if (!subjectMap[item.subject]) subjectMap[item.subject] = 0;
    subjectMap[item.subject] += item.teacherCount;
  });
  const labels = Object.keys(subjectMap);
  const values = Object.values(subjectMap);
  return {
    labels,
    datasets: [
      {
        label: 'Teachers per Subject',
        data: values,
        backgroundColor: labels.map((_, idx) => chartColors[idx % chartColors.length]),
        borderColor: labels.map((_, idx) => chartColors[(idx + 2) % chartColors.length]),
        borderWidth: 2,
      }
    ]
  };
});

const assignmentDoughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.75,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        color: '#1e3a8a',
        font: { size: 14 }
      }
    },
    title: {
      display: true,
      text: 'Teachers with Assignments by Subject',
      color: '#1e3a8a',
      font: { size: 18 }
    }
  }
}));

// 3. Radar Chart: Exam Stats (Grade Distribution)
const examRadarChartData = computed(() => {
  const dist = examStats.value.GradeDistribution || {};
  const labels = ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (<60)'];
  const data = [
    dist.A || 0,
    dist.B || 0,
    dist.C || 0,
    dist.D || 0,
    dist.F || 0
  ];
  return {
    labels,
    datasets: [
      {
        label: 'Grade Distribution',
        data,
        backgroundColor: 'rgba(59,130,246,0.2)', // blue-500 with opacity
        borderColor: '#1e40af', // blue-800
        pointBackgroundColor: '#3b82f6',
        borderWidth: 2,
      }
    ]
  };
});

const examRadarChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 0.75,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        color: '#1e3a8a',
        font: { size: 14 }
      }
    },
    title: {
      display: true,
      text: 'Exam Grade Distribution',
      color: '#1e3a8a',
      font: { size: 18 }
    }
  },
  scales: {
    r: {
      angleLines: { color: '#dbeafe' }, // blue-100
      grid: { color: '#dbeafe' },
      pointLabels: { color: '#1e3a8a', font: { size: 14 } },
      ticks: { color: '#1e3a8a', font: { size: 12 }, stepSize: 1 }
    }
  }
}));

onMounted(() => {
  userService.getAll()
    .then(response => {
      teacherCount.value = response.filter(user => user.role === 'Teacher').length;
      activeTeacherCount.value = response.filter(user => user.role === 'Teacher' && user.isActive).length;
    })
    .catch(error => {
      console.error('Error fetching users:', error);
    });

  studentService.getAll()
    .then(response => {
      students.value = response.length;
    })
    .catch(error => {
      console.error('Error fetching students:', error);
    });

  gradeService.getAll()
    .then(response => {
      grades.value = response;
    })
    .catch(error => {
      console.error('Error fetching grades:', error);
    });

  // Fetch teacher assignment stats for doughnut chart
  examService.getTeacherAssignmentsStats()
    .then(response => {
      teacherAssignmentStats.value = response;
    })
    .catch(error => {
      console.error('Error fetching teacher assignment stats:', error);
    });

  // Fetch exam stats for radar chart
  examService.statistics()
    .then(response => {
      examStats.value = response;
    })
    .catch(error => {
      console.error('Error fetching exam stats:', error);
    });
});
</script>