<template>
  <div class="px-6 pt-8 pb-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-primary/10 overflow-hidden border-2 border-white shadow-sm">
          <img src="https://ui-avatars.com/api/?name=Johnny+Stanley&background=007770&color=fff" alt="Avatar" class="w-full h-full object-cover">
        </div>
        <div>
          <h2 class="font-bold text-gray-800 text-sm leading-tight">Johnny Stanley</h2>
          <p class="text-xs text-gray-500">Senior HR</p>
        </div>
      </div>
      <button class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
        <PlusCircleIcon :size="20" class="text-gray-400" />
      </button>
    </div>

    <!-- Title Area -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Pengajuan Izin</h1>
      <p class="text-sm text-gray-400">Ajukan cuti, izin, atau sakit dengan mudah.</p>
    </div>

    <!-- Content Area (Empty for now) -->
    <div class="mt-20 flex flex-col items-center justify-center opacity-40">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileTextIcon :size="40" class="text-gray-300" />
      </div>
      <p class="text-sm font-medium text-gray-400">Belum ada pengajuan aktif</p>
    </div>
  </div>
</template>

<script setup>
import { PlusCircle as PlusCircleIcon, FileText as FileTextIcon } from 'lucide-vue-next';
</script>
