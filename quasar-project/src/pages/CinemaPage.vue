<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Cinemas"
    back-to="/"
    :rows="cinemas"
    :columns="columns"
    :loading="carregando"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar cinema' : 'Novo cinema'"
    form-max-width="720px"
    empty-message="Nenhum cinema cadastrado."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #form>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input v-model="form.name" label="Nome" outlined required />
        <q-input v-model="form.address" label="Endereço" outlined required />
        <q-input v-model="form.phone" label="Telefone" outlined required />
        <q-input v-model="form.cnpj" label="CNPJ" outlined required />

        <template v-if="editingId">
          <q-separator class="q-my-md" />
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-medium">Salas</div>
            <q-btn
              color="primary"
              icon="add"
              label="Nova sala"
              dense
              unelevated
              :disable="!!salaSelecionada"
              @click="novaSala"
            />
          </div>

          <q-inner-loading :showing="carregandoSalas" />

          <q-table
            v-if="salas.length"
            flat
            bordered
            :rows="salas"
            :columns="colunasSalas"
            row-key="id"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
            class="cinema-crud-table q-mb-md"
            @row-click="(_evt, row) => editarSala(row)"
          >
            <template #body-cell-accessibility="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.accessibility ? 'positive' : 'grey-6'"
                  :label="props.row.accessibility ? 'Sim' : 'Não'"
                />
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props" @click.stop>
                <q-btn flat round dense icon="delete" color="negative" @click="excluirSala(props.row.id)" />
              </q-td>
            </template>
          </q-table>

          <p v-else-if="!carregandoSalas" class="text-grey-7 text-center q-mb-md">
            Nenhuma sala cadastrada
          </p>

          <SalaForm
            v-if="salaSelecionada"
            :key="salaSelecionada.id ?? 'nova-sala'"
            :sala="salaSelecionada"
            :titulo="salaSelecionada.id ? 'Editar sala' : 'Nova sala'"
            @cancelar="cancelarSala"
            @salvar="salvarSala"
          />
        </template>

        <div class="row q-gutter-sm justify-end q-mt-md">
          <q-btn flat label="Cancelar" @click="fecharForm" />
          <q-btn type="submit" color="primary" unelevated :label="editingId ? 'Atualizar' : 'Salvar'" />
        </div>
      </q-form>
    </template>
  </BaseCrudPage>
</template>

<script>
import BaseCrudPage from 'components/BaseCrudPage.vue'
import SalaForm from 'components/SalaForm.vue'
import {
  getAllCinemasFromRest,
  createCinema,
  updateCinema,
  deleteCinema,
} from 'src/services/cinemaService'
import {
  getSalasByCinemaFromRest,
  createSala,
  updateSala,
  deleteSala,
} from 'src/services/salaService'

const formVazio = () => ({
  name: '',
  address: '',
  phone: '',
  cnpj: '',
})

const salaVazia = () => ({
  id: null,
  rows: 1,
  columns: 1,
  projection_type: '',
  accessibility: false,
})

export default {
  name: 'CinemaPage',

  components: { BaseCrudPage, SalaForm },

  data() {
    return {
      cinemas: [],
      salas: [],
      showForm: false,
      editingId: null,
      form: formVazio(),
      salaSelecionada: null,
      carregando: false,
      carregandoSalas: false,
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'address', label: 'Endereço', field: 'address', align: 'left' },
        { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
        { name: 'cnpj', label: 'CNPJ', field: 'cnpj', align: 'left' },
      ],
      colunasSalas: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'rows', label: 'Fileiras', field: 'rows', align: 'center' },
        { name: 'columns', label: 'Colunas', field: 'columns', align: 'center' },
        { name: 'projection_type', label: 'Projeção', field: 'projection_type', align: 'left' },
        { name: 'accessibility', label: 'Acessível', field: 'accessibility', align: 'center' },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],
    }
  },

  mounted() {
    this.carregarCinemas()
  },

  methods: {
    carregarCinemas() {
      this.carregando = true
      getAllCinemasFromRest(true)
        .then((data) => { this.cinemas = [...data] })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao carregar cinemas' })
        })
        .finally(() => { this.carregando = false })
    },

    carregarSalas() {
      if (!this.editingId) {
        this.salas = []
        return
      }

      this.carregandoSalas = true
      getSalasByCinemaFromRest(this.editingId, true)
        .then((data) => { this.salas = [...data] })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao carregar salas' })
        })
        .finally(() => { this.carregandoSalas = false })
    },

    abrirNovo() {
      this.editingId = null
      this.form = formVazio()
      this.salas = []
      this.salaSelecionada = null
      this.showForm = true
    },

    editar(cinema) {
      this.editingId = cinema.id
      this.form = {
        name: cinema.name,
        address: cinema.address,
        phone: cinema.phone,
        cnpj: cinema.cnpj,
      }
      this.salaSelecionada = null
      this.showForm = true
      this.carregarSalas()
    },

    fecharForm() {
      this.showForm = false
      this.editingId = null
      this.form = formVazio()
      this.salas = []
      this.salaSelecionada = null
    },

    salvar() {
      const payload = { ...this.form }
      const request = this.editingId
        ? updateCinema(this.editingId, payload)
        : createCinema(payload)

      request
        .then((salvo) => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Cinema atualizado!' : 'Cinema cadastrado!',
          })
          if (!this.editingId) {
            this.editingId = salvo.id
            this.carregarSalas()
          }
          return getAllCinemasFromRest(true)
        })
        .then((data) => {
          if (data) this.cinemas = [...data]
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao salvar cinema' })
        })
    },

    excluir(cinema) {
      this.$q.dialog({
        title: 'Excluir cinema',
        message: 'Deseja realmente excluir este cinema?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteCinema(cinema.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Cinema excluído!' })
            if (this.editingId === cinema.id) this.fecharForm()
            return getAllCinemasFromRest(true)
          })
          .then((data) => { if (data) this.cinemas = [...data] })
          .catch((error) => {
            console.error(error)
            this.$q.notify({ type: 'negative', message: error.message || 'Erro ao excluir cinema' })
          })
      })
    },

    novaSala() {
      this.salaSelecionada = salaVazia()
    },

    editarSala(sala) {
      this.salaSelecionada = { ...sala }
    },

    cancelarSala() {
      this.salaSelecionada = null
    },

    salvarSala(sala) {
      const payload = {
        rows: sala.rows,
        columns: sala.columns,
        projection_type: sala.projection_type,
        accessibility: sala.accessibility,
        cinema: this.editingId,
      }

      const request = sala.id ? updateSala(sala.id, payload) : createSala(payload)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: sala.id ? 'Sala atualizada!' : 'Sala cadastrada!',
          })
          this.salaSelecionada = null
          this.carregarSalas()
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao salvar sala' })
        })
    },

    excluirSala(id) {
      this.$q.dialog({
        title: 'Excluir sala',
        message: 'Deseja excluir esta sala e todos os seus assentos?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteSala(id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Sala excluída!' })
            if (this.salaSelecionada?.id === id) this.salaSelecionada = null
            this.carregarSalas()
          })
          .catch((error) => {
            console.error(error)
            this.$q.notify({ type: 'negative', message: error.message || 'Erro ao excluir sala' })
          })
      })
    },
  },
}
</script>
