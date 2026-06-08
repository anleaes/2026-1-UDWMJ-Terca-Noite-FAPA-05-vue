<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Filmes"
    back-to="/"
    :rows="filmes"
    :columns="columns"
    :loading="loading"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar filme' : 'Novo filme'"
    form-max-width="640px"
    empty-message="Nenhum filme cadastrado."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #body-cell-poster="props">
      <q-td :props="props">
        <q-img
          v-if="getPosterUrl(props.row.poster)"
          :src="getPosterUrl(props.row.poster)"
          alt="Poster"
          style="width: 48px; height: 72px; border-radius: 4px"
        />
        <span v-else class="text-grey-6">-</span>
      </q-td>
    </template>

    <template #body-cell-genres="props">
      <q-td :props="props">
        {{ formatGenres(props.row.genres) }}
      </q-td>
    </template>

    <template #form>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input v-model="form.title" label="Título" outlined required />
        <q-input v-model="form.synopsis" label="Sinopse" type="textarea" outlined required autogrow />
        <q-input v-model.number="form.duration_minutes" label="Duração (minutos)" type="number" outlined required min="1" />
        <q-input v-model.number="form.age_rating" label="Classificação etária" type="number" outlined required min="0" max="18" />
        <q-select
          v-model="form.genres"
          :options="genreOptions"
          label="Gêneros"
          outlined
          multiple
          emit-value
          map-options
          use-chips
        />
        <q-file
          v-model="posterFile"
          label="Poster do filme"
          outlined
          accept="image/*"
          clearable
          @update:model-value="onPosterChange"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
        <div v-if="posterPreview" class="q-mt-sm">
          <q-img :src="posterPreview" alt="Pré-visualização" style="max-width: 200px; border-radius: 4px" />
        </div>
        <div class="row q-gutter-sm justify-end">
          <q-btn flat label="Cancelar" @click="fecharForm" />
          <q-btn type="submit" color="primary" unelevated :label="editingId ? 'Atualizar' : 'Salvar'" :loading="loading" />
        </div>
      </q-form>
    </template>
  </BaseCrudPage>
</template>

<script>
import BaseCrudPage from 'components/BaseCrudPage.vue'
import {
  getAllFilmesFromRest,
  createFilme,
  updateFilme,
  deleteFilme,
  getPosterUrl,
} from 'src/services/filmeService'
import { getAllGenresFromRest } from 'src/services/generoService'

const formVazio = () => ({
  title: '',
  synopsis: '',
  duration_minutes: null,
  age_rating: null,
  genres: [],
})

export default {
  name: 'FilmesPage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      showForm: false,
      editingId: null,
      filmes: [],
      genreOptions: [],
      genreMap: {},
      posterFile: null,
      posterPreview: null,
      form: formVazio(),
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'poster', label: 'Poster', field: 'poster', align: 'center' },
        { name: 'title', label: 'Título', field: 'title', align: 'left' },
        { name: 'duration_minutes', label: 'Duração', field: 'duration_minutes', align: 'left' },
        { name: 'age_rating', label: 'Classificação', field: 'age_rating', align: 'left' },
        { name: 'genres', label: 'Gêneros', field: 'genres', align: 'left' },
      ],
    }
  },

  mounted() {
    this.carregarGenres()
    this.carregar()
  },

  methods: {
    getPosterUrl,

    carregarGenres() {
      getAllGenresFromRest()
        .then((data) => {
          this.genreOptions = data.map((g) => ({ label: g.name, value: g.id }))
          this.genreMap = Object.fromEntries(data.map((g) => [g.id, g.name]))
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar gêneros' })
        })
    },

    carregar() {
      this.loading = true
      getAllFilmesFromRest(true)
        .then((data) => { this.filmes = [...data] })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar filmes' })
        })
        .finally(() => { this.loading = false })
    },

    abrirNovo() {
      this.editingId = null
      this.posterFile = null
      this.posterPreview = null
      this.form = formVazio()
      this.showForm = true
    },

    editar(filme) {
      this.editingId = filme.id
      this.posterFile = null
      this.posterPreview = getPosterUrl(filme.poster)
      this.form = {
        title: filme.title,
        synopsis: filme.synopsis,
        duration_minutes: filme.duration_minutes,
        age_rating: filme.age_rating,
        genres: Array.isArray(filme.genres) ? [...filme.genres] : [],
      }
      this.showForm = true
    },

    fecharForm() {
      if (this.posterPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.posterPreview)
      }
      this.showForm = false
      this.editingId = null
      this.posterFile = null
      this.posterPreview = null
      this.form = formVazio()
    },

    onPosterChange(file) {
      if (this.posterPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.posterPreview)
      }
      if (!file) {
        this.posterPreview = this.editingId
          ? getPosterUrl(this.filmes.find((f) => f.id === this.editingId)?.poster)
          : null
        return
      }
      this.posterPreview = URL.createObjectURL(file)
    },

    salvar() {
      this.loading = true
      const payload = { ...this.form }
      if (this.posterFile) payload.poster = this.posterFile

      const request = this.editingId
        ? updateFilme(this.editingId, payload)
        : createFilme(payload)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Filme atualizado!' : 'Filme cadastrado!',
          })
          this.fecharForm()
          return getAllFilmesFromRest(true)
        })
        .then((data) => { if (data) this.filmes = [...data] })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: this.editingId ? 'Erro ao atualizar filme' : 'Erro ao salvar filme',
          })
        })
        .finally(() => { this.loading = false })
    },

    excluir(filme) {
      this.$q.dialog({
        title: 'Excluir filme',
        message: `Deseja excluir "${filme.title}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true
        deleteFilme(filme.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Filme excluído!' })
            if (this.editingId === filme.id) this.fecharForm()
            return getAllFilmesFromRest(true)
          })
          .then((data) => { if (data) this.filmes = [...data] })
          .catch((err) => {
            console.error(err)
            this.$q.notify({ type: 'negative', message: 'Erro ao excluir filme' })
          })
          .finally(() => { this.loading = false })
      })
    },

    formatGenres(genreIds) {
      if (!Array.isArray(genreIds) || genreIds.length === 0) return '-'
      return genreIds.map((id) => this.genreMap[id] || id).join(', ')
    },
  },
}
</script>
