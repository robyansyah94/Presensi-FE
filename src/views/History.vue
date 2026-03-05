<template>
  <div class="px-6 pt-8 pb-4">
    <AppHeader>
      <button
        class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100"
      >
        <CalendarIcon :size="20" class="text-gray-400" />
      </button>
    </AppHeader>

    <!-- Title -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Riwayat Presensi</h1>
      <p class="text-sm text-gray-400">Cek aktivitas kehadiran Anda di sini.</p>
    </div>
  </div>
</template>

<script setup>
import AppHeader from "@/components/AppHeader.vue";
import { Calendar as CalendarIcon } from "lucide-vue-next";
</script>
