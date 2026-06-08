<template>
  <q-page class="q-pa-md cinema-home">
    <p class="cinema-home__welcome">
      Navegue pelas seções abaixo para gerenciar o cinema.
    </p>

    <div class="row q-col-gutter-md justify-center">
      <div
        v-for="section in sections"
        :key="section.title"
        class="col-12 col-sm-6 col-md-4"
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
              <div v-if="section.caption" class="text-caption">{{ section.caption }}</div>
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
    title: 'Pedidos',
    caption: 'Vendas e ingressos',
    icon: 'receipt_long',
    to: '/orders',
  },
  {
    title: 'Filmes',
    caption: 'Catálogo de filmes',
    icon: 'movie',
    to: '/filmes',
  },
  {
    title: 'Cinemas',
    caption: 'Unidades e salas',
    icon: 'store',
    to: '/cinemas',
  },
  {
    title: 'Sessões',
    caption: 'Programação',
    icon: 'theaters',
    to: '/sessoes',
  },
  {
    title: 'Gêneros',
    caption: 'Classificação',
    icon: 'movie_filter',
    to: '/generos',
  },
  {
    title: 'Cadastros',
    caption: 'Clientes e funcionários',
    icon: 'person_add',
    to: '/cadastros',
  },
  {
    title: 'Pagamentos',
    caption: 'Transações',
    icon: 'payment',
    to: '/pagamentos',
  },
  {
    title: 'Ingressos',
    caption: 'Tickets emitidos',
    icon: 'confirmation_number',
    to: '/ingressos',
  },
]
</script>
