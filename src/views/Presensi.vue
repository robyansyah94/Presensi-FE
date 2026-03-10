<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <!-- Header -->
    <div class="px-6 pt-8 pb-4">
      <AppHeader />
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-800">Presensi</h1>
      </div>
    </div>

    <!-- Clock Card -->
    <div class="px-6">
      <div
        class="bg-primary rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-xl shadow-primary/20"
      >
        <div class="relative z-10">
          <p class="text-white/70 text-sm font-medium mb-1">
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
    </div>

    <!-- Status Cards -->
    <div class="flex-1 px-6 pb-6 flex flex-col items-center">
      <div class="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
        <!-- Card 1: Masuk -->
        <div
          @click="goToScanner('in')"
          class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <LogInIcon :size="24" class="text-primary" />
          </div>
          <div class="text-center">
            <div
              class="text-[10px] font-black uppercase text-gray-400 tracking-wider"
            >
              Presensi
            </div>
            <div class="text-sm font-bold text-gray-800 leading-tight">
              Masuk Kerja
            </div>
          </div>
        </div>

        <!-- Card 2: Pulang -->
        <div
          @click="goToScanner('out')"
          class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 opacity-60 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all w-full"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center rotate-180"
          >
            <LogInIcon :size="24" class="text-rose-500" />
          </div>
          <div class="text-center">
            <div
              class="text-[10px] font-black uppercase text-gray-400 tracking-wider text-rose-500/50"
            >
              Presensi
            </div>
            <div class="text-sm font-bold text-gray-800 leading-tight">
              Pulang Kerja
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { LogIn as LogInIcon } from "lucide-vue-next";
import AppHeader from "@/components/AppHeader.vue";

const router = useRouter();

// 🔐 Proteksi halaman
onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/");
  }
});

const goToScanner = (type) => {
  router.push({ path: "/scanner", query: { type } });
};

// ── Jam real-time ─────────────────────────────────────────────────────────────
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
onUnmounted(() => clearInterval(timer));
</script>
