import { API_URL } from './api'
import { pagamentoStore } from 'src/stores/pagamento-store.js'

const BASE = `${API_URL}/payment/api/`

function getAllPaymentsFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && pagamentoStore.payments.length > 0) {
      resolve(pagamentoStore.payments)
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
            const payments = Array.isArray(data) ? data : (data.results || [])
            pagamentoStore.payments = payments
            resolve(payments)
          })
          .catch((error) => {
            console.error('Error fetching payments:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching payments:', error)
        reject(error)
      })
  })
}

function updatePayment(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar pagamento'))
          return
        }

        response
          .json()
          .then((updated) => {
            pagamentoStore.payments = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating payment:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating payment:', error)
        reject(error)
      })
  })
}

function deletePayment(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir pagamento'))
          return
        }

        pagamentoStore.payments = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting payment:', error)
        reject(error)
      })
  })
}

export {
  getAllPaymentsFromRest,
  updatePayment,
  deletePayment,
}
