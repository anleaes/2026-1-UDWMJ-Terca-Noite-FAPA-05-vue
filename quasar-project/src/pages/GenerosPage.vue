<template>
  <CrudPage
    titulo="Generos"
    descricao="Cadastro de generos de filmes"
    nome-entidade="genero"
    :campos="campos"
    :colunas="colunas"
    :service="generoService"
  />
</template>

<script setup>
import CrudPage from '@/components/CrudPage.vue'
import {
  getAllGenerosFromRest,
  createGeneroFromRest,
  updateGeneroFromRest,
  deleteGeneroFromRest,
} from '@/services/generoServices.js'

const campos = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'descricao', label: 'Descricao', type: 'textarea', col: 'col-12' },
]

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'descricao', label: 'Descricao', field: 'descricao', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

const generoService = {
  getAll: getAllGenerosFromRest,
  create: createGeneroFromRest,
  update: updateGeneroFromRest,
  delete: deleteGeneroFromRest,
}
</script>
