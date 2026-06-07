<template>
  <q-page class="q-pa-md">
    <q-btn
      flat
      icon="arrow_back"
      label="Voltar"
      to="/"
      class="q-mb-md"
    />

    <div class="text-center q-mb-xl q-pt-lg">
      <q-icon name="app_registration" size="4rem" color="primary" />
      <h1 class="text-h3 text-weight-bold q-mt-md">Cadastros</h1>
      <p class="text-grey-7">Escolha o tipo de cadastro</p>
    </div>

    <div class="row q-col-gutter-md justify-center">
      <div
        v-for="section in sections"
        :key="section.title"
        class="col-12 col-sm-6"
        style="max-width: 320px"
      >
        <q-card
          flat
          bordered
          class="home-card cursor-pointer"
          @click="$router.push(section.to)"
        >
          <q-card-section class="row items-center no-wrap">
            <q-icon :name="section.icon" size="2.5rem" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6">{{ section.title }}</div>
              <div class="text-caption text-grey-7">{{ section.caption }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const sections = [
  {
    title: 'Funcionário',
    icon: 'badge',
    caption: 'Cadastro de funcionários',
    to: '/cadastros/funcionario',
  },
  {
    title: 'Cliente',
    icon: 'person',
    caption: 'Cadastro de clientes',
    to: '/cadastros/cliente',
  },
]
</script>

<style scoped>
.home-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.home-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
</style>