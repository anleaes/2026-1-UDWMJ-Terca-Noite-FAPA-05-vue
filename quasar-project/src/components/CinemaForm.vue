<template>
  <q-card flat bordered class="cinema-form q-ma-md">
    <q-card-section>
      <div class="text-h6 text-weight-medium">{{ titulo }}</div>
    </q-card-section>

    <q-separator />

    <q-form @validation-success="salvar">
      <q-card-section class="q-gutter-y-md">
        <div class="cinema-id">
          <div class="cinema-id__label">ID</div>
          <div class="cinema-id__value">
            {{ cinemaLocal.id }}
          </div>
        </div>

        <q-input
          v-model="cinemaLocal.name"
          outlined
          dense
          lazy-rules
          label="Nome"
          :rules="[(val) => val.length >= 3 || 'O nome tem que ter pelo menos 3 caracteres']"
        />
        <q-input
          v-model="cinemaLocal.address"
          outlined
          dense
          lazy-rules
          label="Endereço"
          :rules="[(val) => val.length >= 3 || 'O endereço tem que ter pelo menos 3 caracteres']"
        />
        <q-input
          v-model="cinemaLocal.phone"
          outlined
          dense
          lazy-rules
          label="Telefone"
          :rules="[(val) => !!val || 'Informe o telefone']"
        />
        <q-input
          v-model="cinemaLocal.cnpj"
          outlined
          dense
          lazy-rules
          label="CNPJ"
          :rules="[(val) => !!val || 'Informe o CNPJ']"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn flat label="Cancelar" @click="cancelar" />
        <q-btn unelevated label="Salvar" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
export default {
  name: 'CinemaForm',
  emits: ['cancelar', 'salvar'],
  props: {
    cinema: Object,
    titulo: String,
  },
  data() {
    return {
      cinemaLocal: { ...this.cinema },
    }
  },
  methods: {
    cancelar() {
      this.$emit('cancelar')
    },
    salvar() {
      this.$emit('salvar', this.cinemaLocal)
    },
  },
}
</script>

<style scoped>
.cinema-form {
  border-radius: 12px;
  max-width: 520px;
}

.cinema-id {
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.cinema-id__label {
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 2px;
}

.cinema-id__value {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}
</style>
