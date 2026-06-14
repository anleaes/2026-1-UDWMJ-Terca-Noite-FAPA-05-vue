import { API_URL } from '@/services/api.js'

function getAllSalasFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/salas`)
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

function getSalasByCinemaFromRest(cinemaId) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/salas?cinema_id=${cinemaId}`)
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

function createSalaFromRest(sala) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/salas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sala),
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

function updateSalaFromRest(id, sala) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/salas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sala),
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

function deleteSalaFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/salas/${id}`, {
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
  getAllSalasFromRest,
  getSalasByCinemaFromRest,
  createSalaFromRest,
  updateSalaFromRest,
  deleteSalaFromRest,
}
