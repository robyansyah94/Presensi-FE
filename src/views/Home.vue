<template>
  <div class="px-6 pt-8 pb-4">
    <AppHeader class="mb-7">
      <button
        class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100"
      >
        <BellIcon :size="20" class="text-gray-400" />
      </button>
    </AppHeader>

    <!-- Real-time Clock Card -->
    <div
      class="bg-primary rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-xl shadow-primary/20"
    >
      <div class="relative z-10">
        <p class="text-primary-light/80 text-sm font-medium mb-1">
          {{ currentDate }}
        </p>
        <div class="text-4xl font-black tracking-wider mb-4">
          {{ currentTime }}
        </div>

        <div
          class="flex items-center gap-1.5 bg-white/20 w-max px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm"
        >
          <div
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
          ></div>
          Waktu Sekarang
        </div>
      </div>

      <div
        class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"
      ></div>
    </div>

    <!-- Attendance Summary -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
      <div
        class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Clock In</span
          >
          <div
            class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"
          >
            <LogInIcon :size="14" class="text-emerald-500" />
          </div>
        </div>

        <div class="text-lg font-bold text-gray-800">08 : 25</div>
      </div>

      <div
        class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Clock Out</span
          >
          <div
            class="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center rotate-180"
          >
            <LogInIcon :size="14" class="text-rose-500" />
          </div>
        </div>

        <div class="text-lg font-bold text-gray-800">-- : --</div>
      </div>
    </div>

    <!-- Section -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-gray-800">Kehadiran</h3>

      <button
        class="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/5"
      >
        Lihat Semua
      </button>
    </div>

    <div
      class="bg-white rounded-3xl p-10 flex flex-col items-center justify-center border border-dashed border-gray-200 opacity-60"
    >
      <LayoutGridIcon :size="48" class="text-gray-300 mb-4" />
      <p class="text-sm font-medium text-gray-500 italic">
        Konten tambahan segera...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AppHeader from "@/components/AppHeader.vue";

import {
  Bell as BellIcon,
  LogIn as LogInIcon,
  LayoutGrid as LayoutGridIcon,
} from "lucide-vue-next";

const currentTime = ref("");
const currentDate = ref("");

const updateTime = () => {
  const now = new Date();

  currentTime.value = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  currentDate.value = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

let timer;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>