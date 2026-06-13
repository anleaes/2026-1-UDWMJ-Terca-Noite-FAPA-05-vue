<template>
  <CrudePage
    titulo="Filmes"
    descricao="Cadastro de filmes"
    nome-entidade="filme"
    :campos="campos"
    :colunas="colunas"
    :service="filmeService"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CrudePage from '@/components/CrudePage.vue'
import {
  getAllFilmesFromRest,
  createFilmeFromRest,
  updateFilmeFromRest,
  deleteFilmeFromRest,
} from '@/services/filmeServices.js'
import { getAllGenerosFromRest } from '@/services/generoServices.js'

const generosPorId = ref({})

const campos = ref([
  { name: 'titulo', label: 'Titulo', type: 'text', required: true },
  { name: 'duracao', label: 'Duracao (min)', type: 'number' },
  { name: 'imagem', label: 'URL da imagem', type: 'url' },
  { name: 'sinopse', label: 'Sinopse', type: 'textarea' },
  { name: 'genero_ids', label: 'Generos', type: 'select-multiple', options: [] },
])

const colunas = [
  { name: 'imagem', label: 'Capa', field: 'imagem', align: 'center', type: 'image' },
  { name: 'titulo', label: 'Titulo', field: 'titulo', align: 'left' },
  { name: 'duracao', label: 'Duracao', field: 'duracao', align: 'left' },
  {
    name: 'genero_ids',
    label: 'Generos',
    field: 'genero_ids',
    align: 'left',
    format: (ids) => formatarGeneros(ids),
  },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

const filmeService = {
  getAll: getAllFilmesFromRest,
  create: createFilmeFromRest,
  update: updateFilmeFromRest,
  delete: deleteFilmeFromRest,
}

function formatarGeneros(ids) {
  if (!ids || ids.length === 0) return '-'
  return ids.map((id) => generosPorId.value[id]).filter(Boolean).join(', ')
}

onMounted(() => {
  getAllGenerosFromRest()
    .then((generos) => {
      const mapa = {}
      const opcoes = generos.map((genero) => {
        mapa[genero.id] = genero.nome
        return { label: genero.nome, value: genero.id }
      })

      generosPorId.value = mapa

      const campoGeneros = campos.value.find((campo) => campo.name === 'genero_ids')
      if (campoGeneros) campoGeneros.options = opcoes
    })
    .catch((err) => console.log('Erro ao carregar generos:', err))
})
</script>
