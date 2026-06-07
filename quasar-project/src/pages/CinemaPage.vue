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

        <q-card v-if="modoEdicao && cinemaSelecionado.id" bordered class="q-mt-md">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6">Salas</div>
              <div class="text-caption text-grey-7">
                {{ cinemaSelecionado.name }}
              </div>
            </div>
            <q-btn
              color="primary"
              icon="add"
              label="Nova sala"
              :disable="!!salaSelecionada"
              @click="novaSala"
            />
          </q-card-section>

          <q-separator />

          <q-inner-loading :showing="carregandoSalas" />

          <q-table
            v-if="salas.length"
            flat
            :rows="salas"
            :columns="colunasSalas"
            row-key="id"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-accessibility="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.accessibility ? 'positive' : 'grey-6'"
                  :label="props.row.accessibility ? 'Sim' : 'Não'"
                />
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="editarSala(props.row)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="excluirSala(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>

          <q-card-section v-else-if="!carregandoSalas" class="text-grey-7 text-center">
            Nenhuma sala cadastrada para este cinema
          </q-card-section>

          <RoomForm
            v-if="salaSelecionada"
            :key="salaSelecionada.id ?? 'nova-sala'"
            :sala="salaSelecionada"
            :titulo="salaSelecionada.id ? 'Editar sala' : 'Nova sala'"
            @cancelar="cancelarSala"
            @salvar="salvarSala"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import CinemaForm from 'components/CinemaForm.vue'
import RoomForm from 'components/RoomForm.vue'
import { cinemaService } from 'src/services/cinemaService'
import { roomService } from 'src/services/roomService'

const cinemaVazio = () => ({
  id: null,
  name: '',
  address: '',
  phone: '',
  cnpj: '',
})

const salaVazia = () => ({
  id: null,
  rows: 1,
  columns: 1,
  projection_type: '',
  accessibility: false,
})

export default {
  name: 'CinemaPage',
  components: { CinemaForm, RoomForm },
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      cinemas: [],
      salas: [],
      cinemaSelecionado: cinemaVazio(),
      salaSelecionada: null,
      exibirFormulario: false,
      modoEdicao: false,
      carregando: false,
      carregandoSalas: false,
      colunasSalas: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'rows', label: 'Fileiras', field: 'rows', align: 'center' },
        { name: 'columns', label: 'Colunas', field: 'columns', align: 'center' },
        { name: 'projection_type', label: 'Projeção', field: 'projection_type', align: 'left' },
        { name: 'accessibility', label: 'Acessível', field: 'accessibility', align: 'center' },
        { name: 'seat_count', label: 'Assentos', field: 'seat_count', align: 'center' },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],
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
    async carregarSalas() {
      if (!this.cinemaSelecionado.id) {
        this.salas = []
        return
      }

      this.carregandoSalas = true
      try {
        this.salas = await roomService.listByCinema(this.cinemaSelecionado.id)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Erro ao carregar salas',
        })
      } finally {
        this.carregandoSalas = false
      }
    },
    novoCinema() {
      this.cinemaSelecionado = cinemaVazio()
      this.modoEdicao = false
      this.exibirFormulario = true
      this.salas = []
      this.salaSelecionada = null
    },
    selecionarCinema(cinema) {
      this.cinemaSelecionado = { ...cinema }
      this.modoEdicao = true
      this.exibirFormulario = true
      this.salaSelecionada = null
      this.carregarSalas()
    },
    cancelar() {
      this.exibirFormulario = false
      this.cinemaSelecionado = cinemaVazio()
      this.salas = []
      this.salaSelecionada = null
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
          const atualizado = await cinemaService.update(cinema.id, payload)
          this.cinemaSelecionado = { ...atualizado }
          this.$q.notify({ type: 'positive', message: 'Cinema atualizado com sucesso' })
        } else {
          const criado = await cinemaService.create(payload)
          this.cinemaSelecionado = { ...criado }
          this.modoEdicao = true
          this.$q.notify({ type: 'positive', message: 'Cinema cadastrado com sucesso' })
        }

        await this.carregarCinemas()
        await this.carregarSalas()
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
    novaSala() {
      this.salaSelecionada = salaVazia()
    },
    editarSala(sala) {
      this.salaSelecionada = { ...sala }
    },
    cancelarSala() {
      this.salaSelecionada = null
    },
    async salvarSala(sala) {
      const payload = {
        rows: sala.rows,
        columns: sala.columns,
        projection_type: sala.projection_type,
        accessibility: sala.accessibility,
        cinema: this.cinemaSelecionado.id,
      }

      try {
        if (sala.id) {
          await roomService.update(sala.id, payload)
          this.$q.notify({ type: 'positive', message: 'Sala atualizada com sucesso' })
        } else {
          await roomService.create(payload)
          this.$q.notify({ type: 'positive', message: 'Sala cadastrada com sucesso' })
        }

        this.salaSelecionada = null
        await this.carregarSalas()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Erro ao salvar sala',
        })
      }
    },
    excluirSala(id) {
      this.$q.dialog({
        title: 'Excluir sala',
        message: 'Deseja excluir esta sala e todos os seus assentos?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await roomService.remove(id)
          this.$q.notify({ type: 'positive', message: 'Sala excluída com sucesso' })

          if (this.salaSelecionada?.id === id) {
            this.salaSelecionada = null
          }

          await this.carregarSalas()
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Erro ao excluir sala',
          })
        }
      })
    },
  },
}
</script>
