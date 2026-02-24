<template>
  <div class="h-[100dvh] bg-gray-50 flex justify-center overflow-hidden">
    <div class="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl shadow-black/5">
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto pb-32">
        <router-view />
      </main>

    <!-- Bottom Navigation -->
    <nav class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center px-6 pt-3 pb-8 z-50 bottom-nav-shadow rounded-t-[2.5rem]">
      <router-link to="/home" class="flex flex-col items-center gap-1 transition-colors" :class="$route.path === '/home' ? 'text-primary' : 'text-gray-400'">
        <HomeIcon :size="24" />
        <span class="text-[10px] font-medium">Home</span>
      </router-link>

      <router-link to="/history" class="flex flex-col items-center gap-1 transition-colors" :class="$route.path === '/history' ? 'text-primary' : 'text-gray-400'">
        <CalendarClockIcon :size="24" />
        <span class="text-[10px] font-medium">Riwayat</span>
      </router-link>

      <!-- Center Scanner Button -->
      <div class="relative -mt-12">
        <router-link to="/presensi" class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white transform transition-transform active:scale-90">
          <ScanLineIcon :size="32" class="text-white" />
        </router-link>
      </div>

      <router-link to="/submission" class="flex flex-col items-center gap-1 transition-colors" :class="$route.path === '/submission' ? 'text-primary' : 'text-gray-400'">
        <FileTextIcon :size="24" />
        <span class="text-[10px] font-medium">Pengajuan</span>
      </router-link>

      <router-link to="/profile" class="flex flex-col items-center gap-1 transition-colors" :class="$route.path === '/profile' ? 'text-primary' : 'text-gray-400'">
        <UserIcon :size="24" />
        <span class="text-[10px] font-medium">Profil</span>
      </router-link>
    </nav>
    </div>
  </div>
</template>

<script setup>
import { 
  Home as HomeIcon, 
  CalendarClock as CalendarClockIcon, 
  ScanLine as ScanLineIcon, 
  FileText as FileTextIcon, 
  User as UserIcon 
} from 'lucide-vue-next';
</script>

<style scoped>
.bottom-nav-shadow {
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.05);
}

.router-link-active {
  @apply text-primary;
}

.router-link-active span {
  @apply font-bold;
}
</style>
