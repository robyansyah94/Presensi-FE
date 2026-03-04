<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-primary/10 overflow-hidden border-2 border-white shadow-sm"
          >
            <img
              :src="profileImage"
              alt="Profile"
              class="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-sm leading-tight">
              NAMA
            </h2>
            <p class="text-xs text-gray-500">JABATAN</p>
          </div>
        </div>
      </div>

      <!-- Title Area -->
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800">Presensi</h1>
        <p class="text-sm text-gray-400 px-4 mt-2">
          Pilih jenis presensi Anda hari ini.
        </p>
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
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { LogIn as LogInIcon } from "lucide-vue-next";

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

</script>

