import { API_URL } from '@/services/api.js'

function getAllSessoesFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/sessoes`)
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

function createSessaoFromRest(sessao) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/sessoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessao),
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

function updateSessaoFromRest(id, sessao) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/sessoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessao),
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

function deleteSessaoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/sessoes/${id}`, {
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
  getAllSessoesFromRest,
  createSessaoFromRest,
  updateSessaoFromRest,
  deleteSessaoFromRest,
}
