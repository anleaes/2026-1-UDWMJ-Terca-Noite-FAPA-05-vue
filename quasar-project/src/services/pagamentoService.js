import { API_URL } from './api'
import { pagamentoStore } from 'src/stores/pagamento-store.js'

const BASE = `${API_URL}/payment/api/`

function getAllPagamentosFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && pagamentoStore.pagamentos.length > 0) {
      resolve(pagamentoStore.pagamentos)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar pagamentos'))
          return
        }

        response
          .json()
          .then((data) => {
            const pagamentos = Array.isArray(data) ? data : (data.results || [])
            pagamentoStore.pagamentos = pagamentos
            resolve(pagamentos)
          })
          .catch((error) => {
            console.error('Error fetching pagamentos:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching pagamentos:', error)
        reject(error)
      })
  })
}

function getPagamentoById(id) {
  return pagamentoStore.pagamentos.find((item) => item.id == id)
}

function createPagamento(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          const erro = await response.json().catch(() => ({}))
          const msg = Object.values(erro).flat().join(' ') || 'Erro ao cadastrar pagamento'
          reject(new Error(msg))
          return
        }

        response
          .json()
          .then((created) => {
            pagamentoStore.pagamentos = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating pagamento:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating pagamento:', error)
        reject(error)
      })
  })
}

function updatePagamento(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          const erro = await response.json().catch(() => ({}))
          const msg = Object.values(erro).flat().join(' ') || 'Erro ao atualizar pagamento'
          reject(new Error(msg))
          return
        }

        response
          .json()
          .then((updated) => {
            pagamentoStore.pagamentos = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating pagamento:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating pagamento:', error)
        reject(error)
      })
  })
}

function deletePagamento(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir pagamento'))
          return
        }

        pagamentoStore.pagamentos = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting pagamento:', error)
        reject(error)
      })
  })
}

export {
  getAllPagamentosFromRest,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
}
