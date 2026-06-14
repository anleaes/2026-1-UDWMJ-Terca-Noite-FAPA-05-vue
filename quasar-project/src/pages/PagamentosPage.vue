<template>
  <CrudPage
    titulo="Pagamentos"
    descricao="Cadastro de pagamentos vinculados a pedidos"
    nome-entidade="pagamento"
    :campos="campos"
    :colunas="colunas"
    :service="pagamentoService"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CrudPage from '@/components/CrudPage.vue'
import {
  getAllPagamentosFromRest,
  createPagamentoFromRest,
  updatePagamentoFromRest,
  deletePagamentoFromRest,
} from '@/services/pagamentoServices.js'
import { getAllPedidosFromRest } from '@/services/pedidoServices.js'

const METODOS = [
  { label: 'PIX', value: 'pix' },
  { label: 'Cartao de Credito', value: 'cartao_credito' },
  { label: 'Cartao de Debito', value: 'cartao_debito' },
  { label: 'Dinheiro', value: 'dinheiro' },
]

const metodosPorValor = Object.fromEntries(
  METODOS.map((metodo) => [metodo.value, metodo.label]),
)

const pedidosPorId = ref({})

const campos = [
  {
    name: 'pedido_id',
    label: 'Pedido',
    type: 'select',
    required: true,
    options: [],
  },
  {
    name: 'metodo',
    label: 'Metodo',
    type: 'select',
    required: true,
    options: METODOS,
  },
  {
    name: 'valor',
    label: 'Valor (R$)',
    type: 'number',
    required: true,
  },
]

const colunas = computed(() => [
  {
    name: 'pedido_id',
    label: 'Pedido',
    field: 'pedido_id',
    align: 'left',
    format: (val) => {
      const pedido = pedidosPorId.value[val]
      if (!pedido) return `#${val}`
      return `Pedido #${val} - R$ ${pedido.valor_total}`
    },
  },
  {
    name: 'metodo',
    label: 'Metodo',
    field: 'metodo',
    align: 'left',
    format: (val) => metodosPorValor[val] ?? val,
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'left',
    format: (val) => (val != null ? `R$ ${Number(val).toFixed(2)}` : ''),
  },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
])

const pagamentoService = {
  getAll: getAllPagamentosFromRest,
  create: createPagamentoFromRest,
  update: updatePagamentoFromRest,
  delete: deletePagamentoFromRest,
}

function carregarPedidos() {
  getAllPedidosFromRest()
    .then((pedidos) => {
      pedidosPorId.value = Object.fromEntries(
        pedidos.map((pedido) => [pedido.id, pedido]),
      )
      campos[0].options = pedidos.map((pedido) => ({
        label: `Pedido #${pedido.id} - R$ ${pedido.valor_total} (${pedido.status})`,
        value: pedido.id,
      }))
    })
    .catch((err) => {
      console.log('Erro ao carregar pedidos:', err)
    })
}

onMounted(() => {
  carregarPedidos()
})
</script>
