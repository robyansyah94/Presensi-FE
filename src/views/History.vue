<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">
    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <div class="px-6 pt-8 pb-4">
      <AppHeader />
      <div class="mb-5">
        <h1 class="text-2xl font-bold text-gray-800">Riwayat Presensi</h1>
      </div>
    </div>

    <!-- ── Kalender ───────────────────────────────────────────────────── -->
    <div class="mx-6 mb-5">
      <div
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Header bulan -->
        <div class="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            @click="prevMonth"
            class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ChevronLeftIcon :size="18" class="text-gray-500" />
          </button>
          <span class="font-bold text-gray-800 text-sm">
            {{ BULAN_ID[calMonth] }} {{ calYear }}
          </span>
          <button
            @click="nextMonth"
            class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95 transition-all"
            :disabled="isCurrentMonth"
            :class="isCurrentMonth ? 'opacity-30 cursor-not-allowed' : ''"
          >
            <ChevronRightIcon :size="18" class="text-gray-500" />
          </button>
        </div>

        <!-- Nama hari -->
        <div class="grid grid-cols-7 px-3 pb-1">
          <div
            v-for="h in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']"
            :key="h"
            class="text-center text-[10px] font-bold text-gray-300 py-1 uppercase tracking-wider"
          >
            {{ h }}
          </div>
        </div>

        <!-- Grid tanggal -->
        <div class="grid grid-cols-7 px-3 pb-4 gap-y-1">
          <div v-for="n in firstDayOfMonth" :key="'e' + n"></div>
          <div
            v-for="d in daysInMonth"
            :key="d"
            @click="selectDate(d)"
            class="flex flex-col items-center justify-center py-1 cursor-pointer relative"
          >
            <!-- Dot status -->
            <div
              v-if="getStatusForDay(d)"
              class="absolute top-0.5 w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-green-400': getStatusForDay(d) === 'hadir',
                'bg-amber-400': getStatusForDay(d) === 'terlambat',
                'bg-red-400': getStatusForDay(d) === 'alpa',
              }"
            ></div>

            <!-- Lingkaran tanggal -->
            <div
              class="w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all"
              :class="getDayClass(d)"
            >
              {{ d }}
            </div>
          </div>
        </div>

        <!-- Summary strip -->
        <div class="grid grid-cols-3 border-t border-gray-50">
          <div class="flex flex-col items-center py-3 border-r border-gray-50">
            <span class="text-lg font-black text-green-500">{{
              summary.total_hadir
            }}</span>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Hadir</span
            >
          </div>
          <div class="flex flex-col items-center py-3 border-r border-gray-50">
            <span class="text-lg font-black text-amber-400">{{
              summary.total_terlambat
            }}</span>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Terlambat</span
            >
          </div>
          <div class="flex flex-col items-center py-3">
            <span class="text-lg font-black text-red-400">{{
              summary.total_alpa
            }}</span>
            <span
              class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
              >Alpa</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- ── List Riwayat ────────────────────────────────────────────────── -->
    <div class="px-6 flex flex-col gap-3">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-3xl h-24 animate-pulse border border-gray-100"
        ></div>
      </div>

      <div v-else>
        <!-- Label filter tanggal aktif -->
        <div
          v-if="selectedDate"
          class="flex items-center justify-between mb-2 px-1"
        >
          <p class="text-xs font-semibold text-gray-400">
            {{ formatSelectedLabel }}
          </p>
          <button
            @click="selectedDate = null"
            class="text-xs text-primary font-semibold"
          >
            Lihat semua
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="displayList.length === 0"
          class="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm"
        >
          <div
            class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"
          >
            <CalendarOffIcon :size="28" class="text-gray-300" />
          </div>
          <p class="text-sm font-semibold text-gray-400">
            Belum ada data presensi
          </p>
          <p class="text-xs text-gray-300 mt-1">
            {{ selectedDate ? "pada tanggal ini" : "bulan ini" }}
          </p>
        </div>

        <TransitionGroup
          v-else
          name="card"
          tag="div"
          class="flex flex-col gap-3"
        >
          <div v-for="item in displayList" :key="item.key">
            <!-- ── Card: alpa (hari lalu, tidak ada presensi) ── -->
            <div
              v-if="item.type === 'alpa'"
              class="bg-white rounded-3xl border border-red-50 shadow-sm overflow-hidden"
            >
              <div class="flex items-stretch">
                <div
                  class="flex flex-col items-center justify-center px-4 py-4 min-w-[72px] bg-red-50"
                >
                  <span class="text-2xl font-black leading-none text-red-400">{{
                    item.tanggal_num
                  }}</span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-red-300"
                    >{{ item.hari_short }}</span
                  >
                </div>
                <div
                  class="flex-1 px-4 py-4 flex items-center justify-between gap-2"
                >
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"
                    >
                      <XCircleIcon :size="14" class="text-red-400" />
                    </div>
                    <p class="text-xs text-gray-500 leading-tight">
                      Tidak melakukan presensi<br />
                      <span class="text-gray-300">pada hari ini</span>
                    </p>
                  </div>
                  <span
                    class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-red-50 text-red-400 border border-red-100"
                  >
                    Alpa
                  </span>
                </div>
              </div>
            </div>

            <!-- ── Card: ada presensi ── -->
            <div
              v-else
              class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div class="flex items-stretch">
                <!-- Tanggal block -->
                <div
                  class="flex flex-col items-center justify-center px-4 py-4 min-w-[72px]"
                  :class="getCardAccentClass(item.status)"
                >
                  <span
                    class="text-2xl font-black leading-none"
                    :class="getCardDateColor(item.status)"
                  >
                    {{ item.tanggal_num }}
                  </span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    :class="getCardDateColor(item.status)"
                  >
                    {{ item.hari_short }}
                  </span>
                </div>

                <!-- Info block -->
                <div
                  class="flex-1 px-4 py-3 flex flex-col justify-center gap-2"
                >
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <p
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                      >
                        Check In
                      </p>
                      <p class="text-sm font-black text-gray-800">
                        {{ item.jam_masuk ?? "-" }}
                      </p>
                    </div>
                    <div>
                      <p
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                      >
                        Check Out
                      </p>
                      <p class="text-sm font-black text-gray-800">
                        {{ item.jam_pulang ?? "-" }}
                      </p>
                    </div>
                    <div>
                      <p
                        class="text-[10px] font-bold text-gray-400 uppercase tracking-wide"
                      >
                        Total Jam
                      </p>
                      <p class="text-sm font-black text-gray-800">
                        {{ item.total_jam ?? "-" }}
                      </p>
                    </div>
                  </div>

                  <div class="border-t border-gray-50"></div>

                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <MapPinIcon
                        :size="12"
                        class="text-gray-300 flex-shrink-0"
                      />
                      <span class="text-[11px] text-gray-400 truncate">
                        {{ item.jarak ?? "Lokasi tidak tersedia" }}
                      </span>
                    </div>
                    <span
                      class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      :class="{
                        'bg-green-50 text-green-600': item.status === 'hadir',
                        'bg-amber-50 text-amber-600':
                          item.status === 'terlambat',
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import api from "@/plugins/axios";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MapPin as MapPinIcon,
  CalendarOff as CalendarOffIcon,
  XCircle as XCircleIcon,
} from "lucide-vue-next";

// ── Konstanta ─────────────────────────────────────────────────────────────────
const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const HARI_SHORT_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ── State ─────────────────────────────────────────────────────────────────────
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const calYear = ref(today.getFullYear());
const calMonth = ref(today.getMonth());

const loading = ref(false);
const riwayatData = ref([]);
const summary = ref({ total_hadir: 0, total_terlambat: 0, total_alpa: 0 });
const selectedDate = ref(null);

// ── Computed kalender ─────────────────────────────────────────────────────────
const daysInMonth = computed(() =>
  new Date(calYear.value, calMonth.value + 1, 0).getDate(),
);
const firstDayOfMonth = computed(() =>
  new Date(calYear.value, calMonth.value, 1).getDay(),
);
const isCurrentMonth = computed(
  () =>
    calYear.value === today.getFullYear() &&
    calMonth.value === today.getMonth(),
);

// Map tanggal (angka) → status
const statusMap = computed(() => {
  const map = {};
  riwayatData.value.forEach((p) => {
    map[parseInt(p.tanggal_num)] = p.status;
  });
  return map;
});

// ── Build display list ────────────────────────────────────────────────────────
// Aturan:
// - Hari lalu (< today): tampilkan semua — presensi atau alpa
// - Hari ini (= today) : tampilkan HANYA jika ada data presensi
// - Hari depan (> today): TIDAK ditampilkan
const allDaysList = computed(() => {
  const bulanStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}`;
  const presensiMap = {};
  riwayatData.value.forEach((p) => {
    presensiMap[p.tanggal] = p;
  });

  const list = [];

  for (let d = 1; d <= daysInMonth.value; d++) {
    const dateStr = `${bulanStr}-${String(d).padStart(2, "0")}`;
    const dateObj = new Date(calYear.value, calMonth.value, d);
    const hariShort = HARI_SHORT_ID[dateObj.getDay()];

    if (presensiMap[dateStr]) {
      // Ada data presensi (hari apapun termasuk hari ini)
      list.push({
        key: dateStr,
        type: "presensi",
        hari_short: hariShort,
        ...presensiMap[dateStr],
      });
    } else if (dateStr < todayStr) {
      // Hari lalu tanpa presensi → Alpa
      list.push({
        key: dateStr,
        type: "alpa",
        tanggal: dateStr,
        tanggal_num: String(d).padStart(2, "0"),
        hari_short: hariShort,
      });
    }
    // dateStr === todayStr tanpa presensi → skip (belum presensi hari ini)
    // dateStr > todayStr → skip (hari depan tidak ditampilkan)
  }

  return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
});

// Computed: list yang ditampilkan (semua atau filter 1 tanggal)
const displayList = computed(() => {
  if (!selectedDate.value) return allDaysList.value;
  const pad = String(selectedDate.value).padStart(2, "0");
  const bulan = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}`;
  const target = `${bulan}-${pad}`;
  return allDaysList.value.filter((i) => i.tanggal === target);
});

const formatSelectedLabel = computed(() => {
  if (!selectedDate.value) return "";
  const d = new Date(calYear.value, calMonth.value, selectedDate.value);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
const fetchRiwayat = async () => {
  loading.value = true;
  selectedDate.value = null;
  try {
    const bulan = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}`;
    const res = await api.get("/presensi/riwayat", { params: { bulan } });
    riwayatData.value = res.data.data ?? [];

    const totalAlpa = allDaysList.value.filter((i) => i.type === "alpa").length;
    summary.value = {
      total_hadir: res.data.summary?.total_hadir ?? 0,
      total_terlambat: res.data.summary?.total_terlambat ?? 0,
      total_alpa: totalAlpa,
    };
  } catch (e) {
    console.error("Gagal fetch riwayat:", e);
    riwayatData.value = [];
  } finally {
    loading.value = false;
  }
};

// ── Navigasi bulan ────────────────────────────────────────────────────────────
const prevMonth = () => {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value--;
  } else calMonth.value--;
};
const nextMonth = () => {
  if (isCurrentMonth.value) return;
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value++;
  } else calMonth.value++;
};
watch([calYear, calMonth], fetchRiwayat);

// ── Klik tanggal ──────────────────────────────────────────────────────────────
const selectDate = (d) => {
  selectedDate.value = selectedDate.value === d ? null : d;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusForDay = (d) => {
  const bulan = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}`;
  const dateStr = `${bulan}-${String(d).padStart(2, "0")}`;
  if (statusMap.value[d]) return statusMap.value[d];
  if (dateStr < todayStr) return "alpa";
  return null;
};

const getDayClass = (d) => {
  const isToday = isCurrentMonth.value && d === today.getDate();
  const isSelected = d === selectedDate.value;
  const status = getStatusForDay(d);

  if (isSelected) return "bg-primary text-white shadow-md shadow-primary/30";
  if (isToday) return "bg-gray-100 text-gray-800";
  if (status === "hadir") return "text-green-600 font-bold hover:bg-green-50";
  if (status === "terlambat")
    return "text-amber-500 font-bold hover:bg-amber-50";
  if (status === "alpa") return "text-red-400 hover:bg-red-50";
  return "text-gray-400 hover:bg-gray-50";
};

const getCardAccentClass = (status) => {
  if (status === "hadir") return "bg-primary/10";
  if (status === "terlambat") return "bg-amber-50";
  return "bg-red-50";
};

const getCardDateColor = (status) => {
  if (status === "hadir") return "text-primary";
  if (status === "terlambat") return "text-amber-500";
  return "text-red-400";
};

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(fetchRiwayat);
</script>

<style scoped>
.card-enter-active {
  transition: all 0.25s ease;
}
.card-leave-active {
  transition: all 0.2s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.card-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
