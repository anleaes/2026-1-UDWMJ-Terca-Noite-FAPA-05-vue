<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none">Cinemas</h5>
    <p class="text-grey-7 q-mb-lg">Cadastro de cinemas</p>

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
            <q-input v-model="form.cnpj" label="CNPJ" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.endereco" label="Endereco" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.telefone" label="Telefone" outlined dense />
          </div>
        </div>
        <div class="q-mt-md q-gutter-sm">
          <q-btn
            color="primary"
            :label="editando ? 'Salvar' : 'Cadastrar'"
            @click="salvar"
          />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      title="Cinemas cadastrados"
      :rows="cinemas"
      :columns="columns"
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
import {
  getAllCinemasFromRest,
  createCinemaFromRest,
  updateCinemaFromRest,
  deleteCinemaFromRest,
} from '@/services/cinemaServices.js'

const cinemas = ref([])
const editando = ref(false)
const cinemaId = ref(null)
const form = ref({
  nome: '',
  endereco: '',
  telefone: '',
  cnpj: '',
})

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'endereco', label: 'Endereco', field: 'endereco', align: 'left' },
  { name: 'telefone', label: 'Telefone', field: 'telefone', align: 'left' },
  { name: 'cnpj', label: 'CNPJ', field: 'cnpj', align: 'left' },
  { name: 'acoes', label: 'Acoes', field: 'acoes', align: 'center' },
]

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
  if (!form.value.nome) {
    return
  }

  const dados = {
    nome: form.value.nome,
    endereco: form.value.endereco,
    telefone: form.value.telefone,
    cnpj: form.value.cnpj,
  }

  if (editando.value) {
    updateCinemaFromRest(cinemaId.value, { ...dados, id: cinemaId.value })
      .then(() => {
        limparForm()
        carregarCinemas()
      })
      .catch((err) => {
        console.log('Erro ao atualizar cinema:', err)
      })
  } else {
    createCinemaFromRest(dados)
      .then(() => {
        limparForm()
        carregarCinemas()
      })
      .catch((err) => {
        console.log('Erro ao cadastrar cinema:', err)
      })
  }
}

function editar(cinema) {
  editando.value = true
  cinemaId.value = cinema.id
  form.value = {
    nome: cinema.nome,
    endereco: cinema.endereco,
    telefone: cinema.telefone,
    cnpj: cinema.cnpj,
  }
}

function excluir(id) {
  deleteCinemaFromRest(id)
    .then(() => {
      carregarCinemas()
    })
    .catch((err) => {
      console.log('Erro ao excluir cinema:', err)
    })
}

function limparForm() {
  editando.value = false
  cinemaId.value = null
  form.value = {
    nome: '',
    endereco: '',
    telefone: '',
    cnpj: '',
  }
}

onMounted(() => {
  carregarCinemas()
})
</script>
