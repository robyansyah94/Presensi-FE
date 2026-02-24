<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-6 pt-8 pb-4">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary/10 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Johnny+Stanley&background=007770&color=fff" alt="Avatar" class="w-full h-full object-cover">
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-sm leading-tight">Johnny Stanley</h2>
            <p class="text-xs text-gray-500">Senior HR</p>
          </div>
        </div>
        <button class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
          <ScanIcon :size="20" class="text-gray-400" />
        </button>
      </div>

      <!-- Title Area -->
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800">Scan QR Presensi</h1>
        <p class="text-sm text-gray-400 px-4">Arahkan kamera ke QR Code dinamis yang disediakan oleh HRD.</p>
      </div>
    </div>

    <!-- Scanner Section (Existing logic maintained) -->
    <div class="flex-1 px-6 pb-6 flex flex-col items-center">
      <div class="w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden border-[10px] border-white shadow-2xl relative mb-8">
        <qrcode-stream
          @detect="onDetect"
          @error="onError"
          @camera-on="onCameraOn"
          class="h-full w-full object-cover"
        >
          <!-- Scan Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
             <!-- Scanner line animation -->
             <div class="w-4/5 h-[2px] bg-primary shadow-[0_0_15px_rgba(0,119,112,0.8)] absolute animate-scan-y top-1/2"></div>
             
             <!-- Corner brackets -->
             <div class="absolute inset-x-12 inset-y-12">
               <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-xl"></div>
               <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-xl"></div>
               <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-xl"></div>
               <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-xl"></div>
             </div>
          </div>
          
          <div v-if="loading" class="absolute inset-0 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
             <div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
             <p class="text-sm font-bold">Mempersiapkan Kamera...</p>
          </div>
        </qrcode-stream>
      </div>

      <!-- Status Cards -->
      <div class="grid grid-cols-2 gap-4 w-full">
        <!-- Card 1: Masuk -->
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LogInIcon :size="24" class="text-primary" />
          </div>
          <div class="text-center">
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Presensi</div>
            <div class="text-sm font-bold text-gray-800 leading-tight">Masuk Kerja</div>
          </div>
        </div>

        <!-- Card 2: Pulang -->
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 opacity-60">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center rotate-180">
            <LogInIcon :size="24" class="text-rose-500" />
          </div>
          <div class="text-center">
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-wider text-rose-500/50">Presensi</div>
            <div class="text-sm font-bold text-gray-800 leading-tight">Pulang Kerja</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useRouter } from "vue-router";
import { LogIn as LogInIcon, Scan as ScanIcon } from 'lucide-vue-next';

const router = useRouter();

const loading = ref(true);
const isSending = ref(false);

const onCameraOn = () => {
  loading.value = false;
};

const onDetect = async (detectedCodes) => {
  if (isSending.value) return;

  if (detectedCodes.length > 0) {
    const rawValue = detectedCodes[0].rawValue;
    isSending.value = true;

    try {
      const res = await fetch(
        "https://braydon-plausive-malaya.ngrok-free.dev/api/presensi/scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            qr_token: rawValue,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
      } else {
        alert("❌ " + (data.message || "Gagal Presensi"));
      }
    } catch (err) {
      console.error("ERROR_SCAN:", err);
      alert("📡 Masalah Koneksi ke Server");
    } finally {
      setTimeout(() => {
        isSending.value = false;
      }, 3000);
    }
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
  0% { top: 20%; transform: translateY(0); }
  50% { top: 80%; transform: translateY(-100%); }
  100% { top: 20%; transform: translateY(0); }
}

.animate-scan-y {
  animation: scan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
