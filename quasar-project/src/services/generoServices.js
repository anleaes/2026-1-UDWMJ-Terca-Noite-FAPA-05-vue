import { API_URL } from '@/services/api.js'

function getAllGenerosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/generos`)
      .then((response) => {
        response
          .json()
          .then((data) => {
            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function getGenerosCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllGenerosFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function createGeneroFromRest(genero) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/generos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filme),
    })
      .then((response) => {
        response
          .json()
          .then((data) => {
            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function updateGeneroFromRest(id, genero) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/generos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filme),
    })
      .then((response) => {
        response
          .json()
          .then((data) => {
            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function deleteGeneroFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/generos/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export { 
  getAllGenerosFromRest, 
  getGenerosCountFromRest, 
  createGeneroFromRest, 
  updateGeneroFromRest, 
  deleteGeneroFromRest,
 }