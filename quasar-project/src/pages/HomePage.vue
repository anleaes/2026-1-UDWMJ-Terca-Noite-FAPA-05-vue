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
              <span class="text-h6"> Generos</span>
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
              <span class="text-h6"> Funcionarios</span>
              <p>Voce tem {{ funcionariosCount }} funcionarios</p>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-auto">
        <router-link to="/sessoes" class="home-card-link">
          <q-card class="home-card bg-primary text-white">
            <q-card-section>
              <q-icon name="theaters" size="32px" class="q-mb-sm" />
              <span class="text-h6"> Sessoes</span>
              <p>Voce tem {{ sessoesCount }} sessoes</p>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-auto">
        <router-link to="/pedidos" class="home-card-link">
          <q-card class="home-card bg-primary text-white">
            <q-card-section>
              <q-icon name="receipt_long" size="32px" class="q-mb-sm" />
              <span class="text-h6"> Pedidos</span>
              <p>Voce tem {{ pedidosCount }} pedidos</p>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-auto">
        <router-link to="/ingressos" class="home-card-link">
          <q-card class="home-card bg-primary text-white">
            <q-card-section>
              <q-icon name="confirmation_number" size="32px" class="q-mb-sm" />
              <span class="text-h6"> Ingressos</span>
              <p>Voce tem {{ ingressosCount }} ingressos</p>
            </q-card-section>
          </q-card>
        </router-link>
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
import { API_URL } from '@/services/api.js'

const filmesCount = ref('-')
const cinemasCount = ref('-')
const generosCount = ref('-')
const clientesCount = ref('-')
const funcionariosCount = ref('-')
const sessoesCount = ref('-')
const pedidosCount = ref('-')
const ingressosCount = ref('-')
const pagamentosCount = ref('-')

function buscarQuantidade(endpoint) {
  return fetch(`${API_URL}/${endpoint}`)
    .then((response) => response.json())
    .then((data) => data.length)
}

function carregarContagem(endpoint, contador) {
  buscarQuantidade(endpoint)
    .then((count) => {
      contador.value = count
    })
    .catch((err) => {
      console.log(`Erro ao carregar ${endpoint}:`, err)
      contador.value = '?'
    })
}

onMounted(() => {
  carregarContagem('filmes', filmesCount)
  carregarContagem('cinemas', cinemasCount)
  carregarContagem('generos', generosCount)
  carregarContagem('clientes', clientesCount)
  carregarContagem('funcionarios', funcionariosCount)
  carregarContagem('sessoes', sessoesCount)
  carregarContagem('pedidos', pedidosCount)
  carregarContagem('ingressos', ingressosCount)
  carregarContagem('pagamentos', pagamentosCount)
})
</script>

<style scoped>
.home-card {
  width: 220px;
}
</style>
