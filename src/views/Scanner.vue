<template>
  <div class="h-[100dvh] bg-gray-50 flex justify-center overflow-hidden">
    <div
      class="w-full max-w-md bg-black h-full flex flex-col relative shadow-2xl overflow-hidden"
    >
      <!-- Header (sama seperti sebelumnya) -->
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

      <!-- Scanner Section (sama seperti sebelumnya) -->
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

      <!-- ── STATUS GPS BAR (BARU) ─────────────────────────────────────── -->
      <!-- Bar ini tampil di bawah layar, memberi tahu karyawan status GPS -->
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

const router = useRouter();

// ── State UI ──────────────────────────────────────────────────────────────────
const cameraLoading = ref(true);
const processing = ref(false);
const isSending = ref(false); // proteksi agar tidak double-scan

// ── State GPS (BARU) ──────────────────────────────────────────────────────────
const gpsReady = ref(false); // true kalau GPS sudah dapat koordinat
const gpsAccuracy = ref(null); // akurasi GPS dalam meter
const latitude = ref(null); // koordinat terakhir
const longitude = ref(null);
let watchId = null; // id untuk clearWatch nanti

// ── GPS: mulai tracking lokasi ─────────────────────────────────────────────────
// Kita pakai watchPosition (bukan getCurrentPosition) supaya koordinat
// terus diperbarui selama halaman Scanner terbuka
const startGPS = () => {
  if (!navigator.geolocation) {
    alert("Perangkat ini tidak mendukung GPS.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      // Berhasil dapat koordinat → simpan dan tandai GPS siap
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      gpsAccuracy.value = Math.round(position.coords.accuracy);
      gpsReady.value = true;
    },
    (err) => {
      // Gagal → tandai GPS belum siap
      gpsReady.value = false;
      console.error("GPS Error:", err.message);
    },
    {
      enableHighAccuracy: true, // minta akurasi tinggi (pakai GPS, bukan WiFi)
      maximumAge: 5000, // boleh pakai cache koordinat max 5 detik
      timeout: 15000, // timeout 15 detik
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
  startGPS(); // mulai GPS begitu halaman terbuka
});

onUnmounted(() => {
  // Penting: hentikan GPS tracking saat keluar dari halaman
  // supaya tidak boros baterai
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
  alert("Error Kamera: " + (err.name || err.message));
};

// ── QR Detect ─────────────────────────────────────────────────────────────────
const onDetect = async (detectedCodes) => {
  if (isSending.value) return; // cegah double scan

  const rawValue = detectedCodes[0]?.rawValue;
  if (!rawValue) return;

  // Cek GPS dulu sebelum kirim ke server
  if (!gpsReady.value || latitude.value === null) {
    alert(
      "GPS belum siap. Tunggu beberapa detik lalu scan ulang.\n\nPastikan GPS aktif di pengaturan HP.",
    );
    return;
  }

  isSending.value = true;
  processing.value = true;

  try {
    // ── PERUBAHAN UTAMA ───────────────────────────────────────────────
    // Sebelum: hanya kirim { qr_token }
    // Sesudah: kirim juga latitude & longitude agar backend bisa validasi GPS
    const { data } = await api.post("/presensi/scan", {
      qr_token: rawValue,
      latitude: latitude.value, // ← BARU
      longitude: longitude.value, // ← BARU
    });
    // ─────────────────────────────────────────────────────────────────

    alert("✅ " + data.message);
    router.push("/presensi");
  } catch (error) {
    const msg = error.response?.data?.message || "Gagal melakukan presensi.";
    alert("❌ " + msg);
    // Tidak redirect → biarkan karyawan coba lagi (misal kalau GPS meleset)
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
