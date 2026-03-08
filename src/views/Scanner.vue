<template>
  <div class="h-[100dvh] bg-gray-50 flex justify-center overflow-hidden">
    <div
      class="w-full max-w-md bg-black h-full flex flex-col relative shadow-2xl overflow-hidden"
    >
      <!-- Header -->
      <div
        class="bg-primary px-6 pt-3 pb-4 flex items-center z-10 shadow-lg relative rounded-b-[2rem]"
      >
        <button
          @click="$router.push('/presensi')"
          class="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm shadow-sm"
        >
          <ArrowLeftIcon :size="24" class="text-white" />
        </button>
        <h1 class="text-white text-lg font-bold flex-1 text-center pr-10">
          Scan QR Presensi
        </h1>
      </div>

      <!-- Scanner Section -->
      <div
        class="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden w-full"
      >
        <qrcode-stream
          @detect="onDetect"
          @error="onError"
          @camera-on="onCameraOn"
          class="w-full h-full absolute inset-0 object-cover"
        >
          <!-- Overlay -->
          <div
            class="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          >
            <div
              class="w-[70vw] h-[70vw] max-w-sm max-h-[24rem] relative scanner-cutout"
            >
              <div class="absolute -inset-[2px]">
                <div
                  class="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-[#3b82f6]"
                ></div>
                <div
                  class="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-[#3b82f6]"
                ></div>
                <div
                  class="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-[#3b82f6]"
                ></div>
                <div
                  class="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-[#3b82f6]"
                ></div>
              </div>
              <div
                class="w-full h-[1px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute animate-scan-y left-0"
              ></div>
            </div>
          </div>

          <!-- Loading: Kamera -->
          <div
            v-if="cameraLoading"
            class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center z-20"
          >
            <div
              class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"
            ></div>
            <p class="text-sm font-bold">Mempersiapkan Kamera...</p>
          </div>

          <!-- Loading: Proses scan ke server -->
          <div
            v-if="processing"
            class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center z-20"
          >
            <div
              class="w-10 h-10 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mb-4"
            ></div>
            <p class="text-sm font-bold">Memproses presensi...</p>
          </div>
        </qrcode-stream>
      </div>

      <!-- STATUS GPS BAR -->
      <div class="px-4 py-3 bg-gray-900 flex items-center gap-2 z-10">
        <div
          :class="[
            'w-2 h-2 rounded-full flex-shrink-0',
            gpsReady
              ? 'bg-green-400 animate-pulse'
              : 'bg-yellow-400 animate-pulse',
          ]"
        ></div>
        <span class="text-xs text-white/70">
          {{
            gpsReady
              ? `GPS Aktif — Akurasi ±${gpsAccuracy}m`
              : "Menunggu sinyal GPS... (pastikan GPS aktif)"
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useRouter } from "vue-router";
import { ArrowLeft as ArrowLeftIcon } from "lucide-vue-next";
import api from "@/services/api";
import Swal from "sweetalert2";

const router = useRouter();

// ── State UI ──────────────────────────────────────────────────────────────────
const cameraLoading = ref(true);
const processing = ref(false);
const isSending = ref(false);

// ── State GPS ─────────────────────────────────────────────────────────────────
const gpsReady = ref(false);
const gpsAccuracy = ref(null);
const latitude = ref(null);
const longitude = ref(null);
let watchId = null;

// ── Helper: SweetAlert toast (pojok atas tengah, tanpa tombol) ────────────────
const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// ── Helper: alert sukses (full modal, ada tombol OK) ─────────────────────────
const alertSukses = (message) =>
  Swal.fire({
    icon: "success",
    title: "Berhasil!",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#4f46e5",
    timer: 4000,
    timerProgressBar: true,
  });

// ── Helper: alert error ───────────────────────────────────────────────────────
const alertError = (message) =>
  Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonText: "Coba Lagi",
    confirmButtonColor: "#ef4444",
  });

// ── Helper: alert warning (toast) ────────────────────────────────────────────
const alertWarning = (title, message) =>
  Toast.fire({
    icon: "warning",
    title: title,
    text: message,
  });

// ── GPS ───────────────────────────────────────────────────────────────────────
const startGPS = () => {
  if (!navigator.geolocation) {
    alertError("Perangkat ini tidak mendukung GPS.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      gpsAccuracy.value = Math.round(position.coords.accuracy);
      gpsReady.value = true;
    },
    (err) => {
      gpsReady.value = false;
      console.error("GPS Error:", err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    },
  );
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/");
    return;
  }
  startGPS();
});

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
});

// ── Camera Events ─────────────────────────────────────────────────────────────
const onCameraOn = () => {
  cameraLoading.value = false;
};

const onError = (err) => {
  cameraLoading.value = false;
  console.error("CAMERA_ERROR:", err);
  alertError("Error Kamera: " + (err.name || err.message));
};

// ── QR Detect ─────────────────────────────────────────────────────────────────
const onDetect = async (detectedCodes) => {
  if (isSending.value) return;

  const rawValue = detectedCodes[0]?.rawValue;
  if (!rawValue) return;

  // GPS belum siap
  if (!gpsReady.value || latitude.value === null) {
    alertWarning(
      "GPS Belum Siap",
      "Tunggu beberapa detik lalu scan ulang. Pastikan GPS aktif di pengaturan HP.",
    );
    return;
  }

  isSending.value = true;
  processing.value = true;

  try {
    const { data } = await api.post("/presensi/scan", {
      qr_token: rawValue,
      latitude: latitude.value,
      longitude: longitude.value,
    });

    // Sukses → tampilkan modal lalu redirect
    await alertSukses(data.message);
    router.push("/presensi");
  } catch (error) {
    const msg = error.response?.data?.message || "Gagal melakukan presensi.";
    const status = error.response?.status;
    const jarak = error.response?.data?.jarak;
    const radius = error.response?.data?.radius_kantor;

    // Deteksi berdasarkan ada/tidaknya field 'jarak' di response
    // Backend hanya mengirim 'jarak' saat error di luar radius
    const isLuarRadius = status === 403 && jarak !== undefined;
    const isTidakAdaShift = status === 403 && jarak === undefined;

    if (isLuarRadius) {
      // ── Di luar radius kantor ─────────────────────────────────────────
      await Swal.fire({
        icon: "warning",
        title: "Di Luar Area Kantor",
        html: `
          <div style="display:flex; justify-content:center; gap:40px; margin-top:4px; margin-bottom:4px;">
            <div style="text-align:center;">
              <div style="font-size:28px; font-weight:700; color:#ef4444;">${jarak}m</div>
              <div style="font-size:12px; color:#9ca3af; margin-top:2px;">Jarak Anda</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px; font-weight:700; color:#22c55e;">${radius}m</div>
              <div style="font-size:12px; color:#9ca3af; margin-top:2px;">Batas Radius</div>
            </div>
          </div>
        `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#f59e0b",
      });
    } else if (isTidakAdaShift) {
      // ── Tidak punya jadwal shift hari ini ─────────────────────────────
      await Swal.fire({
        icon: "info",
        title: "Tidak Ada Jadwal",
        text: msg,
        confirmButtonText: "OK",
        confirmButtonColor: "#6366f1",
      });
    } else if (status === 400) {
      // ── QR expired atau sudah presensi ────────────────────────────────
      await Swal.fire({
        icon: "info",
        title: "Perhatian",
        text: msg,
        confirmButtonText: "OK",
        confirmButtonColor: "#6366f1",
      });
    } else {
      // ── Error umum ────────────────────────────────────────────────────
      await alertError(msg);
    }
  } finally {
    processing.value = false;
    setTimeout(() => {
      isSending.value = false;
    }, 3000);
  }
};
</script>

<style scoped>
@keyframes scan {
  0% {
    top: 5%;
  }
  50% {
    top: 95%;
  }
  100% {
    top: 5%;
  }
}

.animate-scan-y {
  animation: scan 3s linear infinite;
}

.scanner-cutout {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
}

:deep(.qrcode-stream-camera) {
  object-fit: cover !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
