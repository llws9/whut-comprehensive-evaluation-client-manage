<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminHome from './components/AdminHome.vue'
import AdminGrades from './components/AdminGrades.vue'
import AdminReview from './components/AdminReview.vue'
import AdminPermissions from './components/AdminPermissions.vue'
import AdminStudents from './components/AdminStudents.vue'
import AdminScholarshipCheck from './components/AdminScholarshipCheck.vue'

const currentPage = ref('admin-login')

const handleHashChange = () => {
  const hash = window.location.hash.slice(1)
  if (hash === 'admin-home') {
    currentPage.value = 'admin-home'
  } else if (hash === 'admin-grades') {
    currentPage.value = 'admin-grades'
  } else if (hash === 'admin-review') {
    currentPage.value = 'admin-review'
  } else if (hash === 'admin-permissions') {
    currentPage.value = 'admin-permissions'
  } else if (hash === 'admin-students') {
    currentPage.value = 'admin-students'
  } else if (hash === 'admin-scholarship') {
    currentPage.value = 'admin-scholarship'
  } else {
    currentPage.value = 'admin-login'
  }
}

onMounted(() => {
  window.addEventListener('hashchange', handleHashChange)
  handleHashChange()
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
})
</script>

<template>
  <div class="app-container">
    <AdminLogin v-if="currentPage === 'admin-login'" />
    <AdminHome v-else-if="currentPage === 'admin-home'" />
    <AdminGrades v-else-if="currentPage === 'admin-grades'" />
    <AdminReview v-else-if="currentPage === 'admin-review'" />
    <AdminPermissions v-else-if="currentPage === 'admin-permissions'" />
    <AdminStudents v-else-if="currentPage === 'admin-students'" />
    <AdminScholarshipCheck v-else-if="currentPage === 'admin-scholarship'" />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
}
</style>
