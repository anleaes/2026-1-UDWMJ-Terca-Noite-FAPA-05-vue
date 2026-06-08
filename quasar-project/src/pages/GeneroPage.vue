<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Gêneros"
    back-to="/"
    :rows="genres"
    :columns="columns"
    :loading="loading"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar gênero' : 'Novo gênero'"
    empty-message="Nenhum gênero cadastrado."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #form>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input v-model="form.name" label="Nome" outlined required />
        <q-input
          v-model="form.description"
          label="Descrição"
          type="textarea"
          outlined
          autogrow
          required
        />
        <div class="row q-gutter-sm justify-end">
          <q-btn flat label="Cancelar" @click="fecharForm" />
          <q-btn
            type="submit"
            color="primary"
            unelevated
            :label="editingId ? 'Atualizar' : 'Salvar'"
            :loading="loading"
          />
        </div>
      </q-form>
    </template>
  </BaseCrudPage>
</template>

<script>
import BaseCrudPage from 'components/BaseCrudPage.vue'
import {
  getAllGenresFromRest,
  createGenre,
  updateGenre,
  deleteGenre,
} from 'src/services/generoService'

const formVazio = () => ({
  name: '',
  description: '',
})

export default {
  name: 'GeneroPage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      showForm: false,
      editingId: null,
      genres: [],
      form: formVazio(),
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
      ],
    }
  },

  mounted() {
    this.carregar()
  },

  methods: {
    carregar() {
      this.loading = true

      getAllGenresFromRest(true)
        .then((data) => {
          this.genres = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar gêneros' })
        })
        .finally(() => {
          this.loading = false
        })
    },

    abrirNovo() {
      this.editingId = null
      this.form = formVazio()
      this.showForm = true
    },

    editar(genre) {
      this.editingId = genre.id
      this.form = {
        name: genre.name,
        description: genre.description,
      }
      this.showForm = true
    },

    fecharForm() {
      this.showForm = false
      this.editingId = null
      this.form = formVazio()
    },

    salvar() {
      this.loading = true

      const request = this.editingId
        ? updateGenre(this.editingId, this.form)
        : createGenre(this.form)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Gênero atualizado!' : 'Gênero cadastrado!',
          })
          this.fecharForm()
          return getAllGenresFromRest(true)
        })
        .then((data) => {
          if (data) this.genres = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: this.editingId ? 'Erro ao atualizar gênero' : 'Erro ao salvar gênero',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    excluir(genre) {
      this.$q.dialog({
        title: 'Excluir gênero',
        message: `Deseja excluir ${genre.name}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deleteGenre(genre.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Gênero excluído!' })
            if (this.editingId === genre.id) this.fecharForm()
            return getAllGenresFromRest(true)
          })
          .then((data) => {
            if (data) this.genres = [...data]
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({ type: 'negative', message: 'Erro ao excluir gênero' })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>
