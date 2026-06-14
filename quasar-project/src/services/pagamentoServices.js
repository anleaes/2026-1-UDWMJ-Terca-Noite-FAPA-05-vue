import { API_URL } from '@/services/api.js'

function getAllPagamentosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pagamentos`)
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

function getPagamentosCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllPagamentosFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function getPagamentosByPedidoFromRest(pedidoId) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pagamentos?pedido_id=${pedidoId}`)
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

function createPagamentoFromRest(pagamento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pagamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagamento),
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

function updatePagamentoFromRest(id, pagamento) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pagamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagamento),
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

function deletePagamentoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pagamentos/${id}`, {
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
  getAllPagamentosFromRest,
  getPagamentosCountFromRest,
  getPagamentosByPedidoFromRest,
  createPagamentoFromRest,
  updatePagamentoFromRest,
  deletePagamentoFromRest,
}
