<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none">Pedidos</h5>
    <p class="text-grey-7 q-mb-lg">Gerenciamento de pedidos de ingressos</p>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          {{ editando ? 'Editar pedido' : 'Novo pedido' }}
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.cliente_id"
              :options="clienteOptions"
              label="Cliente"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.sessao_id"
              :options="sessaoOptions"
              label="Sessao"
              outlined
              dense
              emit-value
              map-options
              :disable="editando && pedidoStatus === 'cancelado'"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.pagamento_metodo"
              :options="metodoOptions"
              label="Metodo de pagamento"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="valorTotal"
              label="Valor do pagamento"
              prefix="R$"
              outlined
              dense
              readonly
            />
          </div>
        </div>

        <div v-if="form.sessao_id" class="q-mt-lg">
          <div class="text-subtitle2 q-mb-md">Selecione os assentos</div>
          <MapaAssentos
            ref="mapaRef"
            v-model="form.assentos_selecionados"
            :sessao-id="form.sessao_id"
            :pedido-id="pedidoId"
            :readonly="pedidoStatus === 'cancelado'"
          />
        </div>

        <div class="q-mt-md q-gutter-sm">
          <q-btn
            color="primary"
            :label="editando ? 'Salvar' : 'Cadastrar'"
            :disable="pedidoStatus === 'cancelado'"
            @click="salvar"
          />
          <q-btn v-if="editando" flat label="Fechar edicao" @click="limparForm" />
          <template v-if="editando && podeAlterarStatus">
            <q-btn color="positive" label="Aprovar pedido" @click="aprovarPedido" />
            <q-btn color="negative" label="Cancelar pedido" @click="cancelarPedido" />
          </template>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      title="Pedidos cadastrados"
      :rows="pedidos"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      no-data-label="Nenhum pedido cadastrado"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="corStatus(props.row.status)" :label="labelStatus(props.row.status)" />
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn flat round icon="delete" color="negative" @click="excluir(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MapaAssentos from '@/components/MapaAssentos.vue'
import { getAllClientesFromRest } from '@/services/clienteServices.js'
import { getAllFilmesFromRest } from '@/services/filmeServices.js'
import { getAllCinemasFromRest } from '@/services/cinemaServices.js'
import { getAllSalasFromRest } from '@/services/salaServices.js'
import { getAllSessoesFromRest } from '@/services/sessoesServices.js'
import {
  getIngressosByPedidoFromRest,
  createIngressoFromRest,
  deleteIngressoFromRest,
} from '@/services/ingressoServices.js'
import {
  getPagamentosByPedidoFromRest,
  createPagamentoFromRest,
  updatePagamentoFromRest,
  deletePagamentoFromRest,
} from '@/services/pagamentoServices.js'
import {
  getAllPedidosFromRest,
  createPedidoFromRest,
  updatePedidoFromRest,
  deletePedidoFromRest,
} from '@/services/pedidoServices.js'

const STATUS_LABELS = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  cancelado: 'Cancelado',
  pago: 'Pago',
}

const METODOS = {
  pix: 'PIX',
  cartao_credito: 'Cartao de Credito',
  cartao_debito: 'Cartao de Debito',
  dinheiro: 'Dinheiro',
}

const pedidos = ref([])
const clientes = ref([])
const sessoes = ref([])
const filmes = ref([])
const cinemas = ref([])
const salas = ref([])
const editando = ref(false)
const pedidoId = ref(null)
const pedidoStatus = ref('pendente')
const pagamentoId = ref(null)
const ingressosDoPedido = ref([])
const mapaRef = ref(null)
const ignorarResetAssentos = ref(false)

const form = ref({
  cliente_id: null,
  sessao_id: null,
  assentos_selecionados: [],
  pagamento_metodo: 'pix',
})

const metodoOptions = Object.entries(METODOS).map(([value, label]) => ({ value, label }))

const clienteOptions = computed(() =>
  clientes.value.map((c) => ({ value: c.id, label: c.nome })),
)

const sessaoOptions = computed(() =>
  sessoes.value.map((s) => ({
    value: s.id,
    label: `${nomeFilme(s.filme_id)} · ${nomeSala(s.sala_id)} · ${fmtData(s.data_hora)} · R$ ${Number(s.preco || 0).toFixed(2)}`,
  })),
)

const sessaoAtual = computed(() => sessoes.value.find((s) => s.id === form.value.sessao_id))

const valorTotal = computed(() => {
  const preco = Number(sessaoAtual.value?.preco || 0)
  const total = form.value.assentos_selecionados.length * preco
  return total.toFixed(2)
})

const podeAlterarStatus = computed(() => {
  const status = pedidoStatus.value
  return status === 'pendente' || status === 'pago'
})

const colunas = computed(() => [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  {
    name: 'cliente_id',
    label: 'Cliente',
    field: 'cliente_id',
    align: 'left',
    format: (val) => clientes.value.find((c) => c.id === val)?.nome ?? `#${val}`,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  {
    name: 'valor_total',
    label: 'Valor total',
    field: 'valor_total',
    align: 'left',
    format: (val) => (val != null ? `R$ ${Number(val).toFixed(2)}` : ''),
  },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
])

watch(
  () => form.value.sessao_id,
  (novo, antigo) => {
    if (ignorarResetAssentos.value) {
      ignorarResetAssentos.value = false
      return
    }
    if (novo !== antigo) {
      form.value.assentos_selecionados = []
    }
  },
)

function nomeFilme(id) {
  return filmes.value.find((f) => f.id === id)?.titulo || 'Filme'
}

function nomeSala(id) {
  const sala = salas.value.find((s) => s.id === id)
  if (!sala) return 'Sala'
  const cinema = cinemas.value.find((c) => c.id === sala.cinema_id)
  return cinema ? `${cinema.nome} — ${sala.nome}` : sala.nome
}

function fmtData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-'
}

function corStatus(status) {
  if (status === 'aprovado' || status === 'pago') return 'positive'
  if (status === 'cancelado') return 'negative'
  return 'warning'
}

function labelStatus(status) {
  return STATUS_LABELS[status] ?? status
}

function carregarDadosIniciais() {
  Promise.all([
    getAllClientesFromRest(),
    getAllSessoesFromRest(),
    getAllFilmesFromRest(),
    getAllCinemasFromRest(),
    getAllSalasFromRest(),
    getAllPedidosFromRest(),
  ])
    .then(([c, s, f, ci, sa, p]) => {
      clientes.value = c
      sessoes.value = s
      filmes.value = f
      cinemas.value = ci
      salas.value = sa
      pedidos.value = p
    })
    .catch((err) => {
      console.log('Erro ao carregar dados:', err)
    })
}

function carregarPedidos() {
  getAllPedidosFromRest()
    .then((lista) => {
      pedidos.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar pedidos:', err)
    })
}

function chaveAssento(assento) {
  return `${assento.fileira}-${assento.coluna}`
}

function sincronizarIngressos(pedidoIdAtual, sessaoId, assentosSelecionados, preco) {
  const novosMap = new Map(assentosSelecionados.map((a) => [chaveAssento(a), a]))
  const promessas = []

  ingressosDoPedido.value.forEach((ingresso) => {
    const k = chaveAssento(ingresso)
    if (!novosMap.has(k)) {
      promessas.push(deleteIngressoFromRest(ingresso.id))
    } else {
      novosMap.delete(k)
    }
  })

  novosMap.forEach((assento) => {
    promessas.push(
      createIngressoFromRest({
        pedido_id: pedidoIdAtual,
        sessao_id: sessaoId,
        fileira: assento.fileira,
        coluna: assento.coluna,
        preco,
      }),
    )
  })

  return Promise.all(promessas)
}

function salvarPagamento(pedidoIdAtual) {
  const valor = Number(valorTotal.value)
  const dados = {
    pedido_id: pedidoIdAtual,
    metodo: form.value.pagamento_metodo,
    valor,
  }

  if (pagamentoId.value) {
    return updatePagamentoFromRest(pagamentoId.value, { ...dados, id: pagamentoId.value })
  }
  return createPagamentoFromRest(dados)
}

function salvar() {
  if (!form.value.cliente_id || !form.value.sessao_id || form.value.assentos_selecionados.length === 0) {
    return
  }

  const preco = Number(sessaoAtual.value?.preco || 0)
  const valor = Number(valorTotal.value)
  const dadosPedido = {
    cliente_id: form.value.cliente_id,
    status: editando.value ? pedidoStatus.value : 'pendente',
    valor_total: valor,
  }

  const acaoPedido = editando.value
    ? updatePedidoFromRest(pedidoId.value, { ...dadosPedido, id: pedidoId.value })
    : createPedidoFromRest(dadosPedido)

  acaoPedido
    .then((pedido) => {
      const id = editando.value ? pedidoId.value : pedido.id
      return sincronizarIngressos(id, form.value.sessao_id, form.value.assentos_selecionados, preco).then(
        () => salvarPagamento(id),
      )
    })
    .then(() => {
      limparForm()
      carregarPedidos()
    })
    .catch((err) => {
      console.log('Erro ao salvar pedido:', err)
    })
}

function editar(pedido) {
  editando.value = true
  pedidoId.value = pedido.id
  pedidoStatus.value = pedido.status
  form.value.cliente_id = pedido.cliente_id

  getIngressosByPedidoFromRest(pedido.id)
    .then((lista) => {
      ingressosDoPedido.value = lista
      ignorarResetAssentos.value = true
      form.value.sessao_id = lista[0]?.sessao_id ?? null
      form.value.assentos_selecionados = lista.map((i) => ({
        fileira: i.fileira,
        coluna: i.coluna,
      }))
    })
    .catch((err) => {
      console.log('Erro ao carregar ingressos do pedido:', err)
    })

  getPagamentosByPedidoFromRest(pedido.id)
    .then((lista) => {
      const pagamento = lista[0]
      if (pagamento) {
        pagamentoId.value = pagamento.id
        form.value.pagamento_metodo = pagamento.metodo
      } else {
        pagamentoId.value = null
        form.value.pagamento_metodo = 'pix'
      }
    })
    .catch((err) => {
      console.log('Erro ao carregar pagamento do pedido:', err)
    })
}

function alterarStatus(novoStatus) {
  if (!pedidoId.value) return

  updatePedidoFromRest(pedidoId.value, {
    id: pedidoId.value,
    cliente_id: form.value.cliente_id,
    status: novoStatus,
    valor_total: Number(valorTotal.value),
  })
    .then(() => {
      pedidoStatus.value = novoStatus
      if (novoStatus === 'cancelado') {
        mapaRef.value?.recarregar()
      }
      carregarPedidos()
    })
    .catch((err) => {
      console.log('Erro ao alterar status do pedido:', err)
    })
}

function aprovarPedido() {
  alterarStatus('aprovado')
}

function cancelarPedido() {
  alterarStatus('cancelado')
}

function excluir(id) {
  getIngressosByPedidoFromRest(id)
    .then((lista) => {
      const promessasIngressos = lista.map((ingresso) => deleteIngressoFromRest(ingresso.id))
      return Promise.all(promessasIngressos)
    })
    .then(() => getPagamentosByPedidoFromRest(id))
    .then((lista) => {
      const promessasPagamentos = lista.map((p) => deletePagamentoFromRest(p.id))
      return Promise.all(promessasPagamentos)
    })
    .then(() => deletePedidoFromRest(id))
    .then(() => {
      if (pedidoId.value === id) limparForm()
      carregarPedidos()
    })
    .catch((err) => {
      console.log('Erro ao excluir pedido:', err)
    })
}

function limparForm() {
  editando.value = false
  pedidoId.value = null
  pedidoStatus.value = 'pendente'
  pagamentoId.value = null
  ingressosDoPedido.value = []
  form.value = {
    cliente_id: null,
    sessao_id: null,
    assentos_selecionados: [],
    pagamento_metodo: 'pix',
  }
}

onMounted(() => {
  carregarDadosIniciais()
})
</script>
