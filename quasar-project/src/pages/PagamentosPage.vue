<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none">Pagamentos</h5>
    <p class="text-grey-7 q-mb-lg">
      Historico de pagamentos registrados pelos pedidos
    </p>

    <q-table
      title="Pagamentos registrados"
      :rows="pagamentos"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      :no-data-label="'Nenhum pagamento registrado'"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllPagamentosFromRest } from '@/services/pagamentoServices.js'
import { getAllPedidosFromRest } from '@/services/pedidoServices.js'

const METODOS = {
  pix: 'PIX',
  cartao_credito: 'Cartao de Credito',
  cartao_debito: 'Cartao de Debito',
  dinheiro: 'Dinheiro',
}

const pagamentos = ref([])
const pedidosPorId = ref({})

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
    format: (val) => METODOS[val] ?? val,
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'left',
    format: (val) => (val != null ? `R$ ${Number(val).toFixed(2)}` : ''),
  },
])

function carregarPedidos() {
  getAllPedidosFromRest()
    .then((pedidos) => {
      pedidosPorId.value = Object.fromEntries(
        pedidos.map((pedido) => [pedido.id, pedido]),
      )
    })
    .catch((err) => {
      console.log('Erro ao carregar pedidos:', err)
    })
}

function carregarPagamentos() {
  getAllPagamentosFromRest()
    .then((lista) => {
      pagamentos.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar pagamentos:', err)
    })
}

onMounted(() => {
  carregarPedidos()
  carregarPagamentos()
})
</script>
