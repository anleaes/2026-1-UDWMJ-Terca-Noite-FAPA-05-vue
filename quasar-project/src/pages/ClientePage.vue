<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/cadastros" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Clientes</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">{{ editingId ? 'Editar cadastro' : 'Novo cadastro' }}</h2>
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
          <div class="row q-gutter-sm">
            <q-btn type="submit" color="primary" :label="editingId ? 'Atualizar' : 'Salvar'" :loading="loading" />
            <q-btn v-if="editingId" flat label="Cancelar" @click="cancelarEdicao" />
          </div>
        </q-form>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="clients"
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
  getAllClientsFromRest,
  createClient,
  updateClient,
  deleteClient,
} from 'src/services/clienteService'

export default {
  name: 'ClientePage',

  data() {
    return {
      loading: false,
      editingId: null,
      clients: [],
      genderOptions: [
        { label: 'Masculino', value: 'M' },
        { label: 'Feminino', value: 'F' },
        { label: 'Outro', value: 'O' },
      ],
      form: {
        first_name: '',
        last_name: '',
        address: '',
        phone: '',
        email: '',
        gender: '',
        cpf: '',
        date_of_birth: '',
      },
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'first_name', label: 'Nome', field: 'first_name', align: 'left' },
        { name: 'last_name', label: 'Sobrenome', field: 'last_name', align: 'left' },
        { name: 'address', label: 'Endereço', field: 'address', align: 'left' },
        { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
        { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
        { name: 'gender', label: 'Gênero', field: 'gender', align: 'left' },
        { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' },
        { name: 'date_of_birth', label: 'Nascimento', field: 'date_of_birth', align: 'left' },
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

      getAllClientsFromRest(true)
        .then((data) => {
          this.clients = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar clientes',
          })
        })
        .finally(() => {
          this.loading = false
        })
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
          this.limparForm()
          return getAllClientsFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.clients = [...data]
          }
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
            this.$q.notify({
              type: 'positive',
              message: 'Cliente excluído!',
            })
            if (this.editingId === client.id) {
              this.limparForm()
            }
            return getAllClientsFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.clients = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir cliente',
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
        first_name: '',
        last_name: '',
        address: '',
        phone: '',
        email: '',
        gender: '',
        cpf: '',
        date_of_birth: '',
      }
    },
  },
}
</script>
