<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <q-table
      title="Registro de Pagamentos"
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
    format: (val) => `#${val}`,
  },
  {
    name: 'metodo',
    label: 'Metodo',
    field: 'metodo',
    align: 'left',
    format: (val) => METODOS[val],
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'pedido_id', /* Recebe o ID */
    align: 'left',
    format: (val) => {
      const pedido = pedidosPorId.value[val] /* Com o ID em val, procura pelo pedido no map */
      if (pedido?.valor_total == null) return '-'
      return `R$ ${Number(pedido.valor_total).toFixed(2)}` /* Encontra e formata o valor do pedido */
    },
  },
])

function carregarPedidos() {
  getAllPedidosFromRest()
    .then((pedidos) => {
      pedidosPorId.value = Object.fromEntries(
        pedidos.map((pedido) => [pedido.id, pedido]), /* Cria o map, listando os pedidos por índice do ID */
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
