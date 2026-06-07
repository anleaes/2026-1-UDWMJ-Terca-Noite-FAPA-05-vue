<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card bordered>
          <q-card-section class="row items-center justify-between">
            <span class="text-h6">Filme</span>
            <q-btn color="primary" icon="add" label="Novo" @click="novoFilme" />
          </q-card-section>
          <q-separator />
          <q-inner-loading :showing="carregando" />
          <q-list v-if="filmes.length" separator>
            <q-item
              v-for="item in filmes"
              :key="item.id"
              clickable
              v-ripple
              :active="filmeSelecionado.id === item.id"
              active-class="bg-blue-1"
              @click="selecionarFilme(item)"
            >
              <q-item-section>
                <q-item-label>{{ item.title }}</q-item-label>
                <q-item-label caption>{{ legendaFilme(item) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="excluirFilme(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else class="text-grey-7 text-center">
            Nenhum filme cadastrado
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <FilmeForm
          v-if="exibirFormulario"
          :key="filmeSelecionado.id ?? 'novo'"
          :filme="filmeSelecionado"
          :titulo="tituloFormulario"
          @cancelar="cancelar"
          @salvar="salvar"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import FilmeForm from 'components/FilmeForm.vue'
import {
  getAllFilmesFromRest,
  createFilme,
  updateFilme,
  deleteFilme,
} from 'src/services/filmeService'

const filmeVazio = () => ({
  id: null,
  title: '',
  synopsis: '',
  duration_minutes: 1,
  age_rating: 0,
})

export default {
  name: 'FilmePage',
  components: { FilmeForm },
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      filmes: [],
      filmeSelecionado: filmeVazio(),
      exibirFormulario: false,
      modoEdicao: false,
      carregando: false,
    }
  },
  computed: {
    tituloFormulario() {
      return this.modoEdicao ? 'Editar filme' : 'Novo filme'
    },
  },
  mounted() {
    this.carregarFilmes()
  },
  methods: {
    carregarFilmes() {
      this.carregando = true

      getAllFilmesFromRest(true)
        .then((data) => {
          this.filmes = [...data]
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao carregar filmes',
          })
        })
        .finally(() => {
          this.carregando = false
        })
    },
    legendaFilme(filme) {
      return `${filme.duration_minutes} min • Class. ${filme.age_rating}`
    },
    novoFilme() {
      this.filmeSelecionado = filmeVazio()
      this.modoEdicao = false
      this.exibirFormulario = true
    },
    selecionarFilme(filme) {
      this.filmeSelecionado = { ...filme }
      this.modoEdicao = true
      this.exibirFormulario = true
    },
    cancelar() {
      this.exibirFormulario = false
      this.filmeSelecionado = filmeVazio()
    },
    salvar(filme) {
      const payload = {
        title: filme.title,
        synopsis: filme.synopsis,
        duration_minutes: filme.duration_minutes,
        age_rating: filme.age_rating,
      }

      const eraEdicao = this.modoEdicao
      const request = eraEdicao
        ? updateFilme(filme.id, payload)
        : createFilme(payload)

      request
        .then((salvo) => {
          this.filmeSelecionado = { ...salvo }
          if (!eraEdicao) {
            this.modoEdicao = true
          }
          this.$q.notify({
            type: 'positive',
            message: eraEdicao ? 'Filme atualizado com sucesso' : 'Filme cadastrado com sucesso',
          })
          return getAllFilmesFromRest(true)
        })
        .then((data) => {
          if (data) {
            this.filmes = [...data]
          }
        })
        .catch((error) => {
          console.error(error)
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao salvar filme',
          })
        })
    },
    excluirFilme(id) {
      this.$q.dialog({
        title: 'Excluir filme',
        message: 'Deseja realmente excluir este filme?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteFilme(id)
          .then(() => {
            this.$q.notify({ type: 'positive', message: 'Filme excluído com sucesso' })

            if (this.filmeSelecionado.id === id) {
              this.cancelar()
            }

            return getAllFilmesFromRest(true)
          })
          .then((data) => {
            if (data) {
              this.filmes = [...data]
            }
          })
          .catch((error) => {
            console.error(error)
            this.$q.notify({
              type: 'negative',
              message: error.message || 'Erro ao excluir filme',
            })
          })
      })
    },
  },
}
</script>
