<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">

    <!-- Header dengan tombol back -->
    <div class="px-6 pt-8 pb-2">
      <div class="flex items-center gap-3 mb-5">
        <button
          @click="$router.back()"
          class="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100"
        >
          <ArrowLeftIcon :size="18" class="text-gray-500" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-gray-800 leading-tight">Detail Laporan</h1>
          <p class="text-xs text-gray-400">#{{ ticket?.id }}</p>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="px-6 flex flex-col gap-4">
      <div class="bg-white rounded-3xl h-32 animate-pulse border border-gray-100"></div>
      <div class="bg-white rounded-3xl h-20 animate-pulse border border-gray-100"></div>
    </div>

    <template v-else-if="ticket">

      <!-- Info Tiket -->
      <div class="px-6 mb-4">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

          <!-- Status bar atas -->
          <div class="flex items-center justify-between mb-3">
            <span
              class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border"
              :class="{
                'bg-gray-50  text-gray-500  border-gray-100':  ticket.status === 'open',
                'bg-blue-50  text-blue-600  border-blue-100':  ticket.status === 'in_progress',
                'bg-green-50 text-green-600 border-green-100': ticket.status === 'closed',
              }"
            >
              {{ statusLabel(ticket.status) }}
            </span>

            <!-- Prioritas -->
            <span class="text-xs font-bold" :class="{
              'text-green-500': ticket.priority === 'low',
              'text-amber-500': ticket.priority === 'mid',
              'text-red-500':   ticket.priority === 'high',
            }">
              {{ priorityEmoji(ticket.priority) }} {{ ucfirst(ticket.priority) }}
            </span>
          </div>

          <!-- Kategori -->
          <p class="text-xs font-bold uppercase tracking-wider mb-1" :style="{ color: catColor(ticket.category) }">
            {{ ticket.category_label }}
          </p>

          <!-- Subject -->
          <h2 class="text-base font-bold text-gray-800 mb-2">{{ ticket.subject }}</h2>

          <!-- Deskripsi -->
          <p class="text-sm text-gray-500 leading-relaxed">{{ ticket.description }}</p>

          <!-- Meta -->
          <div class="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50 text-[11px] text-gray-400">
            <span class="flex items-center gap-1">
              <ClockIcon :size="12" />
              {{ ticket.created_at }}
            </span>
            <span v-if="ticket.operator_name" class="flex items-center gap-1">
              <UserIcon :size="12" />
              Operator: {{ ticket.operator_name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Thread Balasan -->
      <div class="px-6 mb-4">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MessageSquareIcon :size="13" />
          Percakapan
        </p>

        <!-- Empty responses -->
        <div
          v-if="ticket.responses.length === 0"
          class="bg-white rounded-3xl border border-gray-100 p-8 text-center"
        >
          <MessageSquareIcon :size="32" class="text-gray-200 mx-auto mb-2" />
          <p class="text-sm text-gray-400 font-medium">Belum ada balasan</p>
          <p class="text-xs text-gray-300 mt-1">Operator akan segera merespons laporan Anda</p>
        </div>

        <!-- Bubble chat -->
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="resp in ticket.responses"
            :key="resp.id"
            class="flex gap-3"
            :class="resp.is_operator ? 'flex-row' : 'flex-row-reverse'"
          >
            <!-- Avatar -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
              :class="resp.is_operator ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'"
            >
              {{ resp.responder_name.charAt(0).toUpperCase() }}
            </div>

            <!-- Bubble -->
            <div class="max-w-[80%]">
              <div class="flex items-center gap-1.5 mb-1" :class="resp.is_operator ? '' : 'justify-end'">
                <span class="text-[11px] font-semibold text-gray-600">{{ resp.responder_name }}</span>
                <span
                  v-if="resp.is_operator"
                  class="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                >Admin</span>
                <span
                  v-if="resp.is_auto_suggestion"
                  class="text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full"
                >Auto-Saran</span>
              </div>
              <div
                class="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                :class="resp.is_operator
                  ? 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'
                  : 'bg-primary text-white rounded-tr-none'"
              >
                {{ resp.message }}
              </div>
              <p class="text-[10px] text-gray-300 mt-1" :class="resp.is_operator ? '' : 'text-right'">
                {{ resp.created_at }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Form Balas (hanya jika belum closed) ── -->
      <div v-if="ticket.status !== 'closed'" class="px-6 mb-4">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Balas / Tanya Lagi</p>
          <textarea
            v-model="replyMsg"
            rows="3"
            placeholder="Tulis pesan Anda..."
            class="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-primary"
          ></textarea>
          <button
            @click="submitReply"
            :disabled="sendingReply || !replyMsg.trim()"
            class="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SendIcon :size="16" />
            {{ sendingReply ? 'Mengirim...' : 'Kirim Pesan' }}
          </button>
        </div>
      </div>

      <!-- ── Rating Section (hanya jika closed dan belum dinilai) ── -->
      <div v-if="ticket.status === 'closed' && !ticket.has_rating" class="px-6 mb-4">
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5">
          <p class="text-sm font-bold text-amber-800 mb-1">Bagaimana penanganannya? ⭐</p>
          <p class="text-xs text-amber-600 mb-4">Berikan penilaian untuk membantu kami meningkatkan layanan</p>

          <!-- Bintang interaktif -->
          <div class="flex items-center justify-center gap-3 mb-4">
            <button
              v-for="star in 5"
              :key="star"
              @click="ratingForm.score = star"
              class="text-3xl transition-all active:scale-110"
              :class="star <= ratingForm.score ? 'text-amber-400' : 'text-gray-200'"
            >★</button>
          </div>

          <!-- Label bintang -->
          <p class="text-center text-xs font-bold text-amber-700 mb-3" v-if="ratingForm.score > 0">
            {{ ratingLabel(ratingForm.score) }}
          </p>

          <!-- Feedback -->
          <textarea
            v-model="ratingForm.feedback"
            rows="2"
            placeholder="Komentar tambahan (opsional)..."
            class="w-full border border-amber-200 bg-white rounded-2xl px-4 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:border-amber-400 mb-3"
          ></textarea>

          <button
            @click="submitRating"
            :disabled="ratingForm.score === 0 || sendingRating"
            class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ sendingRating ? 'Menyimpan...' : 'Kirim Penilaian' }}
          </button>
        </div>
      </div>

      <!-- Rating sudah dikirim -->
      <div v-if="ticket.status === 'closed' && ticket.has_rating && ticket.rating" class="px-6 mb-4">
        <div class="bg-white border border-gray-100 rounded-3xl p-5 text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <span v-for="s in 5" :key="s" class="text-xl" :class="s <= ticket.rating.score ? 'text-amber-400' : 'text-gray-100'">★</span>
          </div>
          <p class="text-xs font-semibold text-gray-500">Terima kasih atas penilaian Anda!</p>
          <p v-if="ticket.rating.feedback" class="text-xs text-gray-400 mt-1 italic">"{{ ticket.rating.feedback }}"</p>
        </div>
      </div>

    </template>

    <!-- Error state -->
    <div v-else-if="!loading" class="px-6">
      <div class="bg-white rounded-3xl p-10 text-center border border-gray-100">
        <p class="text-sm font-semibold text-gray-400">Tiket tidak ditemukan.</p>
        <button @click="$router.back()" class="mt-4 text-primary text-sm font-bold">← Kembali</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import api from '@/plugins/axios'
import {
  ArrowLeft as ArrowLeftIcon,
  MessageSquare as MessageSquareIcon,
  Clock as ClockIcon,
  User as UserIcon,
  Send as SendIcon,
} from 'lucide-vue-next'

const route  = useRoute()
const router = useRouter()

// ── State ─────────────────────────────────────────────────────────────────────
const loading     = ref(false)
const ticket      = ref(null)
const replyMsg    = ref('')
const sendingReply  = ref(false)
const sendingRating = ref(false)
const ratingForm  = ref({ score: 0, feedback: '' })

// ── Fetch detail tiket ────────────────────────────────────────────────────────
const fetchTicket = async () => {
  loading.value = true
  try {
    const res = await api.get(`/tickets/${route.params.id}`)
    ticket.value = res.data.data
  } catch (e) {
    console.error('Gagal fetch tiket:', e)
    ticket.value = null
  } finally {
    loading.value = false
  }
}

// ── Kirim balasan ─────────────────────────────────────────────────────────────
const submitReply = async () => {
  if (!replyMsg.value.trim()) return

  sendingReply.value = true
  try {
    await api.post(`/tickets/${ticket.value.id}/reply`, {
      message: replyMsg.value,
    })
    replyMsg.value = ''
    await fetchTicket() // Refresh thread
  } catch (e) {
    alert(e.response?.data?.message ?? 'Gagal mengirim pesan.')
  } finally {
    sendingReply.value = false
  }
}

// ── Kirim rating ──────────────────────────────────────────────────────────────
const submitRating = async () => {
  if (ratingForm.value.score === 0) return

  sendingRating.value = true
  try {
    await api.post(`/tickets/${ticket.value.id}/rate`, {
      score:    ratingForm.value.score,
      feedback: ratingForm.value.feedback,
    })
    await fetchTicket() // Refresh untuk tampilkan rating yang sudah dikirim
  } catch (e) {
    alert(e.response?.data?.message ?? 'Gagal mengirim penilaian.')
  } finally {
    sendingRating.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusLabel = (s) => ({
  open:        'Menunggu',
  in_progress: 'Sedang Diproses',
  closed:      'Selesai',
})[s] ?? s

const priorityEmoji = (p) => ({ low: '🟢', mid: '🟡', high: '🔴' })[p] ?? ''

const ucfirst = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const catColor = (cat) => ({
  gagal_scan_qr:           '#7c3aed',
  lokasi_tidak_terdeteksi: '#ea580c',
  lupa_absen:              '#dc2626',
  data_presensi_salah:     '#2563eb',
  masalah_aplikasi:        '#db2777',
  lainnya:                 '#6b7280',
})[cat] ?? '#6b7280'

const ratingLabel = (score) => ([
  '', 'Sangat Mengecewakan', 'Kurang Memuaskan', 'Cukup', 'Memuaskan', 'Sangat Memuaskan'
])[score]

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(fetchTicket)
</script>