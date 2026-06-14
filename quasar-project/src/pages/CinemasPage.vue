<template>
  <CrudPage
    titulo="Cinemas"
    descricao="Cadastro de cinemas"
    nome-entidade="cinema"
    :campos="campos"
    :colunas="colunas"
    :service="cinemaService"
  />
</template>

<script setup>
import CrudPage from '@/components/CrudPage.vue'
import {
  getAllCinemasFromRest,
  createCinemaFromRest,
  updateCinemaFromRest,
  deleteCinemaFromRest,
} from '@/services/cinemaServices.js'

const campos = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'cnpj', label: 'CNPJ', type: 'cnpj' },
  { name: 'endereco', label: 'Endereco', type: 'text' },
  { name: 'telefone', label: 'Telefone', type: 'tel' },
]

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'endereco', label: 'Endereco', field: 'endereco', align: 'left' },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left' },
  { name: 'cnpj', label: 'CNPJ', field: 'cnpj', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

const cinemaService = {
  getAll: getAllCinemasFromRest,
  create: createCinemaFromRest,
  update: updateCinemaFromRest,
  delete: deleteCinemaFromRest,
}
</script>
