<template>
  <q-card flat bordered class="filme-form q-ma-md">
    <q-card-section>
      <div class="text-h6 text-weight-medium">{{ titulo }}</div>
    </q-card-section>

    <q-separator />

    <q-form @validation-success="salvar">
      <q-card-section class="q-gutter-y-md">
        <div class="filme-id">
          <div class="filme-id__label">ID</div>
          <div class="filme-id__value">{{ filmeLocal.id }}</div>
        </div>

        <q-input
          v-model="filmeLocal.title"
          outlined
          dense
          lazy-rules
          label="Título"
          :rules="[(val) => val.length >= 2 || 'O título deve ter pelo menos 2 caracteres']"
        />

        <q-input
          v-model="filmeLocal.synopsis"
          outlined
          dense
          type="textarea"
          autogrow
          lazy-rules
          label="Sinopse"
          :rules="[(val) => val.length >= 10 || 'A sinopse deve ter pelo menos 10 caracteres']"
        />

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="filmeLocal.duration_minutes"
              outlined
              dense
              type="number"
              min="1"
              label="Duração (min)"
              :rules="[(val) => val >= 1 || 'Informe a duração']"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="filmeLocal.age_rating"
              outlined
              dense
              type="number"
              min="0"
              max="18"
              label="Classificação"
              :rules="[(val) => val >= 0 || 'Informe a classificação']"
            />
          </div>
        </div>
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
  name: 'FilmeForm',
  emits: ['cancelar', 'salvar'],
  props: {
    filme: Object,
    titulo: String,
  },
  data() {
    return {
      filmeLocal: { ...this.filme },
    }
  },
  methods: {
    cancelar() {
      this.$emit('cancelar')
    },
    salvar() {
      this.$emit('salvar', {
        ...this.filmeLocal,
        duration_minutes: Number(this.filmeLocal.duration_minutes),
        age_rating: Number(this.filmeLocal.age_rating),
      })
    },
  },
}
</script>

<style scoped>
.filme-form {
  border-radius: 12px;
  max-width: 520px;
}

.filme-id {
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.filme-id__label {
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 2px;
}

.filme-id__value {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}
</style>
