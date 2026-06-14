import { API_URL } from '@/services/api.js'

function getAllFuncionariosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/funcionarios`)
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

function getFuncionariosCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllFuncionariosFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function createFuncionarioFromRest(funcionario) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/funcionarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(funcionario),
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

function updateFuncionarioFromRest(id, funcionario) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/funcionarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(funcionario),
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

function deleteFuncionarioFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/funcionarios/${id}`, {
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
  getAllFuncionariosFromRest,
  getFuncionariosCountFromRest,
  createFuncionarioFromRest,
  updateFuncionarioFromRest,
  deleteFuncionarioFromRest,
}
