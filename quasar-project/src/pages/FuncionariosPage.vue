<template>
  <CrudPage
    titulo="Funcionarios"
    nome-entidade="funcionario"
    :campos="campos"
    :colunas="colunas"
    :service="funcionarioService"
  />
</template>

<script setup>
import CrudPage from '@/components/CrudPage.vue'
import {
  getAllFuncionariosFromRest,
  createFuncionarioFromRest,
  updateFuncionarioFromRest,
  deleteFuncionarioFromRest,
} from '@/services/funcionarioServices.js'

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
  { name: 'data_admissao', label: 'Data de admissao', type: 'date' },
  { name: 'cargo', label: 'Cargo', type: 'text', required: true },
  { name: 'salario', label: 'Salario', type: 'number' },
  { name: 'ativo', label: 'Ativo', type: 'toggle', col: 'col-12' },
]

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'sobrenome', label: 'Sobrenome', field: 'sobrenome', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargo', align: 'left' },
  {
    name: 'salario',
    label: 'Salario',
    field: 'salario',
    align: 'left',
    format: (valor) => (valor != null && valor !== '' ? `R$ ${valor}` : '-'),
  },
  {
    name: 'ativo',
    label: 'Ativo',
    field: 'ativo',
    align: 'left',
    format: (valor) => (valor ? 'Sim' : 'Nao'),
  },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

const funcionarioService = {
  getAll: getAllFuncionariosFromRest,
  create: createFuncionarioFromRest,
  update: updateFuncionarioFromRest,
  delete: deleteFuncionarioFromRest,
}
</script>
