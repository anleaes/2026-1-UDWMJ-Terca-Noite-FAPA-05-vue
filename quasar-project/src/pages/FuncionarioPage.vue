<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Funcionários"
    back-to="/cadastros"
    :rows="employees"
    :columns="columns"
    :loading="loading"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar funcionário' : 'Novo funcionário'"
    empty-message="Nenhum funcionário cadastrado."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #body-cell-active="props">
      <q-td :props="props">
        <q-badge :color="props.row.active ? 'positive' : 'grey-6'" :label="props.row.active ? 'Sim' : 'Não'" />
      </q-td>
    </template>

    <template #form>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input v-model="form.first_name" label="Nome" outlined required />
        <q-input v-model="form.last_name" label="Sobrenome" outlined required />
        <q-input v-model="form.address" label="Endereço" outlined required />
        <q-input v-model="form.phone" label="Telefone" outlined required />
        <q-input v-model="form.email" label="E-mail" type="email" outlined required />
        <q-input v-model="form.role" label="Cargo" outlined required />
        <q-input v-model="form.salary" label="Salário" type="number" outlined required />
        <q-input v-model="form.hire_date" label="Data de contratação" type="date" outlined required />
        <q-toggle v-model="form.active" label="Ativo" />
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
  getAllEmployeesFromRest,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from 'src/services/funcionarioService'

const formVazio = () => ({
  first_name: '',
  last_name: '',
  address: '',
  phone: '',
  email: '',
  role: '',
  salary: '',
  hire_date: '',
  active: true,
})

export default {
  name: 'FuncionarioPage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      showForm: false,
      editingId: null,
      employees: [],
      form: formVazio(),
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'first_name', label: 'Nome', field: 'first_name', align: 'left' },
        { name: 'last_name', label: 'Sobrenome', field: 'last_name', align: 'left' },
        { name: 'role', label: 'Cargo', field: 'role', align: 'left' },
        { name: 'salary', label: 'Salário', field: 'salary', align: 'left' },
        { name: 'active', label: 'Ativo', field: 'active', align: 'center' },
      ],
    }
  },

  mounted() {
    this.carregar()
  },

  methods: {
    carregar() {
      this.loading = true

      getAllEmployeesFromRest(true)
        .then((data) => {
          this.employees = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar funcionários' })
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

    editar(employee) {
      this.editingId = employee.id
      this.form = {
        first_name: employee.first_name,
        last_name: employee.last_name,
        address: employee.address,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
        salary: employee.salary,
        hire_date: employee.hire_date,
        active: employee.active,
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

      const payload = { ...this.form, salary: Number(this.form.salary) }
      const request = this.editingId
        ? updateEmployee(this.editingId, payload)
        : createEmployee(payload)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Funcionário atualizado!' : 'Funcionário cadastrado!',
          })
          this.fecharForm()
          return getAllEmployeesFromRest(true)
        })
        .then((data) => {
          if (data) this.employees = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: this.editingId ? 'Erro ao atualizar funcionário' : 'Erro ao salvar funcionário',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    excluir(employee) {
      this.$q.dialog({
        title: 'Excluir funcionário',
        message: `Deseja excluir ${employee.first_name} ${employee.last_name}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deleteEmployee(employee.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Funcionário excluído!' })
            if (this.editingId === employee.id) this.fecharForm()
            return getAllEmployeesFromRest(true)
          })
          .then((data) => {
            if (data) this.employees = [...data]
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({ type: 'negative', message: 'Erro ao excluir funcionário' })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>
