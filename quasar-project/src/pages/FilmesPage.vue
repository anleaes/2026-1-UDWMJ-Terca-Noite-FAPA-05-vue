<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <div class="row items-center q-gutter-md q-mb-lg">
      <h5 class="q-my-none col-auto">Filmes</h5>
      <q-input
        v-model="filtro"
        dense
        outlined
        placeholder="Pesquisar"
        clearable
        class="col"
      />
      <q-btn class="col-auto" color="primary" icon="add" label="Novo filme" @click="abrirNovo" />
    </div>

    <div v-if="filmes.length === 0" class="text-grey-7">
      Nenhum filme cadastrado
    </div>

    <div v-else-if="filmesFiltrados.length === 0" class="text-grey-7">
      Nenhum filme encontrado
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="filme in filmesFiltrados"
        :key="filme.id"
        class="col-6 col-sm-4 col-md-3 col-lg-2"
      >
        <q-card
          class="filme-card cursor-pointer"
          flat
          bordered
          @click="abrirEdicao(filme)"
        >
          <q-img
            v-if="filme.imagem"
            :src="filme.imagem"
            :ratio="2 / 3"
            fit="cover"
          />
          <div v-else class="filme-card__sem-imagem cinema-placeholder flex flex-center">
            <q-icon name="movie" size="48px" color="grey-5" />
          </div>

          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 ellipsis">{{ filme.titulo }}</div>
            <div class="text-caption text-grey-7">
              {{ filme.duracao ? `${filme.duracao} min` : 'Duracao nao informada' }}
            </div>
            <div v-if="nomesGeneros(filme).length" class="row q-gutter-xs q-mt-xs">
              <q-chip
                v-for="nome in nomesGeneros(filme)"
                :key="nome"
                dense
                size="sm"
                outline
                color="primary"
              >
                {{ nome }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialogAberto" persistent>
      <q-card style="min-width: 360px; max-width: 520px; width: 100%">
        <q-card-section>
          <div class="text-h6">
            {{ editando ? 'Editar filme' : 'Novo filme' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-md">
          <q-input v-model="form.titulo" label="Titulo" outlined dense />
          <q-input
            v-model.number="form.duracao"
            label="Duracao (min)"
            type="number"
            outlined
            dense
          />
          <q-input
            v-model="form.imagem"
            label="URL da imagem"
            type="url"
            outlined
            dense
            hint="Cole o link do poster"
          />
          <q-input
            v-model="form.sinopse"
            label="Sinopse"
            type="textarea"
            autogrow
            outlined
            dense
          />
          <q-select
            v-model="form.genero_ids"
            label="Generos"
            :options="opcoesGeneros"
            multiple
            use-chips
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
          />

          <q-img
            v-if="form.imagem"
            :src="form.imagem"
            :ratio="2 / 3"
            fit="cover"
            class="rounded-borders q-mt-sm"
            style="max-height: 220px"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-gutter-sm q-px-md q-pb-md">
          <q-btn
            v-if="editando"
            flat
            label="Excluir"
            color="negative"
            @click="excluir"
          />
          <q-btn flat label="Cancelar" v-close-popup @click="fecharDialog" />
          <q-btn color="primary" :label="editando ? 'Salvar' : 'Cadastrar'" @click="salvar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getAllFilmesFromRest,
  createFilmeFromRest,
  updateFilmeFromRest,
  deleteFilmeFromRest,
} from '@/services/filmeServices.js'
import { getAllGenerosFromRest } from '@/services/generoServices.js'

const filmes = ref([])
const filtro = ref('')
const dialogAberto = ref(false)
const editando = ref(false)
const filmeId = ref(null)
const opcoesGeneros = ref([])
const generosPorId = ref({})

const form = ref(criarFormVazio())

function criarFormVazio() {
  return {
    titulo: '',
    duracao: null,
    imagem: '',
    sinopse: '',
    genero_ids: [],
  }
}

function carregarFilmes() {
  getAllFilmesFromRest()
    .then((lista) => {
      filmes.value = lista
    })
    .catch((err) => {
      console.log('Erro ao carregar filmes:', err)
    })
}

function carregarGeneros() {
  getAllGenerosFromRest()
    .then((generos) => {
      opcoesGeneros.value = generos.map((genero) => ({
        label: genero.nome,
        value: genero.id,
      }))
      generosPorId.value = Object.fromEntries(
        generos.map((genero) => [genero.id, genero.nome]),
      )
    })
    .catch((err) => {
      console.log('Erro ao carregar generos:', err)
    })
}

function nomesGeneros(filme) {
  return (filme.genero_ids ?? [])
    .map((id) => generosPorId.value[id])
    .filter(Boolean)
}

const filmesFiltrados = computed(() => {
  const termo = filtro.value.toLowerCase().trim()
  if (!termo) return filmes.value

  return filmes.value.filter((filme) => {
    const texto = [
      filme.titulo,
      filme.sinopse,
      filme.duracao?.toString(),
      ...nomesGeneros(filme),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return texto.includes(termo)
  })
})

function abrirNovo() {
  editando.value = false
  filmeId.value = null
  form.value = criarFormVazio()
  dialogAberto.value = true
}

function abrirEdicao(filme) {
  editando.value = true
  filmeId.value = filme.id
  form.value = {
    titulo: filme.titulo ?? '',
    duracao: filme.duracao ?? null,
    imagem: filme.imagem ?? '',
    sinopse: filme.sinopse ?? '',
    genero_ids: filme.genero_ids ?? [],
  }
  dialogAberto.value = true
}

function fecharDialog() {
  dialogAberto.value = false
  editando.value = false
  filmeId.value = null
  form.value = criarFormVazio()
}

function montarDados() {
  return {
    titulo: form.value.titulo,
    duracao: form.value.duracao !== null && form.value.duracao !== ''
      ? Number(form.value.duracao)
      : form.value.duracao,
    imagem: form.value.imagem,
    sinopse: form.value.sinopse,
    genero_ids: form.value.genero_ids,
  }
}

function salvar() {
  if (!form.value.titulo) return

  const dados = montarDados()
  const acao = editando.value
    ? updateFilmeFromRest(filmeId.value, { ...dados, id: filmeId.value })
    : createFilmeFromRest(dados)

  acao
    .then(() => {
      fecharDialog()
      carregarFilmes()
    })
    .catch((err) => {
      console.log('Erro ao salvar filme:', err)
    })
}

function excluir() {
  deleteFilmeFromRest(filmeId.value)
    .then(() => {
      fecharDialog()
      carregarFilmes()
    })
    .catch((err) => {
      console.log('Erro ao excluir filme:', err)
    })
}

onMounted(() => {
  carregarGeneros()
  carregarFilmes()
})
</script>

<style scoped>
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
