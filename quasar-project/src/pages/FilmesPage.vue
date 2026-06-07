<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Filmes</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">{{ editingId ? 'Editar cadastro' : 'Novo cadastro' }}</h2>
        <q-form @submit.prevent="salvar" class="q-gutter-md">
          <q-input v-model="form.title" label="Título" outlined required />
          <q-input
            v-model="form.synopsis"
            label="Sinopse"
            type="textarea"
            outlined
            required
            autogrow
          />
          <q-input
            v-model.number="form.duration_minutes"
            label="Duração (minutos)"
            type="number"
            outlined
            required
            min="1"
          />
          <q-input
            v-model.number="form.age_rating"
            label="Classificação etária"
            type="number"
            outlined
            required
            min="0"
            max="18"
          />
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
            <q-img
              :src="posterPreview"
              alt="Pré-visualização do poster"
              style="max-width: 200px; border-radius: 4px"
            />
          </div>
          <div class="row q-gutter-sm">
            <q-btn type="submit" color="primary" :label="editingId ? 'Atualizar' : 'Salvar'" :loading="loading" />
            <q-btn v-if="editingId" flat label="Cancelar" @click="cancelarEdicao" />
          </div>
        </q-form>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="filmes"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
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
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round dense icon="edit" color="primary" @click="editar(props.row)" />
              <q-btn flat round dense icon="delete" color="negative" @click="excluir(props.row)" />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import {
  getAllFilmesFromRest,
  createFilme,
  updateFilme,
  deleteFilme,
  getPosterUrl,
} from 'src/services/filmeService'
import { getAllGenresFromRest } from 'src/services/generoService'

export default {
  name: 'FilmesPage',

  data() {
    return {
      loading: false,
      editingId: null,
      filmes: [],
      genreOptions: [],
      genreMap: {},
      posterFile: null,
      posterPreview: null,
      form: {
        title: '',
        synopsis: '',
        duration_minutes: null,
        age_rating: null,
        genres: [],
      },
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'poster', label: 'Poster', field: 'poster', align: 'center' },
        { name: 'title', label: 'Título', field: 'title', align: 'left' },
        { name: 'synopsis', label: 'Sinopse', field: 'synopsis', align: 'left', style: 'max-width: 240px; white-space: normal' },
        { name: 'duration_minutes', label: 'Duração (min)', field: 'duration_minutes', align: 'left' },
        { name: 'age_rating', label: 'Classificação', field: 'age_rating', align: 'left' },
        { name: 'genres', label: 'Gêneros', field: 'genres', align: 'left' },
        { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
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
          this.genreOptions = data.map((genre) => ({
            label: genre.name,
            value: genre.id,
          }))
          this.genreMap = Object.fromEntries(data.map((genre) => [genre.id, genre.name]))
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar gêneros',
          })
        })
    },

    carregar() {
      this.loading = true

      getAllFilmesFromRest(true)
        .then((data) => {
          this.filmes = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar filmes',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    salvar() {
      this.loading = true

      const payload = {
        title: this.form.title,
        synopsis: this.form.synopsis,
        duration_minutes: this.form.duration_minutes,
        age_rating: this.form.age_rating,
        genres: this.form.genres,
      }

      if (this.posterFile) {
        payload.poster = this.posterFile
      }

      const request = this.editingId
        ? updateFilme(this.editingId, payload)
        : createFilme(payload)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Filme atualizado!' : 'Filme cadastrado!',
          })
          this.limparForm()
          return getAllFilmesFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.filmes = [...data]
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: this.editingId ? 'Erro ao atualizar filme' : 'Erro ao salvar filme',
          })
        })
        .finally(() => {
          this.loading = false
        })
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
    },

    onPosterChange(file) {
      if (this.posterPreview && this.posterPreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.posterPreview)
      }

      if (!file) {
        this.posterPreview = this.editingId
          ? getPosterUrl(this.filmes.find((item) => item.id === this.editingId)?.poster)
          : null
        return
      }

      this.posterPreview = URL.createObjectURL(file)
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
            this.$q.notify({
              type: 'positive',
              message: 'Filme excluído!',
            })
            if (this.editingId === filme.id) {
              this.limparForm()
            }
            return getAllFilmesFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.filmes = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir filme',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    formatGenres(genreIds) {
      if (!Array.isArray(genreIds) || genreIds.length === 0) {
        return '-'
      }

      return genreIds
        .map((id) => this.genreMap[id] || id)
        .join(', ')
    },

    cancelarEdicao() {
      this.limparForm()
    },

    limparForm() {
      if (this.posterPreview && this.posterPreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.posterPreview)
      }

      this.editingId = null
      this.posterFile = null
      this.posterPreview = null
      this.form = {
        title: '',
        synopsis: '',
        duration_minutes: null,
        age_rating: null,
        genres: [],
      }
    },
  },
}
</script>
