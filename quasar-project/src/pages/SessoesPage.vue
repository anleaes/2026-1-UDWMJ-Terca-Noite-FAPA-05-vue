<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <div class="row items-center q-mb-md">
      <h5 class="q-my-none col">Sessoes</h5>
      <q-btn-toggle
        v-model="modo"
        class="col-auto"
        toggle-color="primary"
        :options="[
          { label: 'Por filme', value: 'filme' },
          { label: 'Por cinema', value: 'cinema' },
        ]"
        unelevated
      />
    </div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">{{ editando ? 'Editar sessao' : 'Nova sessao' }}</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="form.filme_id" :options="filmeOptions" label="Filme" outlined dense emit-value map-options />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="form.sala_id" :options="salaOptions" label="Sala" outlined dense emit-value map-options />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.data_hora" label="Data e hora" type="datetime-local" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="form.preco" label="Preco (R$)" type="number" outlined dense />
          </div>
          <div class="col-12 col-md-4 flex items-center">
            <q-toggle v-model="form.dublado" label="Dublado" />
          </div>
        </div>
        <div class="q-mt-md q-gutter-sm">
          <q-btn color="primary" :label="editando ? 'Salvar' : 'Cadastrar'" @click="salvar" />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="!sessoes.length" class="text-grey-7">Nenhuma sessao cadastrada.</div>

    <div v-else-if="modo === 'filme'" class="row q-col-gutter-md">
      <q-card v-for="filme in filmesComSessoes" :key="filme.id" flat bordered class="col-12 col-lg-6">
        <div class="row no-wrap">
          <q-img
            v-if="filme.imagem"
            :src="filme.imagem"
            :alt="filme.titulo"
            class="poster"
            fit="cover"
          />
          <div v-else class="poster poster--placeholder cinema-placeholder flex flex-center">
            <q-icon name="movie" size="48px" color="grey-5" />
          </div>
          <div class="col q-pa-sm">
            <div class="text-subtitle1 text-weight-bold">{{ filme.titulo }}</div>
            <div class="text-caption text-grey-7 q-mb-sm">{{ filme.duracao }} min</div>
            <div
              v-for="s in sessoesDoFilme(filme.id)"
              :key="s.id"
              class="row items-center q-pa-xs q-mb-xs bg-grey-2 rounded-borders"
            >
              <div class="col">
                <div>{{ fmtData(s.data_hora) }}</div>
                <div class="text-caption text-grey-7">{{ infoSessao(s) }}</div>
              </div>
              <q-btn flat round dense icon="visibility" color="grey-7" @click="verMapa(s)" />
              <q-btn flat round dense icon="edit" color="primary" @click="editar(s)" />
              <q-btn flat round dense icon="delete" color="negative" @click="excluir(s.id)" />
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <div v-else class="column q-gutter-md">
      <q-card v-for="cinema in cinemasComSessoes" :key="cinema.id" flat bordered>
        <q-card-section class="bg-grey-2">
          <div class="text-h6">{{ cinema.nome }}</div>
          <div class="text-caption text-grey-7">{{ cinema.endereco }}</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <q-card
              v-for="sala in salasDoCinema(cinema.id)"
              :key="sala.id"
              flat
              bordered
              class="col-12 col-md-6 col-lg-4 bg-grey-1"
            >
              <q-card-section>
                <div class="text-subtitle2">{{ sala.nome }}</div>
                <div class="text-caption text-grey-7">Capacidade: {{ sala.capacidade }}</div>
              </q-card-section>
              <q-separator />
              <q-list dense>
                <q-item v-for="s in sessoesDaSala(sala.id)" :key="s.id">
                  <q-item-section>
                    <q-item-label>{{ nomeFilme(s.filme_id) }}</q-item-label>
                    <q-item-label caption>{{ fmtData(s.data_hora) }} · {{ infoSessao(s) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense icon="visibility" color="grey-7" @click="verMapa(s)" />
                    <q-btn flat round dense icon="edit" color="primary" @click="editar(s)" />
                    <q-btn flat round dense icon="delete" color="negative" @click="excluir(s.id)" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="mapaAberto">
      <q-card style="min-width: 320px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Mapa de assentos</div>
          <div v-if="sessaoMapa" class="text-caption text-grey-7">
            {{ nomeFilme(sessaoMapa.filme_id) }} · {{ fmtData(sessaoMapa.data_hora) }} ·
            {{ nomeSala(sessaoMapa.sala_id) }}
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <MapaAssentos v-if="sessaoMapa" :sessao-id="sessaoMapa.id" readonly />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MapaAssentos from '@/components/MapaAssentos.vue'
import { getAllFilmesFromRest } from '@/services/filmeServices.js'
import { getAllCinemasFromRest } from '@/services/cinemaServices.js'
import { getAllSalasFromRest } from '@/services/salaServices.js'
import {
  getAllSessoesFromRest,
  createSessaoFromRest,
  updateSessaoFromRest,
  deleteSessaoFromRest,
} from '@/services/sessoesServices.js'

const sessoes = ref([])
const filmes = ref([])
const cinemas = ref([])
const salas = ref([])
const editando = ref(false)
const sessaoId = ref(null)
const modo = ref('filme')
const form = ref(formVazio())
const mapaAberto = ref(false)
const sessaoMapa = ref(null)

const filmeOptions = computed(() => filmes.value.map((f) => ({ label: f.titulo, value: f.id })))

const salaOptions = computed(() =>
  salas.value.map((s) => {
    const c = cinemas.value.find((cinema) => cinema.id === s.cinema_id)
    return { label: c ? `${c.nome} — ${s.nome}` : s.nome, value: s.id }
  }),
)

const filmesComSessoes = computed(() => {
  const ids = new Set(sessoes.value.map((s) => s.filme_id))
  return filmes.value.filter((f) => ids.has(f.id))
})

const cinemasComSessoes = computed(() => {
  const salaIds = new Set(sessoes.value.map((s) => s.sala_id))
  const cinemaIds = new Set(salas.value.filter((s) => salaIds.has(s.id)).map((s) => s.cinema_id))
  return cinemas.value.filter((c) => cinemaIds.has(c.id))
})

function formVazio() {
  return { filme_id: null, sala_id: null, data_hora: '', preco: null, dublado: true }
}

function nomeFilme(id) {
  return filmes.value.find((f) => f.id === id)?.titulo || 'Filme'
}

function nomeSala(id) {
  const sala = salas.value.find((s) => s.id === id)
  if (!sala) return 'Sala'
  const cinema = cinemas.value.find((c) => c.id === sala.cinema_id)
  return cinema ? `${cinema.nome} — ${sala.nome}` : sala.nome
}

function fmtData(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-'
}

function infoSessao(s) {
  return `${nomeSala(s.sala_id)} · R$ ${Number(s.preco || 0).toFixed(2)} · ${s.dublado ? 'Dublado' : 'Legendado'}`
}

function sessoesDoFilme(filmeId) {
  return sessoes.value.filter((s) => s.filme_id === filmeId)
}

function sessoesDaSala(salaId) {
  return sessoes.value.filter((s) => s.sala_id === salaId)
}

function salasDoCinema(cinemaId) {
  const salaIds = new Set(sessoes.value.map((s) => s.sala_id))
  return salas.value.filter((s) => s.cinema_id === cinemaId && salaIds.has(s.id))
}

function carregarDados() {
  Promise.all([getAllSessoesFromRest(), getAllFilmesFromRest(), getAllCinemasFromRest(), getAllSalasFromRest()])
    .then(([s, f, c, sa]) => {
      sessoes.value = s
      filmes.value = f
      cinemas.value = c
      salas.value = sa
    })
    .catch((err) => console.log('Erro ao carregar sessoes:', err))
}

function salvar() {
  if (!form.value.filme_id || !form.value.sala_id || !form.value.data_hora) return
  const dados = { ...form.value }
  const req = editando.value
    ? updateSessaoFromRest(sessaoId.value, { ...dados, id: sessaoId.value })
    : createSessaoFromRest(dados)
  req
    .then(() => {
      limparForm()
      carregarDados()
    })
    .catch((err) => console.log('Erro ao salvar sessao:', err))
}

function verMapa(s) {
  sessaoMapa.value = s
  mapaAberto.value = true
}

function editar(s) {
  editando.value = true
  sessaoId.value = s.id
  form.value = {
    filme_id: s.filme_id,
    sala_id: s.sala_id,
    data_hora: s.data_hora ? String(s.data_hora).slice(0, 16) : '',
    preco: s.preco,
    dublado: s.dublado,
  }
}

function excluir(id) {
  deleteSessaoFromRest(id)
    .then(() => carregarDados())
    .catch((err) => console.log('Erro ao excluir sessao:', err))
}

function limparForm() {
  editando.value = false
  sessaoId.value = null
  form.value = formVazio()
}

onMounted(carregarDados)
</script>

<style scoped>
.poster {
  width: 160px;
  min-width: 160px;
  height: 240px;
  object-fit: cover;
}

.poster--placeholder {
  aspect-ratio: 2 / 3;
}
</style>
