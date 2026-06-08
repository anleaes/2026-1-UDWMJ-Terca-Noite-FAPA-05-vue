<template>
  <BaseCrudPage
    v-model:show-form="showForm"
    title="Sessões"
    back-to="/"
    :rows="sessoes"
    :columns="columns"
    :loading="carregando"
    :selected-id="editingId"
    :form-title="editingId ? 'Editar sessão' : 'Nova sessão'"
    form-max-width="640px"
    empty-message="Nenhuma sessão cadastrada."
    @novo="abrirNovo"
    @row-click="editar"
    @delete="excluir"
    @cancel-form="fecharForm"
  >
    <template #body-cell-filme="props">
      <q-td :props="props">
        {{ props.row.filme_titulo || props.row.filme }}
      </q-td>
    </template>

    <template #body-cell-start_time="props">
      <q-td :props="props">
        {{ formatDate(props.row.start_time) }}
      </q-td>
    </template>

    <template #body-cell-price="props">
      <q-td :props="props">
        {{ formatCurrency(props.row.price) }}
      </q-td>
    </template>

    <template #body-cell-dubbed="props">
      <q-td :props="props">
        {{ props.row.dubbed ? 'Dublado' : 'Legendado' }}
      </q-td>
    </template>

    <template #actions="{ row }">
      <q-btn
        flat
        round
        dense
        icon="event_seat"
        color="primary"
        aria-label="Ver mapa de assentos"
        @click="abrirMapaAssentos(row)"
      />
      <q-btn flat round dense icon="delete" color="negative" @click="excluir(row)" />
    </template>

    <template #form>
      <SessaoForm
        :key="editingId ?? 'nova'"
        :sessao="sessaoSelecionada"
        :titulo="''"
        :filmes="filmes"
        :salas="salas"
        @cancelar="fecharForm"
        @salvar="salvar"
      />
    </template>
  </BaseCrudPage>

  <q-dialog v-model="exibirMapaAssentos" persistent>
    <q-card style="min-width: 320px; max-width: 720px; width: 100%">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div>
          <div class="text-h6">Mapa de assentos</div>
          <div v-if="sessaoMapa" class="text-caption text-grey-7">
            {{ sessaoMapa.filme_titulo }} • {{ legendaSessao(sessaoMapa) }}
          </div>
        </div>
        <q-btn flat round dense icon="close" @click="fecharMapaAssentos" />
      </q-card-section>

      <q-card-section>
        <SeatMap
          :seats="assentosSala"
          :occupied-ids="assentosOcupadosIds"
          :loading="carregandoMapa"
          readonly
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseCrudPage from 'components/BaseCrudPage.vue'
import SessaoForm from 'components/SessaoForm.vue'
import SeatMap from 'components/SeatMap.vue'
import {
  getAllSessoesFromRest,
  createSessao,
  updateSessao,
  deleteSessao,
} from 'src/services/sessaoService'
import { getAllFilmesFromRest } from 'src/services/filmeService'
import { getAllSalasFromRest } from 'src/services/salaService'
import { getAssentosBySalaFromRest } from 'src/services/assentoService'
import { getIngressosBySessaoFromRest } from 'src/services/ingressoService'

const sessaoVazia = () => ({
  id: null,
  filme: null,
  sala: null,
  start_time: '',
  price: 0,
  dubbed: false,
})

export default {
  name: 'SessaoPage',

  components: { BaseCrudPage, SessaoForm, SeatMap },

  data() {
    return {
      sessoes: [],
      filmes: [],
      salas: [],
      showForm: false,
      editingId: null,
      sessaoSelecionada: sessaoVazia(),
      carregando: false,
      exibirMapaAssentos: false,
      sessaoMapa: null,
      assentosSala: [],
      assentosOcupadosIds: [],
      carregandoMapa: false,
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'filme', label: 'Filme', field: 'filme_titulo', align: 'left' },
        { name: 'start_time', label: 'Início', field: 'start_time', align: 'left' },
        { name: 'price', label: 'Preço', field: 'price', align: 'left' },
        { name: 'dubbed', label: 'Áudio', field: 'dubbed', align: 'left' },
      ],
    }
  },

  mounted() {
    this.carregarDados()
  },

  methods: {
    carregarDados() {
      this.carregando = true
      Promise.all([
        getAllSessoesFromRest(true),
        getAllFilmesFromRest(true),
        getAllSalasFromRest(true),
      ])
        .then(([sessoes, filmes, salas]) => {
          this.sessoes = [...sessoes]
          this.filmes = [...filmes]
          this.salas = [...salas]
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao carregar sessões' })
        })
        .finally(() => { this.carregando = false })
    },

    abrirNovo() {
      this.editingId = null
      this.sessaoSelecionada = sessaoVazia()
      this.showForm = true
    },

    editar(sessao) {
      this.editingId = sessao.id
      this.sessaoSelecionada = { ...sessao }
      this.showForm = true
    },

    fecharForm() {
      this.showForm = false
      this.editingId = null
      this.sessaoSelecionada = sessaoVazia()
    },

    salvar(sessao) {
      const request = this.editingId
        ? updateSessao(sessao.id, sessao)
        : createSessao(sessao)

      request
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.editingId ? 'Sessão atualizada!' : 'Sessão cadastrada!',
          })
          this.fecharForm()
          return getAllSessoesFromRest(true)
        })
        .then((data) => { if (data) this.sessoes = [...data] })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao salvar sessão' })
        })
    },

    excluir(sessao) {
      this.$q.dialog({
        title: 'Excluir sessão',
        message: 'Deseja realmente excluir esta sessão?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteSessao(sessao.id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Sessão excluída!' })
            if (this.editingId === sessao.id) this.fecharForm()
            return getAllSessoesFromRest(true)
          })
          .then((data) => { if (data) this.sessoes = [...data] })
          .catch((error) => {
            console.error(error)
            this.$q.notify({ type: 'negative', message: error.message || 'Erro ao excluir sessão' })
          })
      })
    },

    legendaSessao(sessao) {
      const data = sessao.start_time ? new Date(sessao.start_time).toLocaleString('pt-BR') : ''
      const preco = Number(sessao.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const audio = sessao.dubbed ? 'Dublado' : 'Legendado'
      return `${data} • ${preco} • ${audio}`
    },

    formatDate(value) {
      return value ? new Date(value).toLocaleString('pt-BR') : '—'
    },

    formatCurrency(value) {
      return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },

    abrirMapaAssentos(sessao) {
      if (!sessao?.sala) {
        this.$q.notify({ type: 'warning', message: 'Esta sessão não possui sala vinculada' })
        return
      }

      this.sessaoMapa = { ...sessao }
      this.exibirMapaAssentos = true
      this.assentosSala = []
      this.assentosOcupadosIds = []
      this.carregandoMapa = true

      Promise.all([
        getAssentosBySalaFromRest(sessao.sala),
        getIngressosBySessaoFromRest(sessao.id),
      ])
        .then(([assentos, ingressos]) => {
          this.assentosSala = assentos
          this.assentosOcupadosIds = ingressos.map((item) => Number(item.assento))
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({ type: 'negative', message: error.message || 'Erro ao carregar mapa' })
          this.fecharMapaAssentos()
        })
        .finally(() => { this.carregandoMapa = false })
    },

    fecharMapaAssentos() {
      this.exibirMapaAssentos = false
      this.sessaoMapa = null
      this.assentosSala = []
      this.assentosOcupadosIds = []
    },
  },
}
</script>
