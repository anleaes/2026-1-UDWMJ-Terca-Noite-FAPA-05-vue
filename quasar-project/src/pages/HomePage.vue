<template>
  <q-page class="q-pa-lg">
    <div class="q-mb-lg">
      <h5 class="q-my-none">Painel</h5>
    </div>

    <div v-if="carregando" class="text-grey-7">Carregando indicadores...</div>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="card in cardsIndicadores"
          :key="card.titulo"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card
            flat
            bordered
            class="dashboard-card cursor-pointer"
            @click="irPara(card.rota)"
          >
            <q-card-section class="row items-center no-wrap">
              <q-avatar :color="card.cor" text-color="white" size="48px" class="q-mr-md">
                <q-icon :name="card.icone" size="24px" />
              </q-avatar>
              <div>
                <div class="text-h5 text-weight-bold">{{ card.valor }}</div>
                <div class="text-subtitle2">{{ card.titulo }}</div>
                <div class="text-caption text-grey-7">{{ card.descricao }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-h6">Pedidos em aberto</div>
              <q-btn flat dense color="primary" label="Ver todos" to="/pedidos" />
            </q-card-section>
            <q-separator />
            <q-list v-if="pedidosEmAberto.length">
              <q-item
                v-for="pedido in pedidosEmAberto"
                :key="pedido.id"
                clickable
                :to="'/pedidos'"
              >
                <q-item-section>
                  <q-item-label>Pedido #{{ pedido.id }} — {{ nomeCliente(pedido.cliente_id) }}</q-item-label>
                  <q-item-label caption>{{ labelStatus(pedido.status) }} · {{ fmtMoeda(pedido.valor_total) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="corStatus(pedido.status)" :label="labelStatus(pedido.status)" />
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section v-else class="text-grey-7">
              Nenhum pedido pendente.
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section class="row items-center justify-between">
              <div class="text-h6">Proximas sessoes</div>
              <q-btn flat dense color="primary" label="Ver todas" to="/sessoes" />
            </q-card-section>
            <q-separator />
            <q-list v-if="proximasSessoes.length">
              <q-item
                v-for="sessao in proximasSessoes"
                :key="sessao.id"
                clickable
                :to="'/sessoes'"
              >
                <q-item-section avatar>
                  <q-avatar rounded size="48px">
                    <q-img v-if="posterFilme(sessao.filme_id)" :src="posterFilme(sessao.filme_id)" />
                    <q-icon v-else name="movie" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ nomeFilme(sessao.filme_id) }}</q-item-label>
                  <q-item-label caption>
                    {{ fmtData(sessao.data_hora) }} · {{ nomeSala(sessao.sala_id) }} · {{ fmtMoeda(sessao.preco) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section v-else class="text-grey-7">
              Nenhuma sessao futura cadastrada.
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/services/api.js'

const router = useRouter()

const carregando = ref(true)
const pedidos = ref([])
const sessoes = ref([])
const ingressos = ref([])
const pagamentos = ref([])
const clientes = ref([])
const filmes = ref([])
const salas = ref([])
const cinemas = ref([])

const STATUS_LABELS = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
}

function buscar(endpoint) {
  return fetch(`${API_URL}/${endpoint}`)
    .then((response) => response.json())
}

function fmtMoeda(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

function fmtData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-'
}

function labelStatus(status) {
  return STATUS_LABELS[status] ?? status
}

function corStatus(status) {
  if (status === 'pendente') return 'orange'
  if (status === 'aprovado') return 'positive'
  return 'grey'
}

function nomeCliente(id) {
  const cliente = clientes.value.find((c) => c.id === id)
  if (!cliente) return 'Cliente'
  return [cliente.nome, cliente.sobrenome].filter(Boolean).join(' ')
}

function nomeFilme(id) {
  return filmes.value.find((f) => f.id === id)?.titulo ?? 'Filme'
}

function posterFilme(id) {
  return filmes.value.find((f) => f.id === id)?.imagem ?? null
}

function nomeSala(id) {
  const sala = salas.value.find((s) => s.id === id)
  if (!sala) return 'Sala'
  const cinema = cinemas.value.find((c) => c.id === sala.cinema_id)
  return cinema ? `${cinema.nome} — ${sala.nome}` : sala.nome
}

const pedidosPendentes = computed(() => pedidos.value.filter((p) => p.status === 'pendente'))
const pedidosAprovados = computed(() => pedidos.value.filter((p) => p.status === 'aprovado'))
const pedidosRecusados = computed(() => pedidos.value.filter((p) => p.status === 'cancelado'))
const pedidosEmAberto = computed(() => pedidosPendentes.value)

const ingressosVendidos = computed(() => {
  const pedidosAtivos = new Set(
    pedidos.value.filter((p) => p.status !== 'cancelado').map((p) => p.id),
  )
  return ingressos.value.filter((i) => pedidosAtivos.has(i.pedido_id)).length
})

const receitaConfirmada = computed(() =>
  pagamentos.value.reduce((total, p) => total + Number(p.valor || 0), 0),
)

const filmesEmCartaz = computed(() => {
  const ids = new Set(sessoes.value.map((s) => s.filme_id))
  return ids.size
})

const proximasSessoes = computed(() => {
  const agora = Date.now()
  return sessoes.value
    .filter((s) => new Date(s.data_hora).getTime() >= agora)
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
    .slice(0, 5)
})

const cardsIndicadores = computed(() => [
  {
    titulo: 'Pedidos em aberto',
    valor: pedidosEmAberto.value.length,
    descricao: 'Aguardando aprovacao',
    icone: 'pending_actions',
    cor: 'orange',
    rota: '/pedidos',
  },
  {
    titulo: 'Pedidos aprovados',
    valor: pedidosAprovados.value.length,
    descricao: 'Vendas concluidas',
    icone: 'check_circle',
    cor: 'positive',
    rota: '/pedidos',
  },
  {
    titulo: 'Pedidos recusados',
    valor: pedidosRecusados.value.length,
    descricao: 'Pedidos cancelados',
    icone: 'cancel',
    cor: 'negative',
    rota: '/pedidos',
  },
  {
    titulo: 'Ingressos vendidos',
    valor: ingressosVendidos.value,
    descricao: 'Em pedidos ativos',
    icone: 'confirmation_number',
    cor: 'primary',
    rota: '/ingressos',
  },
  {
    titulo: 'Receita registrada',
    valor: fmtMoeda(receitaConfirmada.value),
    descricao: 'Total em pagamentos',
    icone: 'payments',
    cor: 'teal',
    rota: '/pagamentos',
  },
  {
    titulo: 'Sessoes agendadas',
    valor: sessoes.value.length,
    descricao: `${proximasSessoes.value.length} futuras`,
    icone: 'theaters',
    cor: 'indigo',
    rota: '/sessoes',
  },
  {
    titulo: 'Filmes em cartaz',
    valor: filmesEmCartaz.value,
    descricao: 'Com sessao cadastrada',
    icone: 'movie',
    cor: 'purple',
    rota: '/filmes',
  },
  {
    titulo: 'Clientes cadastrados',
    valor: clientes.value.length,
    descricao: 'Base de clientes',
    icone: 'people',
    cor: 'blue-grey',
    rota: '/clientes',
  },
])

function irPara(rota) {
  if (rota) router.push(rota)
}

function carregarPainel() {
  carregando.value = true

  Promise.all([
    buscar('pedidos'),
    buscar('sessoes'),
    buscar('ingressos'),
    buscar('pagamentos'),
    buscar('clientes'),
    buscar('filmes'),
    buscar('salas'),
    buscar('cinemas'),
  ])
    .then(([p, s, i, pg, c, f, sa, ci]) => {
      pedidos.value = p
      sessoes.value = s
      ingressos.value = i
      pagamentos.value = pg
      clientes.value = c
      filmes.value = f
      salas.value = sa
      cinemas.value = ci
    })
    .catch((err) => {
      console.log('Erro ao carregar painel:', err)
    })
    .finally(() => {
      carregando.value = false
    })
}

onMounted(carregarPainel)
</script>

<style scoped>
.dashboard-card {
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
</style>