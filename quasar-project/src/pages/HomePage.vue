<template>
  <q-page class="q-pa-lg">

    <div class="row q-col-gutter-md">
      <div class="col-auto">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="location_city" size="32px" class="q-mb-sm" />
            <span class="text-h6">Cinemas</span>
            <p>Voce tem {{ cinemasCount }} cinemas</p>
          </q-card-section>
        </q-card>
      </div>

    <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="movie" size="32px" class="q-mb-sm" />
          <span class="text-h6">Filmes</span>
          <p>Voce tem {{ filmesCount }} filmes</p>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="people" size="32px" class="q-mb-sm" />
          <span class="text-h6">Clientes</span>
          <p>Voce tem {{ clientesCount }} clientes</p>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="receipt_long" size="32px" class="q-mb-sm" />
          <span class="text-h6">Pedidos</span>
          <p>Voce tem {{ pedidosCount }} pedidos</p>
        </q-card-section>
      </q-card>
    </div>
  </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const filmesCount = ref('-')
const cinemasCount = ref('-')
const clientesCount = ref('-')
const pedidosCount = ref('-')

function buscarQuantidade(url) {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => data.length)
}

onMounted(() => {
  buscarQuantidade('http://localhost:3000/filmes')
    .then((count) => {
      filmesCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar filmes:', err)
      filmesCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/cinemas')
    .then((count) => {
      cinemasCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar cinemas:', err)
      cinemasCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/clientes')
    .then((count) => {
      clientesCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar clientes:', err)
      clientesCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/pedidos')
    .then((count) => {
      pedidosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar pedidos:', err)
      pedidosCount.value = '?'
    })
})
</script>

<style scoped>
.home-card {
  width: 220px;
}
</style>
