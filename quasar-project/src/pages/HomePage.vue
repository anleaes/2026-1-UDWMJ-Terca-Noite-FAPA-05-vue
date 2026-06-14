<template>
  <q-page class="q-pa-lg">

    <div class="row q-col-gutter-md">
      <div class="col-auto">
        <router-link to="/cinemas" class="home-card-link">
          <q-card class="home-card bg-primary text-white">
            <q-card-section>
              <q-icon name="location_city" size="32px" class="q-mb-sm" />
              <span class="text-h6"> Cinemas</span>
              <p>Voce tem {{ cinemasCount }} cinemas</p>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

    <div class="col-auto">
      <router-link to="/filmes" class="home-card-link">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="movie" size="32px" class="q-mb-sm" />
            <span class="text-h6"> Filmes</span>
            <p>Voce tem {{ filmesCount }} filmes</p>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

    <div class="col-auto">
      <router-link to="/generos" class="home-card-link">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="category" size="32px" class="q-mb-sm" />
            <span class="text-h6"> Gêneros</span>
            <p>Voce tem {{ generosCount }} generos</p>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

    <div class="col-auto">
      <router-link to="/clientes" class="home-card-link">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="people" size="32px" class="q-mb-sm" />
            <span class="text-h6"> Clientes</span>
            <p>Voce tem {{ clientesCount }} clientes</p>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

    <div class="col-auto">
      <router-link to="/funcionarios" class="home-card-link">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="badge" size="32px" class="q-mb-sm" />
            <span class="text-h6"> Funcionários</span>
            <p>Voce tem {{ funcionariosCount }} funcionarios</p>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

    <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="theaters" size="32px" class="q-mb-sm" />
          <span class="text-h6"> Sessões</span>
          <p>Voce tem {{ sesoesCount }} sessões</p>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="receipt_long" size="32px" class="q-mb-sm" />
          <span class="text-h6"> Pedidos</span>
          <p>Voce tem {{ pedidosCount }} pedidos</p>
        </q-card-section>
      </q-card>
    </div>

        <div class="col-auto">
      <q-card class="home-card bg-primary text-white">
        <q-card-section>
          <q-icon name="confirmation_number" size="32px" class="q-mb-sm" />
          <span class="text-h6"> Ingressos</span>
          <p>Voce tem {{ ingressosCount }} ingressos</p>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-auto">
      <router-link to="/pagamentos" class="home-card-link">
        <q-card class="home-card bg-primary text-white">
          <q-card-section>
            <q-icon name="payments" size="32px" class="q-mb-sm" />
            <span class="text-h6"> Pagamentos</span>
            <p>Voce tem {{ pagamentosCount }} pagamentos</p>
          </q-card-section>
        </q-card>
      </router-link>
    </div>

  </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const filmesCount = ref('-')
const cinemasCount = ref('-')
const generosCount = ref('-')
const clientesCount = ref('-')
const funcionariosCount = ref('-')
const pedidosCount = ref('-')
const pagamentosCount = ref('-')

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

  buscarQuantidade('http://localhost:3000/funcionarios')
    .then((count) => {
      funcionariosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar funcionarios:', err)
      funcionariosCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/pagamentos')
    .then((count) => {
      pagamentosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar pagamentos:', err)
      pagamentosCount.value = '?'
    })
/*
  buscarQuantidade('http://localhost:3000/generos')
    .then((count) => {
      generosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar generos:', err)
      generosCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/clientes')
    .then((count) => {
      clientesCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar clientes:', err)
      clientesCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/funcionarios')
    .then((count) => {
      funcionariosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar funcionarios:', err)
      funcionariosCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/sessoes')
    .then((count) => {
      sessoesCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar sessoes:', err)
      sessoesCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/pedidos')
    .then((count) => {
      pedidosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar pedidos:', err)
      pedidosCount.value = '?'
    })

  buscarQuantidade('http://localhost:3000/ingressos')
    .then((count) => {
      ingressosCount.value = count
    })
    .catch((err) => {
      console.log('Erro ao carregar ingressos:', err)
      ingressosCount.value = '?'
    })
    */
})
</script>

<style scoped>
.home-card {
  width: 220px;
}
</style>
