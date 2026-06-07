<template>
  <q-card flat bordered class="sessao-form q-ma-md">
    <q-card-section>
      <div class="text-h6 text-weight-medium">{{ titulo }}</div>
    </q-card-section>

    <q-separator />

    <q-form @validation-success="salvar">
      <q-card-section class="q-gutter-y-md">
        <div class="sessao-id">
          <div class="sessao-id__label">ID</div>
          <div class="sessao-id__value">{{ sessaoLocal.id }}</div>
        </div>

        <q-select
          v-model="sessaoLocal.filme"
          outlined
          dense
          emit-value
          map-options
          label="Filme"
          :options="filmesOpcoes"
          :rules="[(val) => !!val || 'Selecione o filme']"
        />

        <q-select
          v-model="sessaoLocal.sala"
          outlined
          dense
          emit-value
          map-options
          label="Sala"
          :options="salasOpcoes"
          :rules="[(val) => !!val || 'Selecione a sala']"
        />

        <q-input
          v-model="sessaoLocal.start_time"
          outlined
          dense
          type="datetime-local"
          label="Data e hora"
          :rules="[(val) => !!val || 'Informe data e hora']"
        />

        <q-input
          v-model.number="sessaoLocal.price"
          outlined
          dense
          type="number"
          min="0"
          step="0.01"
          label="Preço (R$)"
          :rules="[(val) => val >= 0 || 'Informe um preço válido']"
        />

        <q-toggle
          v-model="sessaoLocal.dubbed"
          label="Dublado"
          color="primary"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn flat label="Cancelar" @click="cancelar" />
        <q-btn unelevated label="Salvar sessão" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
export default {
  name: 'SessaoForm',
  emits: ['cancelar', 'salvar'],
  props: {
    sessao: Object,
    titulo: String,
    filmes: {
      type: Array,
      default: () => [],
    },
    salas: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      sessaoLocal: {
        ...this.sessao,
        start_time: this.formatarParaInput(this.sessao.start_time),
      },
    }
  },
  computed: {
    filmesOpcoes() {
      return this.filmes.map((filme) => ({
        label: filme.title,
        value: filme.id,
      }))
    },
    salasOpcoes() {
      return this.salas.map((sala) => ({
        label: `${sala.cinema_name} — Sala ${sala.id}`,
        value: sala.id,
      }))
    },
  },
  methods: {
    formatarParaInput(valor) {
      if (!valor) return ''
      return valor.slice(0, 16)
    },
    cancelar() {
      this.$emit('cancelar')
    },
    salvar() {
      this.$emit('salvar', {
        ...this.sessaoLocal,
        price: Number(this.sessaoLocal.price),
      })
    },
  },
}
</script>

<style scoped>
.sessao-form {
  border-radius: 12px;
  max-width: 520px;
}

.sessao-id {
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.sessao-id__label {
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 2px;
}

.sessao-id__value {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}
</style>
