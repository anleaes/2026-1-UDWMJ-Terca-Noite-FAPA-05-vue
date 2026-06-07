<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Ingressos</h1>

    <q-table
      :rows="ingressos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
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
    </q-table>
  </q-page>
</template>

<script>
import { getAllIngressosFromRest } from 'src/services/ingressoService'

export default {
  name: 'IngressoPage',

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
        .then((data) => {
          this.ingressos = [...data]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar ingressos',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    formatDate(value) {
      if (!value) {
        return '—'
      }

      return new Date(value).toLocaleString('pt-BR')
    },
  },
}
</script>
