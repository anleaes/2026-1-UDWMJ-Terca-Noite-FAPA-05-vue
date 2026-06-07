import { API_URL } from './api'
import { generoStore } from 'src/stores/genero-store.js'

const BASE = `${API_URL}/genre/api/`

function getAllGenresFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && generoStore.genres.length > 0) {
      resolve(generoStore.genres)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar gêneros'))
          return
        }

        response
          .json()
          .then((data) => {
            const genres = Array.isArray(data) ? data : (data.results || [])
            console.log(genres)
            generoStore.genres = genres
            resolve(genres)
          })
          .catch((error) => {
            console.error('Error fetching genres:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching genres:', error)
        reject(error)
      })
  })
}

function getGenreById(id) {
  console.log('getGenreById', id)
  console.log(generoStore.genres.length)
  const genre = generoStore.genres.find((item) => item.id == id)
  return genre
}

function createGenre(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar gênero'))
          return
        }

        response
          .json()
          .then((created) => {
            generoStore.genres = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating genre:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating genre:', error)
        reject(error)
      })
  })
}

function updateGenre(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar gênero'))
          return
        }

        response
          .json()
          .then((updated) => {
            generoStore.genres = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating genre:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating genre:', error)
        reject(error)
      })
  })
}

function deleteGenre(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir gênero'))
          return
        }

        generoStore.genres = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting genre:', error)
        reject(error)
      })
  })
}

export {
  getAllGenresFromRest,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
}
