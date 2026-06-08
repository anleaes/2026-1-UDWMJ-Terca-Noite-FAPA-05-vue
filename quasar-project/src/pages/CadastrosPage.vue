<template>
  <q-page class="q-pa-md cinema-home">
    <q-btn flat icon="arrow_back" label="Voltar" to="/" class="q-mb-md" />

    <div class="text-center q-mb-xl q-pt-md">
      <q-icon name="app_registration" size="4rem" class="text-primary" />
      <h1 class="text-h3 text-weight-bold q-mt-md cinema-title cinema-title--page">Cadastros</h1>
      <p class="cinema-home__welcome">Escolha o tipo de cadastro</p>
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
          class="cinema-home-card cursor-pointer"
          @click="$router.push(section.to)"
        >
          <q-card-section class="row items-center no-wrap">
            <q-icon :name="section.icon" size="2.5rem" class="q-mr-md" />
            <div class="text-left">
              <div class="text-h6">{{ section.title }}</div>
              <div class="text-caption">{{ section.caption }}</div>
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
