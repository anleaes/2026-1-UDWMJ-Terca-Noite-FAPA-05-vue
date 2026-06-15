import { API_URL } from '@/services/api.js'

function getAllIngressosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/ingressos`)
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

function getIngressosBySessaoFromRest(sessaoId) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/ingressos?sessao_id=${sessaoId}`)
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

function getIngressosByPedidoFromRest(pedidoId) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/ingressos?pedido_id=${pedidoId}`)
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

function createIngressoFromRest(ingresso) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/ingressos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingresso),
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

function deleteIngressoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/ingressos/${id}`, {
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
  getAllIngressosFromRest,
  getIngressosBySessaoFromRest,
  getIngressosByPedidoFromRest,
  createIngressoFromRest,
  deleteIngressoFromRest,
}
