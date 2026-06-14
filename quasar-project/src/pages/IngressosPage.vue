<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <q-table
      title="Ingressos"
      :rows="ingressos"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      no-data-label="Nenhum ingresso cadastrado"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllIngressosFromRest } from '@/services/ingressoServices.js'

const ingressos = ref([])

function fileiraLabel(numero) {
  return String.fromCharCode(64 + numero)
}

const colunas = [
  { name: 'pedido_id', label: 'Pedido', field: 'pedido_id', align: 'left' },
  { name: 'sessao_id', label: 'Sessao', field: 'sessao_id', align: 'left' },
  {
    name: 'fileira',
    label: 'Fileira',
    field: 'fileira',
    align: 'left',
    format: (val) => fileiraLabel(val),
  },
  { name: 'coluna', label: 'Coluna', field: 'coluna', align: 'left' },
  { name: 'preco', label: 'Preco', field: 'preco', align: 'left' },
]

function carregarIngressos() {
  getAllIngressosFromRest()
    .then((lista) => {
      ingressos.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar ingressos:', err)
    })
}

onMounted(() => {
  carregarIngressos()
})
</script>
