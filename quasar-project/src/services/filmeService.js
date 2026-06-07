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
            const movies = Array.isArray(data) ? data : (data.results || [])
            filmeStore.movies = movies
            resolve(movies)
          })
          .catch((error) => {
            console.error('Error fetching movies:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching movies:', error)
        reject(error)
      })
  })
}

function getMovieById(id) {
  const movie = filmeStore.movies.find((item) => item.id == id)
  return movie
}

function createMovie(data) {
  const hasPoster = data.poster instanceof File

  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: hasPoster ? undefined : { 'Content-Type': 'application/json' },
      body: hasPoster ? buildMovieFormData(data) : JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar filme'))
          return
        }

        response
          .json()
          .then((created) => {
            filmeStore.movies = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating movie:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating movie:', error)
        reject(error)
      })
  })
}

function updateMovie(id, data) {
  const hasPoster = data.poster instanceof File
  const jsonData = { ...data }
  delete jsonData.poster

  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: hasPoster ? 'PATCH' : 'PUT',
      headers: hasPoster ? undefined : { 'Content-Type': 'application/json' },
      body: hasPoster ? buildMovieFormData(data) : JSON.stringify(jsonData),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar filme'))
          return
        }

        response
          .json()
          .then((updated) => {
            filmeStore.movies = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating movie:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating movie:', error)
        reject(error)
      })
  })
}

function deleteMovie(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir filme'))
          return
        }

        filmeStore.movies = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting movie:', error)
        reject(error)
      })
  })
}

function getAllGenresFromRest() {
  return fetch(`${API_URL}/genre/api/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao buscar gêneros')
      }
      return response.json()
    })
    .then((data) => (Array.isArray(data) ? data : (data.results || [])))
}

export {
  getAllMoviesFromRest,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllGenresFromRest,
  getPosterUrl,
}
