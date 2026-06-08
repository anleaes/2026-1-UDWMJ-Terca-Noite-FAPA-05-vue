import { API_URL } from './api'
import { pedidoStore } from 'src/stores/pedido-store.js'

const BASE = `${API_URL}/order/api/`

function daApi(dados) {
  const { client, client_label, payment_status, payment, can_modify_tickets, ...resto } = dados
  return {
    ...resto,
    cliente: client,
    cliente_label: client_label,
    pagamento_status: payment_status,
    pagamento: payment,
    pode_modificar_ingressos: can_modify_tickets,
  }
}

function paraApi(pedido) {
  return {
    client: pedido.cliente,
    status: pedido.status,
    total_price: pedido.total_price,
  }
}

function getAllPedidosFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && pedidoStore.pedidos.length > 0) {
      resolve(pedidoStore.pedidos)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar pedidos'))
          return
        }

        response
          .json()
          .then((data) => {
            const lista = Array.isArray(data) ? data : (data.results || [])
            const pedidos = lista.map(daApi)
            pedidoStore.pedidos = pedidos
            resolve(pedidos)
          })
          .catch((error) => {
            console.error('Error fetching pedidos:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching pedidos:', error)
        reject(error)
      })
  })
}

function getPedidoById(id) {
  return pedidoStore.pedidos.find((item) => item.id == id)
}

function getPedidoFromRest(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar pedido'))
          return
        }

        response
          .json()
          .then((data) => {
            resolve(daApi(data))
          })
          .catch((error) => {
            console.error('Error fetching pedido:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching pedido:', error)
        reject(error)
      })
  })
}

function createPedido(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paraApi(data)),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar pedido'))
          return
        }

        response
          .json()
          .then((created) => {
            pedidoStore.pedidos = []
            resolve(daApi(created))
          })
          .catch((error) => {
            console.error('Error creating pedido:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating pedido:', error)
        reject(error)
      })
  })
}

function updatePedido(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paraApi(data)),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar pedido'))
          return
        }

        response
          .json()
          .then((updated) => {
            pedidoStore.pedidos = []
            resolve(daApi(updated))
          })
          .catch((error) => {
            console.error('Error updating pedido:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating pedido:', error)
        reject(error)
      })
  })
}

function deletePedido(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir pedido'))
          return
        }

        pedidoStore.pedidos = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting pedido:', error)
        reject(error)
      })
  })
}

export {
  getAllPedidosFromRest,
  getPedidoById,
  getPedidoFromRest,
  createPedido,
  updatePedido,
  deletePedido,
}
