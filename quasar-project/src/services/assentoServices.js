import { API_URL } from '@/services/api.js'

function getAllAssentosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/assentos`)
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

function getAssentosBySalaFromRest(salaId) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/assentos?sala_id=${salaId}`)
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

function createAssentoFromRest(assento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/assentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assento),
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

function updateAssentoFromRest(id, assento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/assentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assento),
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

function deleteAssentoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/assentos/${id}`, {
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
  getAllAssentosFromRest,
  getAssentosBySalaFromRest,
  createAssentoFromRest,
  updateAssentoFromRest,
  deleteAssentoFromRest,
}
