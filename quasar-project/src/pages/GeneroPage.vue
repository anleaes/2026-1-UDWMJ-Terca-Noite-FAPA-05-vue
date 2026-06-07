<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Gêneros</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">{{ editingId ? 'Editar gênero' : 'Novo gênero' }}</h2>
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
          <div class="row q-gutter-sm">
            <q-btn type="submit" color="primary" :label="editingId ? 'Atualizar' : 'Salvar'" :loading="loading" />
            <q-btn v-if="editingId" flat label="Cancelar" @click="cancelarEdicao" />
          </div>
        </q-form>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="genres"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
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
  getAllGenresFromRest,
  createGenre,
  updateGenre,
  deleteGenre,
} from 'src/services/generoService'

export default {
  name: 'GeneroPage',

  data() {
    return {
      loading: false,
      editingId: null,
      genres: [],
      form: {
        name: '',
        description: '',
      },
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'description', label: 'Descrição', field: 'description', align: 'left' },
        { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
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
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar gêneros',
          })
        })
        .finally(() => {
          this.loading = false
        })
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
          this.limparForm()
          return getAllGenresFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.genres = [...data]
          }
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

    editar(genre) {
      this.editingId = genre.id
      this.form = {
        name: genre.name,
        description: genre.description,
      }
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
            this.$q.notify({
              type: 'positive',
              message: 'Gênero excluído!',
            })
            if (this.editingId === genre.id) {
              this.limparForm()
            }
            return getAllGenresFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.genres = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir gênero',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    cancelarEdicao() {
      this.limparForm()
    },

    limparForm() {
      this.editingId = null
      this.form = {
        name: '',
        description: '',
      }
    },
  },
}
</script>
