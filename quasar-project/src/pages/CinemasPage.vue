<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none q-mb-lg">Cinemas</h5>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          {{ editando ? 'Editar cinema' : 'Novo cinema' }}
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.nome" label="Nome" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.cnpj" label="CNPJ" mask="##.###.###/####-##" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.endereco" label="Endereco" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.telefone" label="Telefone" mask="(##) #####-####" outlined dense />
          </div>
        </div>
        <div class="q-mt-md q-gutter-sm">
          <q-btn color="primary" :label="editando ? 'Salvar' : 'Cadastrar'" @click="salvar" />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </q-card-section>
    </q-card>

    <CinemaSalasCard v-if="editando" :cinema-id="cinemaId" />

    <q-table
      title="Cinemas cadastrados"
      :rows="cinemas"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      no-data-label="Nenhum cinema cadastrado"
    >
      <template #body-cell-acoes="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn flat round icon="delete" color="negative" @click="excluir(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CinemaSalasCard from '@/components/CinemaSalasCard.vue'
import {
  getAllCinemasFromRest,
  createCinemaFromRest,
  updateCinemaFromRest,
  deleteCinemaFromRest,
} from '@/services/cinemaServices.js'

const cinemas = ref([])
const editando = ref(false)
const cinemaId = ref(null)
const form = ref({ nome: '', cnpj: '', endereco: '', telefone: '' })

const colunas = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'endereco', label: 'Endereco', field: 'endereco', align: 'left' },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left' },
  { name: 'cnpj', label: 'CNPJ', field: 'cnpj', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

function limparMascara(valor) {
  if (typeof valor !== 'string') return valor
  return valor.replace(/\D/g, '')
}

function carregarCinemas() {
  getAllCinemasFromRest()
    .then((lista) => {
      cinemas.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar cinemas:', err)
    })
}

function salvar() {
  if (!form.value.nome) return

  const dados = {
    nome: form.value.nome,
    cnpj: limparMascara(form.value.cnpj),
    endereco: form.value.endereco,
    telefone: limparMascara(form.value.telefone),
  }

  const acao = editando.value
    ? updateCinemaFromRest(cinemaId.value, { ...dados, id: cinemaId.value })
    : createCinemaFromRest(dados)

  acao
    .then(() => {
      limparForm()
      carregarCinemas()
    })
    .catch((err) => {
      console.log('Erro ao salvar cinema:', err)
    })
}

function editar(cinema) {
  editando.value = true
  cinemaId.value = cinema.id
  form.value = {
    nome: cinema.nome,
    cnpj: cinema.cnpj,
    endereco: cinema.endereco,
    telefone: cinema.telefone,
  }
}

function excluir(id) {
  deleteCinemaFromRest(id)
    .then(() => carregarCinemas())
    .catch((err) => {
      console.log('Erro ao excluir cinema:', err)
    })
}

function limparForm() {
  editando.value = false
  cinemaId.value = null
  form.value = { nome: '', cnpj: '', endereco: '', telefone: '' }
}

onMounted(() => {
  carregarCinemas()
})
</script>
