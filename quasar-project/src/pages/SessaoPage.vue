<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card bordered>
          <q-card-section class="row items-center justify-between">
            <span class="text-h6">Sessão</span>
            <q-btn color="primary" icon="add" label="Nova sessão" @click="novaSessao" />
          </q-card-section>
          <q-separator />
          <q-inner-loading :showing="carregando" />
          <q-list v-if="sessoes.length" separator>
            <q-item
              v-for="item in sessoes"
              :key="item.id"
              clickable
              v-ripple
              :active="sessaoSelecionada.id === item.id"
              active-class="bg-blue-1"
              @click="selecionarSessao(item)"
            >
              <q-item-section>
                <q-item-label>{{ item.filme_titulo }}</q-item-label>
                <q-item-label caption>{{ legendaSessao(item) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="excluirSessao(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else class="text-grey-7 text-center">
            Nenhuma sessão cadastrada
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <SessaoForm
          v-if="exibirFormulario"
          :key="sessaoSelecionada.id ?? 'nova'"
          :sessao="sessaoSelecionada"
          :titulo="tituloFormulario"
          :filmes="filmes"
          :salas="salas"
          @cancelar="cancelar"
          @salvar="salvar"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import SessaoForm from 'components/SessaoForm.vue'
import {
  getAllSessoesFromRest,
  createSessao,
  updateSessao,
  deleteSessao,
} from 'src/services/sessaoService'
import { getAllFilmesFromRest } from 'src/services/filmeService'
import { getAllSalasFromRest } from 'src/services/salaService'

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
  components: { SessaoForm },
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      sessoes: [],
      filmes: [],
      salas: [],
      sessaoSelecionada: sessaoVazia(),
      exibirFormulario: false,
      modoEdicao: false,
      carregando: false,
    }
  },
  computed: {
    tituloFormulario() {
      return this.modoEdicao ? 'Editar sessão' : 'Nova sessão'
    },
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
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao carregar sessão',
          })
        })
        .finally(() => {
          this.carregando = false
        })
    },
    legendaSessao(sessao) {
      const data = sessao.start_time
        ? new Date(sessao.start_time).toLocaleString('pt-BR')
        : ''
      const preco = Number(sessao.price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      const audio = sessao.dubbed ? 'Dublado' : 'Legendado'
      return `${data} • ${sessao.cinema_name} • ${preco} • ${audio}`
    },
    novaSessao() {
      this.sessaoSelecionada = sessaoVazia()
      this.modoEdicao = false
      this.exibirFormulario = true
    },
    selecionarSessao(sessao) {
      this.sessaoSelecionada = { ...sessao }
      this.modoEdicao = true
      this.exibirFormulario = true
    },
    cancelar() {
      this.exibirFormulario = false
      this.sessaoSelecionada = sessaoVazia()
    },
    salvar(sessao) {
      const eraEdicao = this.modoEdicao
      const request = eraEdicao
        ? updateSessao(sessao.id, sessao)
        : createSessao(sessao)

      request
        .then((salva) => {
          this.sessaoSelecionada = { ...salva }
          if (!eraEdicao) {
            this.modoEdicao = true
          }
          this.$q.notify({
            type: 'positive',
            message: eraEdicao ? 'Sessão atualizada com sucesso' : 'Sessão cadastrada com sucesso',
          })
          return getAllSessoesFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.sessoes = [...data]
          }
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao salvar sessão',
          })
        })
    },
    excluirSessao(id) {
      this.$q.dialog({
        title: 'Excluir sessão',
        message: 'Deseja realmente excluir esta sessão?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteSessao(id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Sessão excluída com sucesso' })

            if (this.sessaoSelecionada.id === id) {
              this.cancelar()
            }

            return getAllSessoesFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.sessoes = [...data]
            }
          })
          .catch((error) => {
            console.error(error)
            this.$q.notify({
              type: 'negative',
              message: error.message || 'Erro ao excluir sessão',
            })
          })
      })
    },
  },
}
</script>
