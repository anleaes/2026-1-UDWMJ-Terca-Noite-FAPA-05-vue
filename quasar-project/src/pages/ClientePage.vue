<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Clientes"
    back-to="/cadastros"
    :rows="clients"
    :columns="columns"
    :loading="loading"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar cliente' : 'Novo cliente'"
    empty-message="Nenhum cliente cadastrado."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #form>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input v-model="form.first_name" label="Nome" outlined required />
        <q-input v-model="form.last_name" label="Sobrenome" outlined required />
        <q-input v-model="form.address" label="Endereço" outlined required />
        <q-input v-model="form.phone" label="Telefone" outlined required />
        <q-input v-model="form.email" label="E-mail" type="email" outlined required />
        <q-select
          v-model="form.gender"
          :options="genderOptions"
          label="Gênero"
          outlined
          emit-value
          map-options
          required
        />
        <q-input v-model="form.cpf" label="CPF" outlined required maxlength="11" />
        <q-input v-model="form.date_of_birth" label="Data de nascimento" type="date" outlined required />
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
  getAllClientsFromRest,
  createClient,
  updateClient,
  deleteClient,
} from 'src/services/clienteService'

const formVazio = () => ({
  first_name: '',
  last_name: '',
  address: '',
  phone: '',
  email: '',
  gender: '',
  cpf: '',
  date_of_birth: '',
})

export default {
  name: 'ClientePage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      showForm: false,
      editingId: null,
      clients: [],
      genderOptions: [
        { label: 'Masculino', value: 'M' },
        { label: 'Feminino', value: 'F' },
        { label: 'Outro', value: 'O' },
      ],
      form: formVazio(),
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'first_name', label: 'Nome', field: 'first_name', align: 'left' },
        { name: 'last_name', label: 'Sobrenome', field: 'last_name', align: 'left' },
        { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
        { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
        { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' },
      ],
    }
  },

  mounted() {
    this.carregar()
  },

  methods: {
    carregar() {
      this.loading = true

      getAllClientsFromRest(true)
        .then((data) => {
          this.clients = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar clientes' })
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

    editar(client) {
      this.editingId = client.id
      this.form = {
        first_name: client.first_name,
        last_name: client.last_name,
        address: client.address,
        phone: client.phone,
        email: client.email,
        gender: client.gender,
        cpf: client.cpf,
        date_of_birth: client.date_of_birth,
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
        ? updateClient(this.editingId, this.form)
        : createClient(this.form)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Cliente atualizado!' : 'Cliente cadastrado!',
          })
          this.fecharForm()
          return getAllClientsFromRest(true)
        })
        .then((data) => {
          if (data) this.clients = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: this.editingId ? 'Erro ao atualizar cliente' : 'Erro ao salvar cliente',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    excluir(client) {
      this.$q.dialog({
        title: 'Excluir cliente',
        message: `Deseja excluir ${client.first_name} ${client.last_name}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deleteClient(client.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Cliente excluído!' })
            if (this.editingId === client.id) this.fecharForm()
            return getAllClientsFromRest(true)
          })
          .then((data) => {
            if (data) this.clients = [...data]
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({ type: 'negative', message: 'Erro ao excluir cliente' })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>
