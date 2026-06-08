<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Pagamentos"
    back-to="/"
    :rows="pagamentos"
    :columns="columns"
    :loading="loading"
    :selected-id="editingId"
    :form-title="tituloFormulario"
    :show-novo="false"
    empty-message="Nenhum pagamento cadastrado."
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
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

    <template #actions="{ row }">
      <q-btn
        v-if="!pagamentoAprovado(row)"
        flat
        round
        dense
        icon="delete"
        color="negative"
        @click="excluir(row)"
      />
    </template>

    <template #form>
      <q-banner
        v-if="pagamentoFechado"
        class="bg-blue-1 text-primary q-mb-md"
        rounded
        dense
      >
        Pagamento aprovado. Não é possível alterar os dados.
      </q-banner>

      <q-form @submit.prevent="salvar" class="q-gutter-md">
        <q-input :model-value="form.order" label="Pedido" outlined readonly />

        <q-select
          v-if="!pagamentoFechado"
          v-model="form.payment_method"
          :options="paymentMethodOptions"
          label="Método de pagamento"
          outlined
          emit-value
          map-options
          required
        />
        <q-input
          v-else
          :model-value="formatPaymentMethod(form.payment_method)"
          label="Método de pagamento"
          outlined
          readonly
        />

        <q-select
          v-if="!pagamentoFechado"
          v-model="form.transaction_status"
          :options="transactionStatusOptions"
          label="Status"
          outlined
          emit-value
          map-options
          required
        />
        <q-input
          v-else
          :model-value="formatTransactionStatus(form.transaction_status)"
          label="Status"
          outlined
          readonly
        />

        <q-input
          :model-value="formatCurrency(form.charged_amount)"
          label="Valor cobrado"
          outlined
          readonly
          hint="Definido automaticamente pelo total do pedido"
        />

        <div class="row q-gutter-sm justify-end">
          <q-btn flat :label="pagamentoFechado ? 'Fechar' : 'Cancelar'" @click="fecharForm" />
          <q-btn
            v-if="!pagamentoFechado"
            type="submit"
            color="primary"
            unelevated
            label="Atualizar"
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
  getAllPagamentosFromRest,
  updatePagamento,
  deletePagamento,
} from 'src/services/pagamentoService'

const formVazio = () => ({
  order: null,
  payment_method: '',
  transaction_status: '',
  charged_amount: null,
})

export default {
  name: 'PagamentosPage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      showForm: false,
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
      form: formVazio(),
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'order', label: 'Pedido', field: 'order', align: 'left' },
        { name: 'payment_method', label: 'Método', field: 'payment_method', align: 'left' },
        { name: 'transaction_status', label: 'Status', field: 'transaction_status', align: 'left' },
        { name: 'charged_amount', label: 'Valor', field: 'charged_amount', align: 'left' },
        { name: 'created_at', label: 'Criado em', field: 'created_at', align: 'left' },
      ],
    }
  },

  computed: {
    pagamentoFechado() {
      return this.form.transaction_status === 'approved'
    },

    tituloFormulario() {
      return this.pagamentoFechado ? 'Visualizar pagamento' : 'Editar pagamento'
    },
  },

  mounted() {
    this.carregar()
  },

  methods: {
    pagamentoAprovado(pagamento) {
      return pagamento.transaction_status === 'approved'
    },
    carregar() {
      this.loading = true
      getAllPagamentosFromRest(true)
        .then((data) => { this.pagamentos = [...data] })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar pagamentos' })
        })
        .finally(() => { this.loading = false })
    },

    editar(pagamento) {
      this.editingId = pagamento.id
      this.form = {
        order: pagamento.order,
        payment_method: pagamento.payment_method,
        transaction_status: pagamento.transaction_status,
        charged_amount: Number(pagamento.charged_amount),
      }
      this.showForm = true
    },

    fecharForm() {
      this.showForm = false
      this.editingId = null
      this.form = formVazio()
    },

    salvar() {
      if (this.pagamentoFechado) {
        return
      }

      this.loading = true

      const payload = {
        order: this.form.order,
        payment_method: this.form.payment_method,
        transaction_status: this.form.transaction_status,
        charged_amount: this.form.charged_amount,
      }

      updatePagamento(this.editingId, payload)
        .then(() => {
          this.$q.notify({ type: 'positive', message: 'Pagamento atualizado!' })
          this.fecharForm()
          return getAllPagamentosFromRest(true)
        })
        .then((data) => { if (data) this.pagamentos = [...data] })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Erro ao atualizar pagamento' })
        })
        .finally(() => { this.loading = false })
    },

    excluir(pagamento) {
      if (this.pagamentoAprovado(pagamento)) {
        this.$q.notify({
          type: 'warning',
          message: 'Pagamento aprovado não pode ser excluído',
        })
        return
      }

      this.$q.dialog({
        title: 'Excluir pagamento',
        message: `Deseja excluir o pagamento #${pagamento.id} do pedido #${pagamento.order}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true
        deletePagamento(pagamento.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Pagamento excluído!' })
            if (this.editingId === pagamento.id) this.fecharForm()
            return getAllPagamentosFromRest(true)
          })
          .then((data) => { if (data) this.pagamentos = [...data] })
          .catch((err) => {
            console.error(err)
            this.$q.notify({ type: 'negative', message: 'Erro ao excluir pagamento' })
          })
          .finally(() => { this.loading = false })
      })
    },

    formatPaymentMethod(value) {
      return this.paymentMethodOptions.find((o) => o.value === value)?.label || value
    },

    formatTransactionStatus(value) {
      return this.transactionStatusOptions.find((o) => o.value === value)?.label || value
    },

    formatCurrency(value) {
      return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },

    formatDate(value) {
      return value ? new Date(value).toLocaleString('pt-BR') : '—'
    },
  },
}
</script>
