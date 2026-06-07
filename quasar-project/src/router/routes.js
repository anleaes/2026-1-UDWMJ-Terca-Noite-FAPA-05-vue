const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
      { path: 'cinemas', component: () => import('pages/CinemaPage.vue')},
      { path: 'movies', component: () => import('pages/FilmesPage.vue') },
      { path: 'ingressos', component: () => import('pages/IngressoPage.vue') },
      { path: 'cadastros', component: () => import('pages/CadastrosPage.vue') },
      { path: 'cadastros/funcionario', component: () => import('pages/FuncionarioPage.vue') },
      { path: 'cadastros/cliente', component: () => import('pages/ClientePage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
