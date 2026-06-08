<template>
  <q-layout view="hHh lpR fFf" class="cinema-layout">
    <q-header class="cinema-header" elevated>
      <div class="cinema-header__top">
        <q-btn
          class="cinema-header__menu lt-md"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = true"
        />

        <router-link to="/" class="cinema-title">Cinema App</router-link>

        <div class="cinema-header__spacer lt-md" />
      </div>

      <nav class="cinema-nav gt-sm" aria-label="Navegação principal">
        <div class="cinema-nav__groups">
          <div
            v-for="section in navSections"
            :key="section.title"
            class="cinema-nav__section"
          >
            <span class="cinema-nav__section-title">{{ section.title }}</span>
            <div class="cinema-nav__links">
              <router-link
                v-for="link in section.links"
                :key="link.to"
                :to="link.to"
                class="cinema-nav-btn"
                :class="{ 'cinema-nav-btn--active': isActive(link.to) }"
              >
                {{ link.label }}
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="cinema-drawer lt-md"
      :width="300"
    >
      <q-scroll-area class="fit">
        <div class="cinema-drawer__content">
          <div class="cinema-drawer__brand">Cinema App</div>

          <div
            v-for="section in navSections"
            :key="section.title"
            class="cinema-drawer__section"
          >
            <div class="cinema-drawer__section-title">{{ section.title }}</div>
            <router-link
              v-for="link in section.links"
              :key="link.to"
              :to="link.to"
              class="cinema-drawer__link"
              :class="{ 'cinema-drawer__link--active': isActive(link.to) }"
              @click="leftDrawerOpen = false"
            >
              <q-icon :name="link.icon" size="20px" />
              <span>{{ link.label }}</span>
            </router-link>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="cinema-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const leftDrawerOpen = ref(false)

const navSections = [
  {
    title: 'Navegação',
    links: [
      { label: 'Home', to: '/', icon: 'home' },
      { label: 'Sessões', to: '/sessoes', icon: 'theaters' },
      { label: 'Cinemas', to: '/cinemas', icon: 'store' },
      { label: 'Filmes', to: '/filmes', icon: 'movie' },
      { label: 'Gêneros', to: '/generos', icon: 'movie_filter' },
    ],
  },
  {
    title: 'Vendas',
    links: [
      { label: 'Pedidos', to: '/pedidos', icon: 'receipt_long' },
      { label: 'Ingressos', to: '/ingressos', icon: 'confirmation_number' },
      { label: 'Pagamentos', to: '/pagamentos', icon: 'payment' },
    ],
  },
  {
    title: 'Gestão',
    links: [
      { label: 'Clientes', to: '/cadastros/cliente', icon: 'person' },
      { label: 'Funcionários', to: '/cadastros/funcionario', icon: 'badge' },
    ],
  },
]

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>
