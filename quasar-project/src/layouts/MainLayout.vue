<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      dark
      side="left"
      behavior="desktop"
      :width="220"
      class="cinema-drawer"
    >                                       <!-- GAVETA E TITULO -->
      <div class="drawer-title">
        <router-link to="/">Cinema App</router-link>
      </div>

      <q-list dark class="drawer-nav">
        <template v-for="section in navSections" :key="section.title">
          <q-separator dark class="q-my-sm" />
          <q-item-label header class="drawer-section-title">{{ section.title }}</q-item-label>

          <q-item
            v-for="link in section.links"
            :key="link.to"
            clickable
            v-ripple
            :to="link.to"
            :active="isActive(link.to)"
            active-class="drawer-item--active"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>{{ link.label }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-header elevated class="bg-grey-2 text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const leftDrawerOpen = ref(true)

const navSections = [
  {
    title: 'Cadastros',
    links: [
      { label: 'Cinemas', to: '/cinemas', icon: 'location_city' },
      { label: 'Filmes', to: '/filmes', icon: 'movie' },
      { label: 'Gêneros', to: '/generos', icon: 'category' },
      { label: 'Clientes', to: '/clientes', icon: 'people' },
      { label: 'Funcionários', to: '/funcionarios', icon: 'badge' },
    ],
  },
  {
    title: 'Operação',
    links: [
      { label: 'Sessões', to: '/sessoes', icon: 'theaters' },
      { label: 'Pedidos', to: '/pedidos', icon: 'receipt_long' },
      { label: 'Ingressos', to: '/ingressos', icon: 'confirmation_number' },
      { label: 'Pagamentos', to: '/pagamentos', icon: 'payments' },
    ],
  },
]

function isActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style scoped>
:deep(.cinema-drawer.q-drawer) {
  background-color: #1a2332;
  color: #fff;
}

.drawer-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 12px;
}
 /* Router Link vira <a> */
.drawer-title a {  
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.drawer-nav {
  padding: 0px 8px 16px;
}

.drawer-section-title {
  color: rgba(255, 255, 255, 0.55);
}

:deep(.drawer-item--active) {
  background: rgba(255, 255, 255, 0.12);
}
</style>
