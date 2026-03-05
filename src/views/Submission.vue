<template>
  <div class="px-6 pt-8 pb-4">
    <AppHeader>
      <button
        class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100"
      >
        <PlusCircleIcon :size="20" class="text-gray-400" />
      </button>
    </AppHeader>

    <!-- Title Area -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Pengajuan Izin</h1>
      <p class="text-sm text-gray-400">
        Ajukan cuti, izin, atau sakit dengan mudah.
      </p>
    </div>

    <!-- Content Area -->
    <div class="mt-20 flex flex-col items-center justify-center opacity-40">
      <div
        class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
      >
        <FileTextIcon :size="40" class="text-gray-300" />
      </div>
      <p class="text-sm font-medium text-gray-400">Belum ada pengajuan aktif</p>
    </div>
  </div>
</template>

<script setup>
import AppHeader from "@/components/AppHeader.vue";
import {
  PlusCircle as PlusCircleIcon,
  FileText as FileTextIcon,
} from "lucide-vue-next";
</script>
