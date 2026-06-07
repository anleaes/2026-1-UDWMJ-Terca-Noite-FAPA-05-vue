<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card bordered>
          <q-card-section class="row items-center justify-between">
            <span class="text-h6">Cinemas</span>
            <q-btn color="primary" icon="add" label="Novo" @click="novoCinema" />
          </q-card-section>
          <q-separator />
          <q-inner-loading :showing="carregando" />
          <q-list v-if="cinemas.length" separator>
            <q-item
              v-for="item in cinemas"
              :key="item.id"
              clickable
              v-ripple
              :active="cinemaSelecionado.id === item.id"
              active-class="bg-blue-1"
              @click="selecionarCinema(item)"
            >
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.address }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="excluirCinema(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else class="text-grey-7 text-center">
            Nenhum cinema cadastrado
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <CinemaForm
          v-if="exibirFormulario"
          :key="cinemaSelecionado.id ?? 'novo'"
          :cinema="cinemaSelecionado"
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
import CinemaForm from 'components/CinemaForm.vue'
import { cinemaService } from 'src/services/cinemaService'

const cinemaVazio = () => ({
  id: null,
  name: '',
  address: '',
  phone: '',
  cnpj: '',
})

export default {
  name: 'CinemaPage',
  components: { CinemaForm },
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      cinemas: [],
      cinemaSelecionado: cinemaVazio(),
      exibirFormulario: false,
      modoEdicao: false,
      carregando: false,
    }
  },
  computed: {
    tituloFormulario() {
      return this.modoEdicao ? 'Editar Cinema' : 'Novo Cinema'
    },
  },
  mounted() {
    this.carregarCinemas()
  },
  methods: {
    async carregarCinemas() {
      this.carregando = true
      try {
        this.cinemas = await cinemaService.list()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Erro ao carregar cinemas',
        })
      } finally {
        this.carregando = false
      }
    },
    novoCinema() {
      this.cinemaSelecionado = cinemaVazio()
      this.modoEdicao = false
      this.exibirFormulario = true
    },
    selecionarCinema(cinema) {
      this.cinemaSelecionado = { ...cinema }
      this.modoEdicao = true
      this.exibirFormulario = true
    },
    cancelar() {
      this.exibirFormulario = false
      this.cinemaSelecionado = cinemaVazio()
    },
    async salvar(cinema) {
      const payload = {
        name: cinema.name,
        address: cinema.address,
        phone: cinema.phone,
        cnpj: cinema.cnpj,
      }

      try {
        if (this.modoEdicao) {
          await cinemaService.update(cinema.id, payload)
          this.$q.notify({ type: 'positive', message: 'Cinema atualizado com sucesso' })
        } else {
          await cinemaService.create(payload)
          this.$q.notify({ type: 'positive', message: 'Cinema cadastrado com sucesso' })
        }

        await this.carregarCinemas()
        this.cancelar()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Erro ao salvar cinema',
        })
      }
    },
    excluirCinema(id) {
      this.$q.dialog({
        title: 'Excluir cinema',
        message: 'Deseja realmente excluir este cinema?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await cinemaService.remove(id)
          this.$q.notify({ type: 'positive', message: 'Cinema excluído com sucesso' })
          await this.carregarCinemas()

          if (this.cinemaSelecionado.id === id) {
            this.cancelar()
          }
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao excluir cinema',
          })
        }
      })
    },
  },
}
</script>
