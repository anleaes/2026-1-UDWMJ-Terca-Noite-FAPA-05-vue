<template>
  <q-card flat bordered class="q-mb-lg">
    <q-card-section>
      <div class="text-subtitle1 q-mb-md">Salas do cinema</div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-input v-model="form.nome" label="Nome da sala" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model.number="form.fileira" label="Fileiras" type="number" min="1" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model.number="form.coluna" label="Colunas" type="number" min="1" outlined dense />
        </div>
        <div class="col-12 col-md-2 flex items-center q-gutter-sm">
          <q-btn color="primary" :label="editando ? 'Salvar' : 'Adicionar'" @click="salvar" />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </div>

      <q-list v-if="salas.length" bordered separator>
        <q-item v-for="sala in salas" :key="sala.id">
          <q-item-section>{{ sala.nome }}</q-item-section>
          <q-item-section caption>
            {{ sala.assento?.fileira || 0 }} fileiras × {{ sala.assento?.coluna || 0 }} colunas
            · Capacidade: {{ capacidade(sala.assento) }}
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="edit" color="primary" @click="editar(sala)" />
            <q-btn flat round dense icon="delete" color="negative" @click="excluir(sala)" />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-grey-7">Nenhuma sala cadastrada.</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  getSalasByCinemaFromRest,
  createSalaFromRest,
  updateSalaFromRest,
  deleteSalaFromRest,
} from '@/services/salaServices.js'
import {
  getAssentosBySalaFromRest,
  createAssentoFromRest,
  updateAssentoFromRest,
  deleteAssentoFromRest,
} from '@/services/assentoServices.js'

const props = defineProps({
  cinemaId: { type: Number, required: true },
})

const salas = ref([])
const editando = ref(false)
const salaId = ref(null)
const assentoId = ref(null)
const form = ref({ nome: '', fileira: null, coluna: null })

function capacidade(assento) {
  if (!assento?.fileira || !assento?.coluna) return 0
  return assento.fileira * assento.coluna
}

function carregarSalas() {
  getSalasByCinemaFromRest(props.cinemaId)
    .then((listaSalas) => {
      Promise.all(
        listaSalas.map((sala) =>
          getAssentosBySalaFromRest(sala.id).then((assentos) => ({
            ...sala,
            assento: assentos[0] || null,
          })),
        ),
      ).then((lista) => {
        salas.value = lista
      })
    })
    .catch((err) => {
      console.log('Erro ao carregar salas:', err)
    })
}

function salvar() {
  if (!form.value.nome || !form.value.fileira || !form.value.coluna) return

  const dadosSala = { cinema_id: props.cinemaId, nome: form.value.nome }
  const dadosAssento = { fileira: form.value.fileira, coluna: form.value.coluna }

  if (editando.value) {
    updateSalaFromRest(salaId.value, { ...dadosSala, id: salaId.value })
      .then(() =>
        updateAssentoFromRest(assentoId.value, {
          ...dadosAssento,
          id: assentoId.value,
          sala_id: salaId.value,
        }),
      )
      .then(() => {
        limparForm()
        carregarSalas()
      })
      .catch((err) => {
        console.log('Erro ao atualizar sala:', err)
      })
  } else {
    createSalaFromRest(dadosSala)
      .then((sala) => createAssentoFromRest({ ...dadosAssento, sala_id: sala.id }))
      .then(() => {
        limparForm()
        carregarSalas()
      })
      .catch((err) => {
        console.log('Erro ao cadastrar sala:', err)
      })
  }
}

function editar(sala) {
  editando.value = true
  salaId.value = sala.id
  assentoId.value = sala.assento?.id || null
  form.value = {
    nome: sala.nome,
    fileira: sala.assento?.fileira || null,
    coluna: sala.assento?.coluna || null,
  }
}

function excluir(sala) {
  const excluirAssento = sala.assento
    ? deleteAssentoFromRest(sala.assento.id)
    : Promise.resolve()

  excluirAssento
    .then(() => deleteSalaFromRest(sala.id))
    .then(() => carregarSalas())
    .catch((err) => {
      console.log('Erro ao excluir sala:', err)
    })
}

function limparForm() {
  editando.value = false
  salaId.value = null
  assentoId.value = null
  form.value = { nome: '', fileira: null, coluna: null }
}

watch(
  () => props.cinemaId,
  () => {
    limparForm()
    carregarSalas()
  },
  { immediate: true },
)
</script>
