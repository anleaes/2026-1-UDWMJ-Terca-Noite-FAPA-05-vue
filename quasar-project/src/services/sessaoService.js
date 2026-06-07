import { API_URL } from './api'
import { sessaoStore } from 'src/stores/sessao-store.js'

const BASE = `${API_URL}/screening/api/`

function paraApi(sessao) {
  return {
    start_time: sessao.start_time,
    price: sessao.price,
    dubbed: sessao.dubbed,
    room: sessao.sala,
    movie: sessao.filme,
  }
}

function daApi(dados) {
  const { room, movie, movie_title, ...resto } = dados
  return {
    ...resto,
    sala: room,
    filme: movie,
    filme_titulo: movie_title,
  }
}

function getAllSessoesFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && sessaoStore.sessoes.length > 0) {
      resolve(sessaoStore.sessoes)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar sessões'))
          return
        }

        response
          .json()
          .then((data) => {
            const lista = Array.isArray(data) ? data : (data.results || [])
            const sessoes = lista.map(daApi)
            sessaoStore.sessoes = sessoes
            resolve(sessoes)
          })
          .catch((error) => {
            console.error('Error fetching sessoes:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching sessoes:', error)
        reject(error)
      })
  })
}

function getSessaoById(id) {
  return sessaoStore.sessoes.find((item) => item.id == id)
}

function createSessao(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paraApi(data)),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar sessão'))
          return
        }

        response
          .json()
          .then((created) => {
            sessaoStore.sessoes = []
            resolve(daApi(created))
          })
          .catch((error) => {
            console.error('Error creating sessao:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating sessao:', error)
        reject(error)
      })
  })
}

function updateSessao(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paraApi(data)),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar sessão'))
          return
        }

        response
          .json()
          .then((updated) => {
            sessaoStore.sessoes = []
            resolve(daApi(updated))
          })
          .catch((error) => {
            console.error('Error updating sessao:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating sessao:', error)
        reject(error)
      })
  })
}

function deleteSessao(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir sessão'))
          return
        }

        sessaoStore.sessoes = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting sessao:', error)
        reject(error)
      })
  })
}

export {
  getAllSessoesFromRest,
  getSessaoById,
  createSessao,
  updateSessao,
  deleteSessao,
}
