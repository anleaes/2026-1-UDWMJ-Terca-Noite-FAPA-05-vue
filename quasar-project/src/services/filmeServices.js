import { API_URL } from '@/services/api.js'

function getAllFilmesFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/filmes`)
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

function createFilmeFromRest(filme) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/filmes`, {
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

function updateFilmeFromRest(id, filme) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/filmes/${id}`, {
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

function deleteFilmeFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/filmes/${id}`, {
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
  getAllFilmesFromRest, 
  createFilmeFromRest, 
  updateFilmeFromRest, 
  deleteFilmeFromRest,
 }
