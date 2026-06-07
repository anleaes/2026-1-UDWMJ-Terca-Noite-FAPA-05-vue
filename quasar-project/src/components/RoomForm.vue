<template>
  <q-card flat bordered class="room-form q-mt-md">
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium">{{ titulo }}</div>
    </q-card-section>

    <q-separator />

    <q-form @validation-success="salvar">
      <q-card-section class="q-gutter-y-md">
        <div class="room-id">
          <div class="room-id__label">ID</div>
          <div class="room-id__value">{{ salaLocal.id }}</div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="salaLocal.rows"
              outlined
              dense
              type="number"
              min="1"
              label="Fileiras"
              :rules="[(val) => val >= 1 || 'Mínimo 1 fileira']"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="salaLocal.columns"
              outlined
              dense
              type="number"
              min="1"
              label="Colunas"
              :rules="[(val) => val >= 1 || 'Mínimo 1 coluna']"
            />
          </div>
        </div>

        <div class="text-caption text-grey-7">
          Capacidade prevista: <strong>{{ capacidadePrevista }}</strong> assentos
        </div>

        <q-input
          v-model="salaLocal.projection_type"
          outlined
          dense
          lazy-rules
          label="Tipo de projeção"
          :rules="[(val) => !!val || 'Informe o tipo de projeção']"
        />

        <q-toggle
          v-model="salaLocal.accessibility"
          label="Sala com acessibilidade"
          color="primary"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn flat label="Cancelar" @click="cancelar" />
        <q-btn unelevated label="Salvar sala" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
const salaVazia = () => ({
  id: null,
  rows: 1,
  columns: 1,
  projection_type: '',
  accessibility: false,
})

export default {
  name: 'RoomForm',
  emits: ['cancelar', 'salvar'],
  props: {
    sala: {
      type: Object,
      default: () => salaVazia(),
    },
    titulo: String,
  },
  data() {
    return {
      salaLocal: { ...this.sala },
    }
  },
  computed: {
    capacidadePrevista() {
      const rows = Number(this.salaLocal.rows) || 0
      const columns = Number(this.salaLocal.columns) || 0
      return rows * columns
    },
  },
  methods: {
    cancelar() {
      this.$emit('cancelar')
    },
    salvar() {
      this.$emit('salvar', {
        ...this.salaLocal,
        rows: Number(this.salaLocal.rows),
        columns: Number(this.salaLocal.columns),
      })
    },
  },
}
</script>

<style scoped>
.room-form {
  border-radius: 12px;
}

.room-id {
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.room-id__label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 2px;
}

.room-id__value {
  font-size: 14px;
  font-weight: 500;
}
</style>
