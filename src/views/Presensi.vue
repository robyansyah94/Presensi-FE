<template>
  <div class="flex flex-col h-full bg-gray-50">
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

    <!-- Status badge hari ini -->
    <div class="px-6 mb-4">
      <!-- Skeleton -->
      <div
        v-if="loadingStatus"
        class="h-8 bg-gray-100 rounded-xl animate-pulse"
      ></div>

      <!-- Sudah selesai -->
      <div
        v-else-if="sudahPulang"
        class="flex items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-2xl py-2 px-4"
      >
        <div class="w-2 h-2 rounded-full bg-green-400"></div>
        <span class="text-xs font-bold text-green-600">
          Presensi hari ini selesai — Masuk {{ presensiHariIni.jam_masuk }},
          Pulang {{ presensiHariIni.jam_pulang }}
        </span>
      </div>

      <!-- Sudah masuk, belum pulang -->
      <div
        v-else-if="sudahMasuk"
        class="flex items-center justify-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl py-2 px-4"
      >
        <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
        <span class="text-xs font-bold text-amber-600">
          Sudah masuk jam {{ presensiHariIni.jam_masuk }} — silakan presensi
          pulang
        </span>
      </div>

      <!-- Belum masuk -->
      <div
        v-else
        class="flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl py-2 px-4"
      >
        <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
        <span class="text-xs font-bold text-blue-500">
          Belum presensi masuk hari ini
        </span>
      </div>
    </div>

    <!-- Cards -->
    <div class="flex-1 px-6 pb-6 flex flex-col items-center">
      <div class="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
        <!-- Card Masuk -->
        <div
          @click="handleCard('in')"
          class="bg-white p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all"
          :class="
            canMasuk
              ? 'border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-95'
              : 'border-gray-100 opacity-40 cursor-not-allowed'
          "
        >
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center"
            :class="canMasuk ? 'bg-primary/10' : 'bg-gray-100'"
          >
            <LogInIcon
              :size="24"
              :class="canMasuk ? 'text-primary' : 'text-gray-400'"
            />
          </div>
          <div class="text-center">
            <div
              class="text-[10px] font-black uppercase tracking-wider"
              :class="canMasuk ? 'text-gray-400' : 'text-gray-300'"
            >
              Presensi
            </div>
            <div
              class="text-sm font-bold leading-tight"
              :class="canMasuk ? 'text-gray-800' : 'text-gray-400'"
            >
              Masuk Kerja
            </div>
            <!-- Label status -->
            <div
              v-if="sudahMasuk || sudahPulang"
              class="mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-wide"
            >
              Sudah dilakukan
            </div>
          </div>
        </div>

        <!-- Card Pulang -->
        <div
          @click="handleCard('out')"
          class="bg-white p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all"
          :class="
            canPulang
              ? 'border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-95'
              : 'border-gray-100 opacity-40 cursor-not-allowed'
          "
        >
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center rotate-180"
            :class="canPulang ? 'bg-rose-50' : 'bg-gray-100'"
          >
            <LogInIcon
              :size="24"
              :class="canPulang ? 'text-rose-500' : 'text-gray-400'"
            />
          </div>
          <div class="text-center">
            <div
              class="text-[10px] font-black uppercase tracking-wider"
              :class="canPulang ? 'text-rose-400/70' : 'text-gray-300'"
            >
              Presensi
            </div>
            <div
              class="text-sm font-bold leading-tight"
              :class="canPulang ? 'text-gray-800' : 'text-gray-400'"
            >
              Pulang Kerja
            </div>
            <!-- Label status -->
            <div
              v-if="sudahPulang"
              class="mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-wide"
            >
              Sudah dilakukan
            </div>
            <div
              v-else-if="!sudahMasuk && !loadingStatus"
              class="mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-wide"
            >
              Masuk dulu
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { LogIn as LogInIcon } from "lucide-vue-next";
import AppHeader from "@/components/AppHeader.vue";
import api from "@/plugins/axios";

const router = useRouter();

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

// ── Status presensi hari ini ───────────────────────────────────────────────────
const loadingStatus = ref(true);
const presensiHariIni = ref(null); // { jam_masuk, jam_pulang } atau null

const todayStr = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
})();

const fetchStatusHariIni = async () => {
  loadingStatus.value = true;
  try {
    const [year, month] = todayStr.split("-");
    const bulan = `${year}-${month}`;
    const res = await api.get("/presensi/riwayat", { params: { bulan } });
    const data = res.data.data ?? [];
    presensiHariIni.value = data.find((p) => p.tanggal === todayStr) ?? null;
  } catch (e) {
    console.error("Gagal fetch status presensi:", e);
    presensiHariIni.value = null;
  } finally {
    loadingStatus.value = false;
  }
};

// ── Computed state ─────────────────────────────────────────────────────────────
// Sudah masuk = ada data presensi hari ini (ada jam_masuk)
const sudahMasuk = computed(() => !!presensiHariIni.value?.jam_masuk);
// Sudah pulang = ada jam_masuk DAN ada jam_pulang
const sudahPulang = computed(
  () =>
    !!presensiHariIni.value?.jam_masuk && !!presensiHariIni.value?.jam_pulang,
);

// Card masuk aktif hanya jika belum masuk sama sekali
const canMasuk = computed(() => !loadingStatus.value && !sudahMasuk.value);
// Card pulang aktif hanya jika sudah masuk tapi belum pulang
const canPulang = computed(
  () => !loadingStatus.value && sudahMasuk.value && !sudahPulang.value,
);

// ── Handler klik card ─────────────────────────────────────────────────────────
const handleCard = (type) => {
  if (type === "in" && !canMasuk.value) return; // disabled
  if (type === "out" && !canPulang.value) return; // disabled
  router.push({ path: "/scanner", query: { type } });
};

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/");
    return;
  }
  fetchStatusHariIni();
});
</script>
