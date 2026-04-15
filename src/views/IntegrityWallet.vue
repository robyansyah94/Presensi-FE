<template>
  <div class="flex flex-col min-h-full bg-gray-50 pb-28">

    <!-- ── Hero Section (consistent with Profile.vue) ─────────────────── -->
    <div
      class="bg-primary pt-7 pb-8 px-6 flex flex-col items-center rounded-b-[2.5rem] shadow-lg shadow-primary/20 mb-5"
    >
      <h1 class="text-white text-lg font-bold text-center mb-6 tracking-wide">
        Dompet Integritas
      </h1>

      <!-- User Initial Avatar -->
      <div class="relative mb-4">
        <div
          class="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center shadow-lg"
        >
          <span class="text-3xl font-black text-white">{{ userInitial }}</span>
        </div>
      </div>

      <!-- User Name -->
      <h2
        class="text-white text-lg font-semibold uppercase tracking-wide text-center mb-1"
      >
        {{ wallet.user?.name ?? '—' }}
      </h2>

      <!-- Saldo Poin -->
      <div class="text-center mb-3">
        <p class="text-white/60 text-xs mb-1">Saldo Poin Anda</p>
        <transition name="count" mode="out-in">
          <p :key="wallet.balance" class="text-5xl font-black tracking-tight text-white">
            {{ wallet.balance?.toLocaleString('id-ID') ?? '—' }}
          </p>
        </transition>
        <p class="text-white/60 text-xs mt-1">POIN INTEGRITAS</p>
      </div>

      <!-- Level Badge -->
      <div v-if="wallet.level">
        <span
          class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold text-white"
        >
          {{ wallet.level.name }}
        </span>
      </div>

      <!-- Level Progress Bar -->
      <div v-if="wallet.level?.next" class="w-full mt-4 px-2">
        <div class="flex justify-between text-xs text-white/60 mb-1">
          <span>{{ wallet.balance }} poin</span>
          <span>{{ wallet.level.next }} poin → naik level</span>
        </div>
        <div class="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-white rounded-full transition-all duration-700"
            :style="{ width: levelProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ── Tab Navigation ─────────────────────────────────────────────── -->
    <div class="px-6 mb-4">
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-3 text-sm font-semibold transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-primary'
          "
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ── Tab Content ────────────────────────────────────────────────── -->
    <div class="px-6">

      <!-- Tab 1: Riwayat Mutasi -->
      <div v-show="activeTab === 'history'">
        <div v-if="loadingHistory" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat riwayat...</p>
        </div>

        <div
          v-else-if="history.data?.length === 0"
          class="py-12 text-center text-gray-400"
        >
          <div class="text-4xl mb-2">📋</div>
          <p class="text-sm">Belum ada riwayat transaksi poin.</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="item in history.data"
            :key="item.id"
            class="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm"
          >
            <!-- Icon -->
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              :class="item.type === 'EARN' ? 'bg-emerald-50' : 'bg-rose-50'"
            >
              {{ item.icon }}
            </div>

            <!-- Keterangan -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">
                {{ item.description }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.created_at }}</p>
            </div>

            <!-- Delta Poin -->
            <div class="text-right flex-shrink-0">
              <p
                class="font-bold text-base"
                :class="item.delta > 0 ? 'text-emerald-600' : 'text-rose-500'"
              >
                {{ item.delta > 0 ? '+' : '' }}{{ item.delta }}
              </p>
              <p class="text-xs text-gray-400">{{ item.current_balance }} saldo</p>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="history.last_page > 1"
            class="flex justify-center gap-2 pt-2 pb-4"
          >
            <button
              v-for="page in history.last_page"
              :key="page"
              @click="fetchHistory(page)"
              class="w-8 h-8 rounded-full text-sm font-medium transition"
              :class="
                history.current_page === page
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 hover:bg-primary/10 border border-gray-100'
              "
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 2: Marketplace -->
      <div v-show="activeTab === 'marketplace'">
        <div v-if="loadingMarket" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat marketplace...</p>
        </div>

        <div
          v-else-if="marketItems.length === 0"
          class="py-12 text-center text-gray-400"
        >
          <div class="text-4xl mb-2">🛍️</div>
          <p class="text-sm">Marketplace masih kosong.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="item in marketItems"
            :key="item.id"
            class="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2"
            :class="{ 'opacity-60': !item.can_redeem }"
          >
            <!-- Icon & Nama -->
            <div class="text-3xl">{{ item.icon }}</div>
            <div>
              <p class="font-bold text-gray-800 text-sm leading-tight">
                {{ item.item_name }}
              </p>
              <p
                v-if="item.tolerance_minutes"
                class="text-xs text-amber-500 mt-0.5"
              >
                ⏱ {{ item.tolerance_minutes }} menit toleransi
              </p>
              <p
                v-if="item.stock_limit"
                class="text-xs text-gray-400 mt-0.5"
              >
                {{ item.purchased_this_month }}/{{ item.stock_limit }} bulan ini
              </p>
            </div>

            <!-- Harga -->
            <div class="mt-auto pt-2 border-t border-gray-50">
              <p class="text-primary font-bold text-base">
                {{ item.point_cost }}
                <span class="text-xs font-normal text-gray-400">poin</span>
              </p>
            </div>

            <!-- Tombol Tukar -->
            <button
              @click="redeemItem(item)"
              :disabled="!item.can_redeem || redeeming === item.id"
              class="w-full py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
              :class="
                item.can_redeem
                  ? 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              "
            >
              <span v-if="redeeming === item.id">⏳</span>
              <span v-else-if="!item.can_afford">Poin Kurang</span>
              <span v-else-if="!item.stock_available">Limit Tercapai</span>
              <span v-else>Tukar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 3: Inventory Token -->
      <div v-show="activeTab === 'inventory'">
        <div v-if="loadingTokens" class="py-12 text-center text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Memuat inventory...</p>
        </div>

        <div v-else>
          <!-- Summary -->
          <div
            class="bg-primary/5 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-primary/10"
          >
            <div class="text-3xl">🎫</div>
            <div>
              <p class="font-bold text-primary">
                {{ tokenSummary.available }} Token Tersedia
              </p>
              <p class="text-xs text-primary/60">
                dari total {{ tokenSummary.total }} token
              </p>
            </div>
          </div>

          <div
            v-if="tokens.length === 0"
            class="py-8 text-center text-gray-400"
          >
            <div class="text-4xl mb-2">📦</div>
            <p class="text-sm">
              Anda belum memiliki token. Tukar di Marketplace!
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="token in tokens"
              :key="token.id"
              class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <!-- Icon -->
              <div
                class="text-2xl w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0"
              >
                {{ token.item.icon }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-800 text-sm">
                  {{ token.item.item_name }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ token.item.token_type_label }}
                </p>
                <p
                  v-if="token.item.tolerance_minutes"
                  class="text-xs text-amber-500"
                >
                  ⏱ Max {{ token.item.tolerance_minutes }} menit terlambat
                </p>
                <p
                  v-if="token.used_at"
                  class="text-xs text-gray-400 mt-0.5"
                >
                  Dipakai: {{ token.used_at }}
                </p>
              </div>

              <!-- Status Badge -->
              <div class="flex-shrink-0">
                <span
                  class="text-xs px-2.5 py-1 rounded-full font-bold"
                  :class="{
                    'bg-emerald-50 text-emerald-600':
                      token.status === 'AVAILABLE',
                    'bg-gray-100 text-gray-500': token.status === 'USED',
                    'bg-rose-50 text-rose-500': token.status === 'EXPIRED',
                  }"
                >
                  {{ token.status_label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Toast Notifikasi ───────────────────────────────────────────── -->
    <transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg text-white"
        :class="toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-500'"
      >
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/plugins/axios'

export default {
  name: 'IntegrityWallet',

  setup() {
    // ── State ──────────────────────────────────────────────────────────────
    const wallet       = ref({})
    const history      = ref({ data: [], last_page: 1, current_page: 1 })
    const marketItems  = ref([])
    const tokens       = ref([])
    const tokenSummary = ref({ available: 0, total: 0 })
    const activeTab    = ref('history')
    const redeeming    = ref(null)

    const loadingHistory = ref(false)
    const loadingMarket  = ref(false)
    const loadingTokens  = ref(false)

    const toast = ref({ show: false, message: '', type: 'success' })

    const tabs = [
      { id: 'history',     label: '📋 Mutasi' },
      { id: 'marketplace', label: '🛍️ Market' },
      { id: 'inventory',   label: '🎫 Token' },
    ]

    // ── Computed ───────────────────────────────────────────────────────────
    const userInitial = computed(() =>
      (wallet.value.user?.name ?? 'U').charAt(0).toUpperCase()
    )

    const levelProgress = computed(() => {
      const lvl = wallet.value.level
      if (!lvl?.next) return 100
      const range = lvl.next - lvl.min
      const done  = wallet.value.balance - lvl.min
      return Math.min(100, Math.round((done / range) * 100))
    })

    // ── Fetch helpers ──────────────────────────────────────────────────────
    async function fetchWallet() {
      const { data } = await api.get('/wallet')
      wallet.value = data
    }

    async function fetchHistory(page = 1) {
      loadingHistory.value = true
      try {
        const { data } = await api.get(`/wallet/history?page=${page}`)
        history.value = data
      } finally {
        loadingHistory.value = false
      }
    }

    async function fetchMarket() {
      loadingMarket.value = true
      try {
        const { data } = await api.get('/marketplace')
        marketItems.value = data.items
      } finally {
        loadingMarket.value = false
      }
    }

    async function fetchTokens() {
      loadingTokens.value = true
      try {
        const { data } = await api.get('/tokens')
        tokens.value       = data.tokens
        tokenSummary.value = { available: data.available, total: data.total }
      } finally {
        loadingTokens.value = false
      }
    }

    // ── Actions ────────────────────────────────────────────────────────────
    async function redeemItem(item) {
      if (!item.can_redeem || redeeming.value) return
      redeeming.value = item.id
      try {
        const { data } = await api.post(`/marketplace/${item.id}/redeem`)
        showToast(data.message, 'success')
        await fetchWallet()
        await fetchMarket()
        // Reload inventory agar token baru muncul
        if (activeTab.value === 'inventory') await fetchTokens()
      } catch (err) {
        showToast(err.response?.data?.message ?? 'Gagal menukar item.', 'error')
      } finally {
        redeeming.value = null
      }
    }

    function showToast(message, type = 'success') {
      toast.value = { show: true, message, type }
      setTimeout(() => (toast.value.show = false), 3000)
    }

    // ── Watch tab changes ──────────────────────────────────────────────────
    watch(activeTab, (tab) => {
      if (tab === 'history'     && history.value.data.length === 0)    fetchHistory()
      if (tab === 'marketplace' && marketItems.value.length === 0)      fetchMarket()
      if (tab === 'inventory'   && tokens.value.length === 0)           fetchTokens()
    })

    // ── Lifecycle ──────────────────────────────────────────────────────────
    onMounted(async () => {
      await fetchWallet()
      await fetchHistory()  // Default tab aktif
    })

    return {
      wallet, history, marketItems, tokens, tokenSummary,
      activeTab, tabs, redeeming, toast,
      loadingHistory, loadingMarket, loadingTokens,
      userInitial, levelProgress,
      fetchHistory, redeemItem,
    }
  }
}
</script>

<style scoped>
/* Toast animation */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* Count animation */
.count-enter-active, .count-leave-active { transition: all 0.3s ease; }
.count-enter-from                        { opacity: 0; transform: translateY(-10px); }
.count-leave-to                          { opacity: 0; transform: translateY(10px); }
</style>
