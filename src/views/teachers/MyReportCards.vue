<template>




</template>




<script>

import { authService, examService, gradeService } from '@/service/api.service';

const assignments = ref([]);
const loading = ref(false);
const userProfile = ref(null);


const fetchAssignments = async () => {
  loading.value = true;
  try {
    const response = await examService.getTeacherAssignments();
    assignments.value = response;
  } catch (error) {
    console.error('Error fetching assignments:', error);
  } finally {
    loading.value = false;
  }
};



const fetchUserProfile = async () => {
  try {
    // Replace with your actual user service or API call
    userProfile.value = await authService.getProfile();
  } catch (error) {
    console.error('Failed to fetch user profile', error);
  }
};

const myHomeroomGrades = computed(() => {
  if (!userProfile.value) return [];
  return allGrades.value.filter(
    g => g.homeroomTeacherId != null && g.homeroomTeacherId == userProfile.value.id
  );
});




</script>