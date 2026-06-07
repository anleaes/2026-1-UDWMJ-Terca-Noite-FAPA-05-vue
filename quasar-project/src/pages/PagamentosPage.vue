<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Pagamentos</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">
          {{ editingId ? 'Editar pagamento' : 'Selecione um pagamento' }}
        </h2>

        <q-form v-if="editingId" @submit.prevent="salvar" class="q-gutter-md">
          <q-input
            :model-value="form.order"
            label="Pedido"
            outlined
            readonly
          />
          <q-select
            v-model="form.payment_method"
            :options="paymentMethodOptions"
            label="Método de pagamento"
            outlined
            emit-value
            map-options
            required
          />
          <q-select
            v-model="form.transaction_status"
            :options="transactionStatusOptions"
            label="Status"
            outlined
            emit-value
            map-options
            required
          />
          <q-input
            v-model.number="form.charged_amount"
            label="Valor cobrado"
            type="number"
            step="0.01"
            min="0"
            outlined
            required
          />
          <div class="row q-gutter-sm">
            <q-btn type="submit" color="primary" label="Atualizar" :loading="loading" />
            <q-btn flat label="Cancelar" @click="cancelarEdicao" />
          </div>
        </q-form>

        <p v-else class="text-grey-7">
          Clique em editar na tabela para alterar um pagamento.
        </p>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="pagamentos"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template #body-cell-payment_method="props">
            <q-td :props="props">
              {{ formatPaymentMethod(props.row.payment_method) }}
            </q-td>
          </template>
          <template #body-cell-transaction_status="props">
            <q-td :props="props">
              {{ formatTransactionStatus(props.row.transaction_status) }}
            </q-td>
          </template>
          <template #body-cell-charged_amount="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.charged_amount) }}
            </q-td>
          </template>
          <template #body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
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
  getAllPagamentosFromRest,
  updatePagamento,
  deletePagamento,
} from 'src/services/pagamentoService'

export default {
  name: 'PagamentosPage',

  data() {
    return {
      loading: false,
      editingId: null,
      pagamentos: [],
      paymentMethodOptions: [
        { label: 'PIX', value: 'pix' },
        { label: 'Cartão de crédito', value: 'credit_card' },
        { label: 'Cartão de débito', value: 'debit_card' },
      ],
      transactionStatusOptions: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Aprovado', value: 'approved' },
        { label: 'Rejeitado', value: 'rejected' },
      ],
      form: {
        order: null,
        payment_method: '',
        transaction_status: '',
        charged_amount: null,
      },
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'order', label: 'Pedido', field: 'order', align: 'left' },
        { name: 'payment_method', label: 'Método', field: 'payment_method', align: 'left' },
        { name: 'transaction_status', label: 'Status', field: 'transaction_status', align: 'left' },
        { name: 'charged_amount', label: 'Valor', field: 'charged_amount', align: 'left' },
        { name: 'created_at', label: 'Criado em', field: 'created_at', align: 'left' },
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

      getAllPagamentosFromRest(true)
        .then((data) => {
          this.pagamentos = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar pagamentos',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    salvar() {
      this.loading = true

      const payload = {
        order: this.form.order,
        payment_method: this.form.payment_method,
        transaction_status: this.form.transaction_status,
        charged_amount: this.form.charged_amount,
      }

      updatePagamento(this.editingId, payload)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Pagamento atualizado!',
          })
          this.limparForm()
          return getAllPagamentosFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.pagamentos = [...data]
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao atualizar pagamento',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    editar(pagamento) {
      this.editingId = pagamento.id
      this.form = {
        order: pagamento.order,
        payment_method: pagamento.payment_method,
        transaction_status: pagamento.transaction_status,
        charged_amount: Number(pagamento.charged_amount),
      }
    },

    excluir(pagamento) {
      this.$q.dialog({
        title: 'Excluir pagamento',
        message: `Deseja excluir o pagamento #${pagamento.id} do pedido #${pagamento.order}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deletePagamento(pagamento.id)
          .then(() => {
            this.$q.notify({
              type: 'positive',
              message: 'Pagamento excluído!',
            })
            if (this.editingId === pagamento.id) {
              this.limparForm()
            }
            return getAllPagamentosFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.pagamentos = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir pagamento',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    formatPaymentMethod(value) {
      const option = this.paymentMethodOptions.find((item) => item.value === value)
      return option ? option.label : value
    },

    formatTransactionStatus(value) {
      const option = this.transactionStatusOptions.find((item) => item.value === value)
      return option ? option.label : value
    },

    formatCurrency(value) {
      return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    },

    formatDate(value) {
      if (!value) {
        return '—'
      }

      return new Date(value).toLocaleString('pt-BR')
    },

    cancelarEdicao() {
      this.limparForm()
    },

    limparForm() {
      this.editingId = null
      this.form = {
        order: null,
        payment_method: '',
        transaction_status: '',
        charged_amount: null,
      }
    },
  },
}
</script>
