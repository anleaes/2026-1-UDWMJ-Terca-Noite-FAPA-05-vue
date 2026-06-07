import { API_URL } from './api'
import { filmeStore } from 'src/stores/filme-store.js'

const BASE = `${API_URL}/movie/api/`

function getPosterUrl(poster) {
  if (!poster) {
    return null
  }

  if (poster.startsWith('http://') || poster.startsWith('https://')) {
    return poster
  }

  return `${API_URL}${poster.startsWith('/') ? poster : `/${poster}`}`
}

function buildMovieFormData(data) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('synopsis', data.synopsis)
  formData.append('duration_minutes', data.duration_minutes)
  formData.append('age_rating', data.age_rating)

  if (Array.isArray(data.genres)) {
    data.genres.forEach((genreId) => {
      formData.append('genres', genreId)
    })
  }

  if (data.poster instanceof File) {
    formData.append('poster', data.poster)
  }

  return formData
}

function getAllMoviesFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && filmeStore.movies.length > 0) {
      resolve(filmeStore.movies)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar filmes'))
          return
        }

        response
          .json()
          .then((data) => {
            const filmes = Array.isArray(data) ? data : (data.results || [])
            filmeStore.filmes = filmes
            resolve(filmes)
          })
          .catch((error) => {
            console.error('Error fetching filmes:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching filmes:', error)
        reject(error)
      })
  })
}

function getFilmeById(id) {
  return filmeStore.filmes.find((item) => item.id == id)
}

function createFilme(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar filme'))
          return
        }

        response
          .json()
          .then((created) => {
            filmeStore.filmes = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating filme:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating filme:', error)
        reject(error)
      })
  })
}

function updateFilme(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar filme'))
          return
        }

        response
          .json()
          .then((updated) => {
            filmeStore.filmes = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating filme:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating filme:', error)
        reject(error)
      })
  })
}

function deleteFilme(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir filme'))
          return
        }

        filmeStore.filmes = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting filme:', error)
        reject(error)
      })
  })
}

export {
  getAllFilmesFromRest,
  getFilmeById,
  createFilme,
  updateFilme,
  deleteFilme,
}
