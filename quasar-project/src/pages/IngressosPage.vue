<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <q-table
      title="Registro de Ingressos"
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
import { ref, computed, onMounted } from 'vue'
import { getAllIngressosFromRest } from '@/services/ingressoServices.js'
import { getAllSessoesFromRest } from '@/services/sessoesServices.js'
import { getAllFilmesFromRest } from '@/services/filmeServices.js'
import { getAllSalasFromRest } from '@/services/salaServices.js'
import { getAllCinemasFromRest } from '@/services/cinemaServices.js'

const ingressos = ref([])
const sessoes = ref([])
const filmes = ref([])
const salas = ref([])
const cinemas = ref([])

function fileiraLabel(numero) {
  return String.fromCharCode(64 + numero)
}

function fmtData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-'
}

function fmtMoeda(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

function nomeFilme(id) {
  return filmes.value.find((f) => f.id === id)?.titulo ?? 'Filme'
}

function nomeSala(id) {
  const sala = salas.value.find((s) => s.id === id)
  if (!sala) return 'Sala'
  const cinema = cinemas.value.find((c) => c.id === sala.cinema_id)
  return cinema ? `${cinema.nome} — ${sala.nome}` : sala.nome
}

function labelSessao(sessaoId) {
  const sessao = sessoes.value.find((s) => s.id === sessaoId)
  if (!sessao) return `#${sessaoId}`
  return `${nomeFilme(sessao.filme_id)} · ${fmtData(sessao.data_hora)} · ${nomeSala(sessao.sala_id)}`
}

const colunas = computed(() => [
  {
    name: 'pedido_id',
    label: 'Pedido',
    field: 'pedido_id',
    align: 'left',
    format: (val) => `#${val}`,
  },
  {
    name: 'sessao_id',
    label: 'Sessao',
    field: 'sessao_id',
    align: 'left',
    format: (val) => labelSessao(val),
  },
  {
    name: 'fileira',
    label: 'Fileira',
    field: 'fileira',
    align: 'left',
    format: (val) => fileiraLabel(val),
  },
  { name: 'coluna', label: 'Coluna', field: 'coluna', align: 'left' },
  {
    name: 'preco',
    label: 'Preco',
    field: 'preco',
    align: 'left',
    format: (val) => fmtMoeda(val),
  },
])

function carregarDados() {
  Promise.all([
    getAllIngressosFromRest(),
    getAllSessoesFromRest(),
    getAllFilmesFromRest(),
    getAllSalasFromRest(),
    getAllCinemasFromRest(),
  ])
    .then(([listaIngressos, listaSessoes, listaFilmes, listaSalas, listaCinemas]) => {
      ingressos.value = listaIngressos
      sessoes.value = listaSessoes
      filmes.value = listaFilmes
      salas.value = listaSalas
      cinemas.value = listaCinemas
    })
    .catch((err) => {
      console.log('Erro ao carregar ingressos:', err)
    })
}

onMounted(carregarDados)
</script>
