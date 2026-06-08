<template>
  <BaseCrudPage
    title="Ingressos"
    back-to="/"
    :rows="ingressos"
    :columns="columns"
    :loading="loading"
    :show-novo="false"
    :show-delete="false"
    :row-clickable="false"
    :show-form-dialog="false"
    empty-message="Nenhum ingresso emitido."
  >
    <template #body-cell-sessao="props">
      <q-td :props="props">
        {{ props.row.sessao_label || props.row.sessao }}
      </q-td>
    </template>

    <template #body-cell-assento="props">
      <q-td :props="props">
        {{ props.row.assento_label || props.row.assento }}
      </q-td>
    </template>

    <template #body-cell-issued_at="props">
      <q-td :props="props">
        {{ formatDate(props.row.issued_at) }}
      </q-td>
    </template>
  </BaseCrudPage>
</template>

<script>
import BaseCrudPage from 'components/BaseCrudPage.vue'
import { getAllIngressosFromRest } from 'src/services/ingressoService'

export default {
  name: 'IngressoPage',

  components: { BaseCrudPage },

  data() {
    return {
      loading: false,
      ingressos: [],
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
        { name: 'sessao', label: 'Sessão', field: 'sessao_label', align: 'left', sortable: true },
        { name: 'assento', label: 'Assento', field: 'assento_label', align: 'left', sortable: true },
        { name: 'order', label: 'Pedido', field: 'order', align: 'left', sortable: true },
        { name: 'issued_at', label: 'Emitido em', field: 'issued_at', align: 'left', sortable: true },
      ],
    }
  },

  mounted() {
    this.carregar()
  },

  methods: {
    carregar() {
      this.loading = true
      getAllIngressosFromRest(true)
        .then((data) => { this.ingressos = [...data] })
        .catch((err) => {
          console.error(err)
          this.$q.notify({ type: 'negative', message: 'Não foi possível carregar ingressos' })
        })
        .finally(() => { this.loading = false })
    },

    formatDate(value) {
      return value ? new Date(value).toLocaleString('pt-BR') : '—'
    },
  },
}
</script>
