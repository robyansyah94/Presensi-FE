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
          <!-- Overlay Full Screen with transparent center -->
          <div
            class="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          >
            <!-- Bounding Box -->
            <div
              class="w-[70vw] h-[70vw] max-w-sm max-h-[24rem] relative scanner-cutout"
            >
              <!-- Corner Brackets -->
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

              <!-- Red Scanner line animation -->
              <div
                class="w-full h-[1px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute animate-scan-y left-0"
              ></div>
            </div>
          </div>

          <div
            v-if="loading"
            class="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center z-20"
          >
            <div
              class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"
            ></div>
            <p class="text-sm font-bold">Mempersiapkan Kamera...</p>
          </div>
        </qrcode-stream>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useRouter } from "vue-router";
import {
  ArrowLeft as ArrowLeftIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "lucide-vue-next";
import api from "@/services/api";

const router = useRouter();

const loading = ref(true);
const isSending = ref(false);

// 🔐 Proteksi halaman
onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/");
  }
});

const onCameraOn = () => {
  loading.value = false;
};

const onDetect = async (detectedCodes) => {
  if (isSending.value) return;

  const rawValue = detectedCodes[0]?.rawValue;
  if (!rawValue) return;

  isSending.value = true;

  try {
    const { data } = await api.post("/presensi/scan", {
      qr_token: rawValue,
    });

    alert("✅ " + data.message);
    router.push("/presensi");
  } catch (error) {
    alert("❌ " + error.response?.data?.message || "Gagal Presensi");
    router.push("/presensi");
  } finally {
    setTimeout(() => {
      isSending.value = false;
    }, 3000);
  }
};

const onError = (err) => {
  loading.value = false;
  console.error("CAMERA_ERROR:", err);
  alert("Error Kamera: " + (err.name || err.message));
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
