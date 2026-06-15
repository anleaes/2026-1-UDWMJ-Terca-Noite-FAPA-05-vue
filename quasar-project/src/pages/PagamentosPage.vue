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
      no-data-label="Nenhum pagamento registrado"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllPagamentosFromRest } from '@/services/pagamentoServices.js'

const METODOS = {
  pix: 'PIX',
  cartao_credito: 'Cartao de Credito',
  cartao_debito: 'Cartao de Debito',
  dinheiro: 'Dinheiro',
}

const pagamentos = ref([])

function fmtMoeda(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

const colunas = [
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
    format: (val) => METODOS[val] ?? val,
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'left',
    format: (val) => fmtMoeda(val),
  },
]

function carregarPagamentos() {
  getAllPagamentosFromRest()
    .then((lista) => {
      pagamentos.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar pagamentos:', err)
    })
}

onMounted(carregarPagamentos)
</script>
