import { API_URL } from '@/services/api.js'

function getAllPedidosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pedidos`)
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

function getPedidosCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllPedidosFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function createPedidoFromRest(pedido) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
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

function updatePedidoFromRest(id, pedido) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
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

function deletePedidoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pedidos/${id}`, {
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
  getAllPedidosFromRest,
  getPedidosCountFromRest,
  createPedidoFromRest,
  updatePedidoFromRest,
  deletePedidoFromRest,
}
