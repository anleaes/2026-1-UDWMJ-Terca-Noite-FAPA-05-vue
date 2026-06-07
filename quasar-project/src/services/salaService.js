import { API_URL } from './api'
import { salaStore } from 'src/stores/sala-store.js'

const BASE = `${API_URL}/room/api/`

function limparCacheSalas() {
  salaStore.salas = []
  salaStore.salasByCinema = {}
}

function getAllSalasFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && salaStore.salas.length > 0) {
      resolve(salaStore.salas)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar salas'))
          return
        }

        response
          .json()
          .then((data) => {
            const salas = Array.isArray(data) ? data : (data.results || [])
            salaStore.salas = salas
            resolve(salas)
          })
          .catch((error) => {
            console.error('Error fetching salas:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching salas:', error)
        reject(error)
      })
  })
}

function getSalasByCinemaFromRest(cinemaId, forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && salaStore.salasByCinema[cinemaId]?.length > 0) {
      resolve(salaStore.salasByCinema[cinemaId])
      return
    }

    fetch(`${BASE}?cinema=${cinemaId}`)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar salas do cinema'))
          return
        }

        response
          .json()
          .then((data) => {
            const salas = Array.isArray(data) ? data : (data.results || [])
            salaStore.salasByCinema[cinemaId] = salas
            resolve(salas)
          })
          .catch((error) => {
            console.error('Error fetching salas by cinema:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching salas by cinema:', error)
        reject(error)
      })
  })
}

function getSalaById(id) {
  const salaNaLista = salaStore.salas.find((item) => item.id == id)
  if (salaNaLista) return salaNaLista

  for (const salas of Object.values(salaStore.salasByCinema)) {
    const sala = salas.find((item) => item.id == id)
    if (sala) return sala
  }

  return undefined
}

function createSala(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar sala'))
          return
        }

        response
          .json()
          .then((created) => {
            limparCacheSalas()
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating sala:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating sala:', error)
        reject(error)
      })
  })
}

function updateSala(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar sala'))
          return
        }

        response
          .json()
          .then((updated) => {
            limparCacheSalas()
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating sala:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating sala:', error)
        reject(error)
      })
  })
}

function deleteSala(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir sala'))
          return
        }

        limparCacheSalas()
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting sala:', error)
        reject(error)
      })
  })
}

export {
  getAllSalasFromRest,
  getSalasByCinemaFromRest,
  getSalaById,
  createSala,
  updateSala,
  deleteSala,
}
