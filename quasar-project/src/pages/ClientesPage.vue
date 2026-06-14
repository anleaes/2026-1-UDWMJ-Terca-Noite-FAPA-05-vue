<template>
  <CrudPage
    titulo="Clientes"
    nome-entidade="cliente"
    :campos="campos"
    :colunas="colunas"
    :service="clienteService"
  />
</template>

<script setup>
import CrudPage from '@/components/CrudPage.vue'
import {
  getAllClientesFromRest,
  createClienteFromRest,
  updateClienteFromRest,
  deleteClienteFromRest,
} from '@/services/clienteServices.js'

const campos = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'sobrenome', label: 'Sobrenome', type: 'text', required: true },
  { name: 'cpf', label: 'CPF', type: 'cpf', required: true },
  { name: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
  {
    name: 'genero',
    label: 'Genero',
    type: 'select',
    options: [
      { label: 'Masculino', value: 'masculino' },
      { label: 'Feminino', value: 'feminino' },
      { label: 'Outro', value: 'outro' },
    ],
  },
  { name: 'endereco', label: 'Endereco', type: 'text', col: 'col-12' },
  { name: 'telefone', label: 'Telefone', type: 'tel' },
  { name: 'email', label: 'E-mail', type: 'email' },
]

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'sobrenome', label: 'Sobrenome', field: 'sobrenome', align: 'left' },
  { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left' },
  { name: 'genero', label: 'Genero', field: 'genero', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

const clienteService = {
  getAll: getAllClientesFromRest,
  create: createClienteFromRest,
  update: updateClienteFromRest,
  delete: deleteClienteFromRest,
}
</script>