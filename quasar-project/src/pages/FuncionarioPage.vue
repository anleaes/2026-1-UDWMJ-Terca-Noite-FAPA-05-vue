<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/cadastros" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Funcionários</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">{{ editingId ? 'Editar cadastro' : 'Novo cadastro' }}</h2>
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
          <div class="row q-gutter-sm">
            <q-btn type="submit" color="primary" :label="editingId ? 'Atualizar' : 'Salvar'" :loading="loading" />
            <q-btn v-if="editingId" flat label="Cancelar" @click="cancelarEdicao" />
          </div>
        </q-form>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="employees"
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
  getAllEmployeesFromRest,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from 'src/services/funcionarioService'

export default {
  name: 'FuncionarioPage',

  data() {
    return {
      loading: false,
      editingId: null,
      employees: [],
      form: {
        first_name: '',
        last_name: '',
        address: '',
        phone: '',
        email: '',
        role: '',
        salary: '',
        hire_date: '',
        active: true,
      },
        columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'first_name', label: 'Nome', field: 'first_name', align: 'left' },
        { name: 'last_name', label: 'Sobrenome', field: 'last_name', align: 'left' },
        { name: 'address', label: 'Endereço', field: 'address', align: 'left' },
        { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
        { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
        { name: 'role', label: 'Cargo', field: 'role', align: 'left' },
        { name: 'salary', label: 'Salário', field: 'salary', align: 'left' },
        { name: 'hire_date', label: 'Contratação', field: 'hire_date', align: 'left' },
        { name: 'active', label: 'Ativo', field: 'active', align: 'left' },
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

      getAllEmployeesFromRest(true)
        .then((data) => {
          this.employees = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar funcionários',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    salvar() {
      this.loading = true

      const payload = {
        ...this.form,
        salary: Number(this.form.salary),
      }

      const request = this.editingId
        ? updateEmployee(this.editingId, payload)
        : createEmployee(payload)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Funcionário atualizado!' : 'Funcionário cadastrado!',
          })
          this.limparForm()
          return getAllEmployeesFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.employees = [...data]
          }
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
            this.$q.notify({
              type: 'positive',
              message: 'Funcionário excluído!',
            })
            if (this.editingId === employee.id) {
              this.limparForm()
            }
            return getAllEmployeesFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.employees = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir funcionário',
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
        role: '',
        salary: '',
        hire_date: '',
        active: true,
      }
    },
  },
}
</script>