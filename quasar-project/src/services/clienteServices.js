import { API_URL } from '@/services/api.js'

function getAllClientesFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/clientes`)
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

function createClienteFromRest(cliente) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
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

function updateClienteFromRest(id, cliente) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
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

function deleteClienteFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/clientes/${id}`, {
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
    getAllClientesFromRest, 
    createClienteFromRest, 
    updateClienteFromRest, 
    deleteClienteFromRest,
 }
