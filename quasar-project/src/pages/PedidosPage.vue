<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <h1 class="text-h4 q-mb-md">Pedidos</h1>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5 col-lg-4">
        <h2 class="text-h6 q-mb-md">
          {{ tituloFormulario }}
        </h2>

        <q-banner
          v-if="pedidoFechado"
          class="bg-blue-1 text-primary q-mb-md"
          rounded
          dense
        >
          Pedido finalizado. Ingressos e pagamento não podem ser alterados.
        </q-banner>

        <q-form @submit.prevent="salvar" class="q-gutter-md">
          <q-select
            v-model="form.cliente"
            :options="clientesOpcoes"
            label="Cliente"
            outlined
            emit-value
            map-options
            :disable="!!editingId"
            required
          />

          <q-select
            v-if="!pedidoFechado"
            v-model="form.payment_method"
            :options="paymentMethodOptions"
            label="Método de pagamento"
            outlined
            emit-value
            map-options
            :required="!editingId || !pedidoAtual.pagamento"
          />
          <q-input
            v-else-if="editingId"
            :model-value="formatPaymentMethod(form.payment_method)"
            label="Método de pagamento"
            outlined
            readonly
          />

          <q-separator />

          <div class="text-subtitle2">Ingressos</div>

          <template v-if="!pedidoFechado">
            <q-select
              v-model="form.sessao"
              :options="sessoesOpcoes"
              label="Sessão"
              outlined
              emit-value
              map-options
              @update:model-value="carregarAssentosDisponiveis"
            />

            <SeatMap
              v-if="form.sessao"
              v-model:selected-id="form.assento"
              :seats="assentosSala"
              :occupied-ids="assentosOcupadosIds"
              :loading="carregandoAssentos"
            />

            <q-btn
              type="button"
              color="secondary"
              icon="add"
              label="Adicionar ingresso"
              :disable="!form.sessao || !form.assento"
              @click="adicionarIngresso"
            />
          </template>

          <q-list v-if="ingressosExibidos.length" bordered separator dense>
            <q-item v-for="ingresso in ingressosExibidos" :key="ingresso.chave">
              <q-item-section>
                <q-item-label>{{ ingresso.sessao_label }}</q-item-label>
                <q-item-label caption>
                  Assento {{ ingresso.assento_label }}
                  <span v-if="ingresso.pendente"> (novo)</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="ingresso.pode_excluir"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="removerIngresso(ingresso)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <p v-else-if="!pedidoFechado" class="text-grey-7 q-mb-none">
            Adicione pelo menos um ingresso ao pedido.
          </p>

          <template v-if="editingId && pedidoAtual.pagamento">
            <q-select
              v-if="!pedidoFechado"
              v-model="form.transaction_status"
              :options="transactionStatusOptions"
              label="Status do pagamento"
              outlined
              emit-value
              map-options
              required
            />
            <q-input
              v-else
              :model-value="formatPaymentStatus(form.transaction_status)"
              label="Status do pagamento"
              outlined
              readonly
            />
          </template>

          <q-input
            v-if="editingId"
            :model-value="formatStatus(pedidoAtual.status)"
            label="Status do pedido"
            outlined
            readonly
            hint="Atualizado automaticamente ao aprovar o pagamento"
          />

          <q-input
            v-if="editingId"
            :model-value="formatDate(pedidoAtual.date_created)"
            label="Data de criação"
            outlined
            readonly
          />

          <q-input
            :model-value="formatCurrency(totalExibido)"
            label="Total"
            outlined
            readonly
          />

          <div class="row q-gutter-sm">
            <q-btn
              v-if="!pedidoFechado"
              type="submit"
              color="primary"
              :label="editingId ? 'Atualizar' : 'Salvar'"
              :loading="loading"
            />
            <q-btn
              v-if="editingId && pedidoAtual.status === 'pending'"
              type="button"
              flat
              color="negative"
              label="Cancelar pedido"
              :loading="loading"
              @click="cancelarPedido"
            />
            <q-btn v-if="editingId || formPreenchido" flat label="Fechar" @click="limparForm" />
          </div>
        </q-form>
      </div>

      <div class="col-12 col-md-7 col-lg-8">
        <h2 class="text-h6 q-mb-md">Cadastrados</h2>
        <q-table
          :rows="pedidos"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template #body-cell-date_created="props">
            <q-td :props="props">
              {{ formatDate(props.row.date_created) }}
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              {{ formatStatus(props.row.status) }}
            </q-td>
          </template>
          <template #body-cell-total_price="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.total_price) }}
            </q-td>
          </template>
          <template #body-cell-cliente_label="props">
            <q-td :props="props">
              {{ props.row.cliente_label || '—' }}
            </q-td>
          </template>
          <template #body-cell-pagamento_status="props">
            <q-td :props="props">
              {{ formatPaymentStatus(props.row.pagamento_status) }}
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                :icon="pedidoEstaFechado(props.row) ? 'visibility' : 'edit'"
                color="primary"
                @click="editar(props.row)"
              />
              <q-btn
                v-if="!pedidoEstaFechado(props.row)"
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="excluir(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import {
  getAllPedidosFromRest,
  getPedidoFromRest,
  createPedido,
  updatePedido,
  deletePedido,
} from 'src/services/pedidoService'
import { getAllClientsFromRest } from 'src/services/clienteService'
import {
  getIngressosByPedidoFromRest,
  getIngressosBySessaoFromRest,
  createIngresso,
  deleteIngresso,
} from 'src/services/ingressoService'
import {
  createPagamento,
  updatePagamento,
} from 'src/services/pagamentoService'
import { getAllSessoesFromRest, getSessaoById } from 'src/services/sessaoService'
import { getAllFilmesFromRest } from 'src/services/filmeService'
import { getAssentosBySalaFromRest } from 'src/services/assentoService'
import SeatMap from 'components/SeatMap.vue'

const formVazio = () => ({
  cliente: null,
  sessao: null,
  assento: null,
  payment_method: '',
  transaction_status: 'pending',
})

export default {
  name: 'PedidosPage',

  components: {
    SeatMap,
  },

  data() {
    return {
      loading: false,
      carregandoAssentos: false,
      editingId: null,
      pedidos: [],
      pedidoAtual: {},
      ingressos: [],
      ingressosPendentes: [],
      clientes: [],
      sessoes: [],
      filmes: [],
      assentosSala: [],
      assentosOcupadosIds: [],
      statusOptions: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Pago', value: 'paid' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
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
        { name: 'date_created', label: 'Data', field: 'date_created', align: 'left' },
        { name: 'status', label: 'Status', field: 'status', align: 'left' },
        { name: 'total_price', label: 'Total', field: 'total_price', align: 'left' },
        { name: 'cliente_label', label: 'Cliente', field: 'cliente_label', align: 'left' },
        { name: 'pagamento_status', label: 'Pagamento', field: 'pagamento_status', align: 'left' },
        { name: 'actions', label: 'Ações', field: 'actions', align: 'center' },
      ],
    }
  },

  computed: {
    pedidoFechado() {
      if (!this.editingId) {
        return false
      }

      if (this.pedidoAtual.pode_modificar_ingressos === false) {
        return true
      }

      if (this.pedidoAtual.pode_modificar_ingressos === true) {
        return false
      }

      return (
        this.pedidoAtual.status === 'paid' ||
        this.pedidoAtual.status === 'cancelled' ||
        this.pedidoAtual.pagamento_status === 'approved'
      )
    },

    tituloFormulario() {
      if (!this.editingId) {
        return 'Novo pedido'
      }

      return this.pedidoFechado
        ? `Visualizar pedido #${this.editingId}`
        : `Editar pedido #${this.editingId}`
    },

    clientesOpcoes() {
      return this.clientes.map((cliente) => ({
        label: `${cliente.first_name} ${cliente.last_name}`,
        value: cliente.id,
      }))
    },

    sessoesOpcoes() {
      return this.sessoes.map((sessao) => ({
        label: this.legendaSessao(sessao),
        value: sessao.id,
      }))
    },

    ingressosExibidos() {
      const salvos = this.ingressos.map((ingresso) => ({
        chave: `salvo-${ingresso.id}`,
        id: ingresso.id,
        sessao: ingresso.sessao,
        assento: ingresso.assento,
        sessao_label: ingresso.sessao_label || this.legendaSessao(getSessaoById(ingresso.sessao)),
        assento_label: ingresso.assento_label || ingresso.assento,
        pendente: false,
        pode_excluir: !this.pedidoFechado,
      }))

      const pendentes = this.ingressosPendentes.map((ingresso, index) => ({
        ...ingresso,
        chave: `pendente-${index}`,
        pendente: true,
        pode_excluir: !this.pedidoFechado,
      }))

      if (this.editingId) {
        return [...salvos, ...pendentes]
      }

      return pendentes
    },

    totalExibido() {
      if (this.editingId) {
        const totalPendentes = this.ingressosPendentes.reduce((sum, ingresso) => {
          const sessao = getSessaoById(ingresso.sessao)
          return sum + Number(sessao?.price || 0)
        }, 0)
        return Number(this.pedidoAtual.total_price || 0) + totalPendentes
      }

      return this.ingressosPendentes.reduce((sum, ingresso) => {
        const sessao = getSessaoById(ingresso.sessao)
        return sum + Number(sessao?.price || 0)
      }, 0)
    },

    formPreenchido() {
      return (
        this.form.cliente ||
        this.form.sessao ||
        this.form.assento ||
        this.form.payment_method ||
        this.ingressosPendentes.length > 0
      )
    },
  },

  mounted() {
    this.carregar()
  },

  methods: {
    carregar() {
      this.loading = true

      Promise.all([
        getAllPedidosFromRest(true),
        getAllClientsFromRest(true),
        getAllSessoesFromRest(true),
        getAllFilmesFromRest(true),
      ])
        .then(([pedidos, clientes, sessoes, filmes]) => {
          this.pedidos = [...pedidos]
          this.clientes = [...clientes]
          this.sessoes = [...sessoes]
          this.filmes = [...filmes]
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível carregar pedidos',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    salvar() {
      if (this.editingId) {
        if (this.pedidoFechado) {
          return
        }
        this.salvarEdicao()
        return
      }

      this.salvarNovo()
    },

    salvarNovo() {
      if (!this.form.cliente || !this.form.payment_method) {
        this.$q.notify({
          type: 'warning',
          message: 'Preencha cliente e método de pagamento',
        })
        return
      }

      if (this.ingressosPendentes.length === 0) {
        this.$q.notify({
          type: 'warning',
          message: 'Adicione pelo menos um ingresso ao pedido',
        })
        return
      }

      this.loading = true
      let pedidoCriado = null

      createPedido({ cliente: this.form.cliente, status: 'pending', total_price: 0 })
        .then((pedido) => {
          pedidoCriado = pedido
          let cadeia = Promise.resolve()

          this.ingressosPendentes.forEach((ingresso) => {
            cadeia = cadeia.then(() =>
              createIngresso({
                pedido: pedido.id,
                sessao: ingresso.sessao,
                assento: ingresso.assento,
              })
            )
          })

          return cadeia
        })
        .then(() => {
          return createPagamento({
            order: pedidoCriado.id,
            payment_method: this.form.payment_method,
          })
        })
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Pedido cadastrado com sucesso!',
          })
          this.limparForm()
          return getAllPedidosFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.pedidos = [...data]
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: err.message || 'Erro ao salvar pedido',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    salvarEdicao() {
      if (this.pedidoFechado) {
        return
      }

      const temIngressosPendentes = this.ingressosPendentes.length > 0
      const temPagamento = this.pedidoAtual.pagamento?.id || this.form.payment_method

      if (!temIngressosPendentes && !temPagamento) {
        this.$q.notify({
          type: 'warning',
          message: 'Nenhuma alteração para salvar',
        })
        return
      }

      this.loading = true

      let cadeia = Promise.resolve()

      if (this.pedidoAtual.pode_modificar_ingressos) {
        this.ingressosPendentes.forEach((ingresso) => {
          cadeia = cadeia.then(() =>
            createIngresso({
              pedido: this.editingId,
              sessao: ingresso.sessao,
              assento: ingresso.assento,
            })
          )
        })
      }

      cadeia
        .then(() => getPedidoFromRest(this.editingId))
        .then((pedido) => {
          this.pedidoAtual = { ...pedido }

          if (pedido.pagamento?.id) {
            return updatePagamento(pedido.pagamento.id, {
              order: this.editingId,
              payment_method: this.form.payment_method,
              transaction_status: this.form.transaction_status,
              charged_amount: pedido.pagamento.charged_amount,
            })
          }

          if (this.form.payment_method) {
            return createPagamento({
              order: this.editingId,
              payment_method: this.form.payment_method,
            })
          }

          return Promise.resolve()
        })
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Pedido atualizado!',
          })
          this.ingressosPendentes = []
          return Promise.all([
            getAllPedidosFromRest(true),
            this.recarregarEdicao(),
          ])
        })
        .then(([pedidos]) => {
          if (pedidos) {
            this.pedidos = [...pedidos]
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: err.message || 'Erro ao atualizar pedido',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    cancelarPedido() {
      this.$q.dialog({
        title: 'Cancelar pedido',
        message: `Deseja cancelar o pedido #${this.editingId}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        updatePedido(this.editingId, {
          cliente: this.pedidoAtual.cliente,
          status: 'cancelled',
          total_price: this.pedidoAtual.total_price,
        })
          .then(() => {
            this.$q.notify({
              type: 'positive',
              message: 'Pedido cancelado!',
            })
            return Promise.all([
              getAllPedidosFromRest(true),
              this.recarregarEdicao(),
            ])
          })
          .then(([pedidos]) => {
            if (pedidos) {
              this.pedidos = [...pedidos]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: err.message || 'Erro ao cancelar pedido',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    adicionarIngresso() {
      if (this.pedidoFechado) {
        return
      }

      if (!this.form.sessao || !this.form.assento) {
        return
      }

      const duplicado = [...this.ingressos, ...this.ingressosPendentes].some(
        (item) =>
          Number(item.sessao) === Number(this.form.sessao) &&
          Number(item.assento) === Number(this.form.assento)
      )

      if (duplicado) {
        this.$q.notify({
          type: 'warning',
          message: 'Este assento já foi adicionado ao pedido',
        })
        return
      }

      const sessao = getSessaoById(this.form.sessao)
      const assento = this.assentosSala.find(
        (item) => Number(item.id) === Number(this.form.assento)
      )

      this.ingressosPendentes.push({
        sessao: this.form.sessao,
        assento: this.form.assento,
        sessao_label: this.legendaSessao(sessao),
        assento_label: assento?.label || this.form.assento,
      })

      this.form.sessao = null
      this.form.assento = null
      this.assentosSala = []
      this.assentosOcupadosIds = []
    },

    removerIngresso(ingresso) {
      if (ingresso.pendente) {
        const indicePendente = this.ingressosPendentes.findIndex(
          (item) =>
            Number(item.sessao) === Number(ingresso.sessao) &&
            Number(item.assento) === Number(ingresso.assento)
        )
        if (indicePendente >= 0) {
          this.ingressosPendentes.splice(indicePendente, 1)
        }
        return
      }

      if (!ingresso.pode_excluir) {
        return
      }

      this.excluirIngresso(ingresso)
    },

    editar(pedido) {
      this.editingId = pedido.id
      this.ingressosPendentes = []
      this.assentosSala = []
      this.assentosOcupadosIds = []

      Promise.all([
        getPedidoFromRest(pedido.id),
        getIngressosByPedidoFromRest(pedido.id, true),
      ])
        .then(([detalhe, ingressos]) => {
          this.pedidoAtual = { ...detalhe }
          this.ingressos = [...ingressos]

          this.form = {
            cliente: detalhe.cliente,
            sessao: null,
            assento: null,
            payment_method: detalhe.pagamento?.payment_method || '',
            transaction_status: detalhe.pagamento?.transaction_status || 'pending',
          }
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao carregar pedido',
          })
        })
    },

    recarregarEdicao() {
      if (!this.editingId) {
        return Promise.resolve()
      }

      return Promise.all([
        getPedidoFromRest(this.editingId),
        getIngressosByPedidoFromRest(this.editingId, true),
      ])
        .then(([detalhe, ingressos]) => {
          this.pedidoAtual = { ...detalhe }
          this.ingressos = [...ingressos]

          this.form.payment_method = detalhe.pagamento?.payment_method || this.form.payment_method
          this.form.transaction_status = detalhe.pagamento?.transaction_status || 'pending'
          this.form.sessao = null
          this.form.assento = null
          this.assentosSala = []
      this.assentosOcupadosIds = []

          const index = this.pedidos.findIndex((item) => item.id === detalhe.id)
          if (index >= 0) {
            this.pedidos.splice(index, 1, detalhe)
          }
        })
    },

    excluir(pedido) {
      this.$q.dialog({
        title: 'Excluir pedido',
        message: `Deseja excluir o pedido #${pedido.id}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deletePedido(pedido.id)
          .then(() => {
            this.$q.notify({
              type: 'positive',
              message: 'Pedido excluído!',
            })
            if (this.editingId === pedido.id) {
              this.limparForm()
            }
            return getAllPedidosFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.pedidos = [...data]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir pedido',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    excluirIngresso(ingresso) {
      this.$q.dialog({
        title: 'Excluir ingresso',
        message: `Deseja excluir o ingresso #${ingresso.id}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        this.loading = true

        deleteIngresso(ingresso.id)
          .then(() => {
            this.$q.notify({
              type: 'positive',
              message: 'Ingresso excluído!',
            })
            return Promise.all([
              this.recarregarEdicao(),
              getAllPedidosFromRest(true),
            ])
          })
          .then(([, pedidos]) => {
            if (pedidos) {
              this.pedidos = [...pedidos]
            }
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: 'Erro ao excluir ingresso',
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    tituloFilme(sessao) {
      if (sessao?.filme_titulo) {
        return sessao.filme_titulo
      }

      const filme = this.filmes.find((item) => item.id == sessao?.filme)
      return filme?.title || `Filme #${sessao?.filme}`
    },

    legendaSessao(sessao) {
      if (!sessao) {
        return ''
      }

      const data = sessao.start_time
        ? new Date(sessao.start_time).toLocaleString('pt-BR')
        : ''
      const preco = Number(sessao.price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      const audio = sessao.dubbed ? 'Dublado' : 'Legendado'
      const filme = this.tituloFilme(sessao)
      return `${filme} • ${data} • ${preco} • ${audio}`
    },

    carregarAssentosDisponiveis() {
      this.form.assento = null
      this.assentosSala = []
      this.assentosOcupadosIds = []

      if (!this.form.sessao) {
        return
      }

      const sessao = getSessaoById(this.form.sessao)
      if (!sessao?.sala) {
        return
      }

      this.carregandoAssentos = true

      const reservados = [...this.ingressos, ...this.ingressosPendentes]
        .filter((item) => Number(item.sessao) === Number(this.form.sessao))
        .map((item) => Number(item.assento))

      Promise.all([
        getAssentosBySalaFromRest(sessao.sala),
        getIngressosBySessaoFromRest(this.form.sessao),
      ])
        .then(([assentos, ingressosOcupados]) => {
          const ocupados = [
            ...ingressosOcupados.map((item) => Number(item.assento)),
            ...reservados,
          ]
          this.assentosSala = assentos
          this.assentosOcupadosIds = ocupados
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao carregar assentos disponíveis',
          })
        })
        .finally(() => {
          this.carregandoAssentos = false
        })
    },

    limparForm() {
      this.editingId = null
      this.pedidoAtual = {}
      this.ingressos = []
      this.ingressosPendentes = []
      this.assentosSala = []
      this.assentosOcupadosIds = []
      this.form = formVazio()
    },

    formatStatus(value) {
      const option = this.statusOptions.find((item) => item.value === value)
      return option ? option.label : value
    },

    formatPaymentStatus(value) {
      if (!value) {
        return '—'
      }
      const option = this.transactionStatusOptions.find((item) => item.value === value)
      return option ? option.label : value
    },

    formatPaymentMethod(value) {
      const option = this.paymentMethodOptions.find((item) => item.value === value)
      return option ? option.label : value || '—'
    },

    pedidoEstaFechado(pedido) {
      if (pedido.pode_modificar_ingressos === false) {
        return true
      }

      if (pedido.pode_modificar_ingressos === true) {
        return false
      }

      return (
        pedido.status === 'paid' ||
        pedido.status === 'cancelled' ||
        pedido.pagamento_status === 'approved'
      )
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString('pt-BR', {
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
  },
}
</script>
