const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/HomePage.vue') },
      { path: 'filmes', component: () => import('@/pages/FilmesPage.vue') },
      { path: 'cinemas', component: () => import('@/pages/CinemasPage.vue') },
      { path: 'sessoes', component: () => import('@/pages/SessoesPage.vue') },
      { path: 'generos', component: () => import('@/pages/GenerosPage.vue') },
      { path: 'clientes', component: () => import('@/pages/ClientesPage.vue') },
      { path: 'funcionarios', component: () => import('@/pages/FuncionariosPage.vue') },
      { path: 'ingressos', component: () => import('@/pages/IngressosPage.vue') },
      { path: 'pedidos', component: () => import('@/pages/PedidosPage.vue') },
      { path: 'pagamentos', component: () => import('@/pages/PagamentosPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
