<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-xl q-pt-lg">
      <q-icon name="local_movies" size="4rem" color="primary" />
      <h1 class="text-h3 text-weight-bold q-mt-md">Cinema App</h1>
    </div>

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
    title: 'Pedidos',
    icon: '',
    to: '/orders',
  },
  {
    title: 'Filmes',
    icon: 'movie',
    to: '/movies',
  },
  {
    title: 'Cinemas',
    icon: 'store',
    to: '/cinemas',
  },
  {
    title: 'Sessões',
    icon: 'theaters',
    to: '/screenings',
  },
  {
    title: 'Gêneros',
    icon: '',
    to: '/',
  },
  {
    title: 'Clientes',
    icon: 'client',
    to: '/',
  },
  {
    title: 'Funcionários',
    icon: '',
    to: '/',
  },
  {
    title: 'Pagamentos',
    icon: '',
    to: '/',
  },
  {
    title: 'Ingressos',
    icon: '',
    to: '/',
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

