import { API_URL } from '@/services/api.js'

function getAllCinemasFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/cinemas`)
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

function getCinemasCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllCinemasFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function createCinemaFromRest(cinema) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/cinemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cinema),
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

function updateCinemaFromRest(id, cinema) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/cinemas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cinema),
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

function deleteCinemaFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/cinemas/${id}`, {
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
  getAllCinemasFromRest,
  getCinemasCountFromRest,
  createCinemaFromRest,
  updateCinemaFromRest,
  deleteCinemaFromRest,
}
