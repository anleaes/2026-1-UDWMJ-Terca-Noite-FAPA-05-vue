import { API_URL } from './api'
import { cinemaStore } from 'src/stores/cinema-store.js'

const BASE = `${API_URL}/cinema/api/`

function getAllCinemasFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && cinemaStore.cinemas.length > 0) {
      resolve(cinemaStore.cinemas)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar cinemas'))
          return
        }

        response
          .json()
          .then((data) => {
            const cinemas = Array.isArray(data) ? data : (data.results || [])
            cinemaStore.cinemas = cinemas
            resolve(cinemas)
          })
          .catch((error) => {
            console.error('Error fetching cinemas:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching cinemas:', error)
        reject(error)
      })
  })
}

function getCinemaById(id) {
  return cinemaStore.cinemas.find((item) => item.id == id)
}

function createCinema(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar cinema'))
          return
        }

        response
          .json()
          .then((created) => {
            cinemaStore.cinemas = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating cinema:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating cinema:', error)
        reject(error)
      })
  })
}

function updateCinema(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar cinema'))
          return
        }

        response
          .json()
          .then((updated) => {
            cinemaStore.cinemas = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating cinema:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating cinema:', error)
        reject(error)
      })
  })
}

function deleteCinema(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir cinema'))
          return
        }

        cinemaStore.cinemas = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting cinema:', error)
        reject(error)
      })
  })
}

export {
  getAllCinemasFromRest,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
}
