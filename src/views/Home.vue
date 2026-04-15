<template>
  <div class="px-6 pt-8 pb-4">
    <AppHeader class="mb-7">
      <!-- Points Badge → IntegrityWallet -->
      <router-link
        to="/integritywallet"
        class="group relative flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-50 border border-amber-200/60 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-sm transition-all active:scale-95 overflow-hidden"
      >
        <!-- Shimmer effect -->
        <div
          class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        ></div>

        <!-- Coin icon -->
        <div
          class="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-200"
        >
          <WalletIcon :size="14" class="text-white" />
        </div>

        <!-- Points value -->
        <div class="relative flex flex-col items-end leading-none">
          <div
            v-if="loadingWallet"
            class="h-4 w-10 bg-amber-200/50 rounded-md animate-pulse"
          ></div>
          <span
            v-else
            class="text-sm font-black text-amber-700 tracking-tight"
          >
            {{ walletBalance?.toLocaleString('id-ID') ?? '0' }}
          </span>
          <span class="text-[8px] font-bold text-amber-500/70 uppercase tracking-wider mt-0.5">
            Poin
          </span>
        </div>
      </router-link>
    </AppHeader>

    <!-- Real-time Clock Card -->
    <div
      class="bg-primary rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-xl shadow-primary/20"
    >
      <div class="relative z-10">
        <p class="text-white/70 text-sm font-medium mb-1">{{ currentDate }}</p>
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
      <!-- Check In -->
      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Check In</span
          >
          <div
            class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"
          >
            <LogInIcon :size="14" class="text-emerald-500" />
          </div>
        </div>
        <div
          v-if="loadingPresensi"
          class="h-7 w-20 bg-gray-100 rounded-lg animate-pulse"
        ></div>
        <div
          v-else
          class="text-lg font-bold"
          :class="
            presensiHariIni?.jam_masuk ? 'text-gray-800' : 'text-gray-300'
          "
        >
          {{ presensiHariIni?.jam_masuk ?? "-- : --" }}
        </div>
      </div>

      <!-- Check Out -->
      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Check Out</span
          >
          <div
            class="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center rotate-180"
          >
            <LogInIcon :size="14" class="text-rose-500" />
          </div>
        </div>
        <div
          v-if="loadingPresensi"
          class="h-7 w-20 bg-gray-100 rounded-lg animate-pulse"
        ></div>
        <div
          v-else
          class="text-lg font-bold"
          :class="
            presensiHariIni?.jam_pulang ? 'text-gray-800' : 'text-gray-300'
          "
        >
          {{ presensiHariIni?.jam_pulang ?? "-- : --" }}
        </div>
      </div>
    </div>

    <!-- Section Kehadiran -->
    <!-- <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-gray-800">Kehadiran</h3>
      <button
        class="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/5"
      >
        Lihat Semua
      </button>
    </div>

    <div
      class="bg-white rounded-3xl p-10 flex flex-col items-center justify-center border border-dashed border-gray-200 opacity-60 mb-6"
    >
      <LayoutGridIcon :size="48" class="text-gray-300 mb-4" />
      <p class="text-sm font-medium text-gray-500 italic">
        Konten tambahan segera...
      </p>
    </div> -->

    <!-- Section Penilaian Sikap -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-gray-800">Assessment</h3>
      <router-link
        to="/assessment"
        class="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/5"
      >
        Lihat Semua
      </router-link>
    </div>

    <router-link to="/assessment">
      <div
        class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform mb-2"
      >
        <div class="flex items-center gap-4 p-5">
          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0"
          >
            <StarIcon :size="22" class="text-amber-400" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800 text-sm">Penilaian Sikap</p>
            <p class="text-xs text-gray-400 mt-0.5">
              Lihat hasil penilaian kamu dari atasan
            </p>
          </div>

          <!-- Arrow -->
          <ChevronRightIcon :size="18" class="text-gray-300 shrink-0" />
        </div>

        <!-- Rating preview strip -->
        <div class="grid grid-cols-3 border-t border-gray-50">
          <div class="flex flex-col items-center py-3 border-r border-gray-50">
            <div class="flex gap-0.5 mb-1">
              <span
                v-for="s in 5"
                :key="s"
                class="text-xs"
                :class="s <= 4 ? 'text-amber-400' : 'text-gray-200'"
                >★</span
              >
            </div>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Disiplin</span
            >
          </div>
          <div class="flex flex-col items-center py-3 border-r border-gray-50">
            <div class="flex gap-0.5 mb-1">
              <span
                v-for="s in 5"
                :key="s"
                class="text-xs"
                :class="s <= 5 ? 'text-amber-400' : 'text-gray-200'"
                >★</span
              >
            </div>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Kerjasama</span
            >
          </div>
          <div class="flex flex-col items-center py-3">
            <div class="flex gap-0.5 mb-1">
              <span
                v-for="s in 5"
                :key="s"
                class="text-xs"
                :class="s <= 3 ? 'text-amber-400' : 'text-gray-200'"
                >★</span
              >
            </div>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Inisiatif</span
            >
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import api from "@/plugins/axios";
import {
  Wallet as WalletIcon,
  LogIn as LogInIcon,
  LayoutGrid as LayoutGridIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-vue-next";

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

// ── Presensi hari ini ─────────────────────────────────────────────────────────
const loadingPresensi = ref(true);
const presensiHariIni = ref(null);

const fetchPresensiHariIni = async () => {
  loadingPresensi.value = true;
  try {
    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const res = await api.get("/presensi/riwayat", { params: { bulan } });
    const data = res.data.data ?? [];

    presensiHariIni.value = data.find((p) => p.tanggal === todayStr) ?? null;
  } catch (e) {
    console.error("Gagal fetch presensi hari ini:", e);
    presensiHariIni.value = null;
  } finally {
    loadingPresensi.value = false;
  }
};

onMounted(fetchPresensiHariIni);

// ── Wallet balance ────────────────────────────────────────────────────────────
const loadingWallet = ref(true);
const walletBalance = ref(null);

const fetchWalletBalance = async () => {
  loadingWallet.value = true;
  try {
    const res = await api.get("/wallet");
    walletBalance.value = res.data.balance ?? 0;
  } catch (e) {
    console.error("Gagal fetch wallet:", e);
    walletBalance.value = null;
  } finally {
    loadingWallet.value = false;
  }
};

onMounted(fetchWalletBalance);
</script>
