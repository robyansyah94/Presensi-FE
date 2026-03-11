<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="px-6 pt-8 pb-4">
      <AppHeader />
      <h1 class="text-2xl font-bold text-gray-800">Penilaian Sikap</h1>
      <p class="text-sm text-gray-400 mt-1">Hasil penilaian kamu dari atasan</p>
    </div>

    <!-- ── Filter Periode ──────────────────────────────────────────────── -->
    <div class="px-6 mb-5">
      <div
        class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2"
      >
        <span class="text-xs font-bold text-primary uppercase tracking-wide"
          >Bulanan</span
        >
      </div>
    </div>

    <!-- ── Radar Chart ─────────────────────────────────────────────────── -->
    <div class="mx-6 mb-5">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p class="text-sm font-bold text-gray-700 mb-1">Grafik Performa</p>
        <p class="text-xs text-gray-400 mb-4">
          Rata-rata semua periode {{ activePeriod }}
        </p>

        <!-- Loading skeleton chart -->
        <div v-if="loadingRadar" class="flex items-center justify-center h-48">
          <div class="w-40 h-40 rounded-full bg-gray-100 animate-pulse"></div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="radarData.length === 0"
          class="flex flex-col items-center justify-center h-48 text-gray-300"
        >
          <StarIcon :size="36" class="mb-2 text-gray-200" />
          <p class="text-sm font-semibold">Belum ada penilaian</p>
        </div>

        <!-- Chart -->
        <div v-else class="flex items-center justify-center">
          <canvas ref="radarCanvas" height="260"></canvas>
        </div>
      </div>
    </div>

    <!-- ── Riwayat Penilaian ────────────────────────────────────────────── -->
    <div class="px-6 flex flex-col gap-3">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">
        Riwayat Penilaian
      </p>

      <!-- Loading skeleton -->
      <div v-if="loadingList" class="flex flex-col gap-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-3xl h-24 animate-pulse border border-gray-100"
        ></div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="riwayatList.length === 0"
        class="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm"
      >
        <div
          class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"
        >
          <StarIcon :size="28" class="text-gray-300" />
        </div>
        <p class="text-sm font-semibold text-gray-400">
          Belum ada riwayat penilaian
        </p>
        <p class="text-xs text-gray-300 mt-1">
          untuk periode {{ activePeriod }}
        </p>
      </div>

      <!-- List -->
      <TransitionGroup v-else name="card" tag="div" class="flex flex-col gap-3">
        <div v-for="item in riwayatList" :key="item.id">
          <div
            class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <!-- Header card -->
            <div class="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <p class="font-bold text-gray-800 text-sm">
                  {{ item.period_label }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ formatTanggal(item.assessment_date) }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div class="flex gap-0.5">
                  <span
                    v-for="s in 5"
                    :key="s"
                    class="text-base"
                    :class="
                      s <= Math.round(item.average_score)
                        ? 'text-amber-400'
                        : 'text-gray-200'
                    "
                    >★</span
                  >
                </div>
                <span class="text-xs text-gray-400"
                  >{{ item.average_score }}/5</span
                >
              </div>
            </div>

            <!-- Detail per kategori -->
            <div class="px-5 pb-3 grid grid-cols-2 gap-2">
              <div
                v-for="detail in item.details"
                :key="detail.id"
                class="bg-gray-50 rounded-2xl px-3 py-2"
              >
                <p
                  class="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate"
                >
                  {{ detail.category?.name ?? "-" }}
                </p>
                <div class="flex gap-0.5 mt-1">
                  <span
                    v-for="s in 5"
                    :key="s"
                    class="text-sm"
                    :class="
                      s <= detail.score ? 'text-amber-400' : 'text-gray-200'
                    "
                    >★</span
                  >
                </div>
              </div>
            </div>

            <!-- Catatan -->
            <div
              v-if="item.general_notes"
              class="mx-5 mb-4 bg-blue-50 rounded-2xl px-4 py-3"
            >
              <p
                class="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1"
              >
                Catatan
              </p>
              <p class="text-xs text-blue-700 leading-relaxed">
                {{ item.general_notes }}
              </p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, watchEffect } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import api from "@/plugins/axios";
import { Star as StarIcon } from "lucide-vue-next";
import Chart from "chart.js/auto";

// ── State ──────────────────────────────────────────────────────────────────────
const activePeriod = ref("bulanan"); // hanya bulanan
const loadingList = ref(false);
const loadingRadar = ref(false);
const riwayatList = ref([]);
const radarData = ref([]);
const radarCanvas = ref(null);
let chartInstance = null;

// ── Fetch riwayat penilaian ────────────────────────────────────────────────────
const fetchRiwayat = async () => {
  loadingList.value = true;
  try {
    const res = await api.get("/assessment/riwayat", {
      params: { period: activePeriod.value },
    });
    riwayatList.value = res.data.data ?? [];
  } catch (e) {
    console.error("Gagal fetch riwayat penilaian:", e);
    riwayatList.value = [];
  } finally {
    loadingList.value = false;
  }
};

// ── Fetch radar chart ──────────────────────────────────────────────────────────
const fetchRadar = async () => {
  loadingRadar.value = true;
  try {
    const res = await api.get("/assessment/radar", {
      params: { period: activePeriod.value },
    });
    radarData.value = res.data.data ?? [];
  } catch (e) {
    console.error("Gagal fetch radar:", e);
    radarData.value = [];
  } finally {
    loadingRadar.value = false;
    await nextTick();
    renderChart();
  }
};

// ── Watch canvas: render ulang saat canvas siap atau data berubah ──────────────
watch(radarCanvas, (canvas) => {
  if (canvas && radarData.value.length > 0) renderChart();
});

// ── Render radar chart ─────────────────────────────────────────────────────────
const renderChart = () => {
  if (!radarCanvas.value || radarData.value.length === 0) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(radarCanvas.value, {
    type: "radar",
    data: {
      labels: radarData.value.map((d) => d.category),
      datasets: [
        {
          label: "Nilai",
          data: radarData.value.map((d) => d.average),
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          borderColor: "rgba(99, 102, 241, 0.8)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1,
            font: { size: 10 },
            backdropColor: "transparent",
          },
          pointLabels: { font: { size: 11 } },
          grid: { color: "rgba(0,0,0,0.06)" },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
};

// ── Format tanggal ─────────────────────────────────────────────────────────────
const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ── Init ───────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchRiwayat();
  fetchRadar();
});
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
