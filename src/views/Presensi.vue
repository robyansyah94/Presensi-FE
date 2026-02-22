<template>
  <div class="presensi-container">
    <!-- Scanner Area -->
    <div class="scanner-area">
      <!-- Logout Button -->
      <button class="logout-btn" @click="logout">⬅ Logout</button>

      <qrcode-stream
        @detect="onDetect"
        @error="onError"
        @camera-on="onCameraOn"
        :track="paintOutline"
      >
        <div class="scan-overlay">
          <div class="scan-box">
            <div class="scan-line"></div>
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
          </div>
        </div>

        <div v-if="loading" class="camera-loading">
          <div class="loader"></div>
          <p>Memuat kamera...</p>
        </div>
      </qrcode-stream>
    </div>

    <!-- Hidden Error Toast (optional) -->
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  // hapus token login
  localStorage.removeItem("token");

  // optional: hapus data lain jika ada
  localStorage.removeItem("user");

  // redirect ke halaman login
  router.push("/");
};

const result = ref("");
const error = ref("");
const loading = ref(true);
const isSending = ref(false);

// sementara hardcode dulu
// nanti ganti dari auth user login
const userId = 1;

const onCameraOn = () => {
  loading.value = false;
};

const onDetect = async (detectedCodes) => {
  if (isSending.value) return;

  if (detectedCodes.length > 0) {
    const rawValue = detectedCodes[0].rawValue;
    result.value = rawValue;
    isSending.value = true;

    try {
      const res = await fetch(
        "https://braydon-plausive-malaya.ngrok-free.dev/api/presensi/scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            qr_token: hasilQR,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        // Jika status 200 (Berhasil)
        alert("✅ " + data.message);
      } else {
        // Jika status 400 atau 404 (QR Expired, Karyawan Tidak Ditemukan, dll)
        alert("❌ " + (data.message || "Gagal Presensi"));
      }
    } catch (err) {
      console.error("ERROR_SCAN:", err);
      alert("📡 Masalah Koneksi ke Server");
    } finally {
      // Tunggu 3 detik sebelum mengizinkan scan lagi (mencegah double tap)
      setTimeout(() => {
        isSending.value = false;
        result.value = ""; // Reset tampilan hasil scan
      }, 3000);
    }
  }
};

const onError = (err) => {
  loading.value = false;
  error.value = err.message || "Terjadi kesalahan pada kamera";
};

// Visual drawing outline
const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
};
</script>

<style scoped>
.logout-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 1px solid #2196f3;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.3s;
}

.logout-btn:hover {
  background: #2196f3;
}

.presensi-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: "Segoe UI", sans-serif;
  overflow: hidden;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  padding: 8px;
  cursor: pointer;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.spacer {
  width: 40px; /* Balance the menu button */
}

/* Scanner Area */
.scanner-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-box {
  width: 70%;
  max-width: 300px;
  aspect-ratio: 1;
  position: relative;
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
}

/* Corners */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid #2196f3; /* Blue Color */
}

.top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}
.top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}
.bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}
.bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

/* Red Scan Line */
.scan-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: red;
  box-shadow: 0 0 4px red;
  top: 50%;
  transform: translateY(-50%);
  /* If animation is desired: */
  /* animation: scanMove 2s infinite ease-in-out; */
}

.result-section {
  text-align: center;
}

.result-label {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  margin: 0;
}

.result-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  margin: 0.2rem 0 0 0;
  min-height: 1.8rem;
}

/* Loading */
.camera-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  z-index: 5;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #2196f3;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-toast {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
}
:global(body) {
  margin: 0;
  padding: 0;
}
</style>
