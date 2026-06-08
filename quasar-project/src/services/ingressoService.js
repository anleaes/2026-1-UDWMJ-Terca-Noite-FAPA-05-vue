import { API_URL } from './api'
import { ingressoStore } from 'src/stores/ingresso-store.js'

const BASE = `${API_URL}/ticket/api/`

function daApi(dados) {
  const {
    screening,
    screening_label,
    seat,
    seat_label,
    ...resto
  } = dados

  return {
    ...resto,
    sessao: screening,
    sessao_label: screening_label,
    assento: seat,
    assento_label: seat_label,
    pedido: resto.order,
  }
}

function paraApi(ingresso) {
  return {
    order: ingresso.pedido,
    screening: ingresso.sessao,
    seat: ingresso.assento,
  }
}

function getAllIngressosFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && ingressoStore.ingressos.length > 0) {
      resolve(ingressoStore.ingressos)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar ingressos'))
          return
        }

        response
          .json()
          .then((data) => {
            const lista = Array.isArray(data) ? data : (data.results || [])
            const ingressos = lista.map(daApi)
            ingressoStore.ingressos = ingressos
            resolve(ingressos)
          })
          .catch((error) => {
            console.error('Error fetching ingressos:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching ingressos:', error)
        reject(error)
      })
  })
}

function getIngressosByPedidoFromRest(pedidoId, forceReload = false) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}?order=${pedidoId}`)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar ingressos do pedido'))
          return
        }

        response
          .json()
          .then((data) => {
            const lista = Array.isArray(data) ? data : (data.results || [])
            const ingressos = lista.map(daApi)
            if (forceReload) {
              ingressoStore.ingressos = []
            }
            resolve(ingressos)
          })
          .catch((error) => {
            console.error('Error fetching ingressos by pedido:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching ingressos by pedido:', error)
        reject(error)
      })
  })
}

function getIngressosBySessaoFromRest(sessaoId) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}?screening=${sessaoId}`)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar ingressos da sessão'))
          return
        }

        response
          .json()
          .then((data) => {
            const lista = Array.isArray(data) ? data : (data.results || [])
            resolve(lista.map(daApi))
          })
          .catch((error) => {
            console.error('Error fetching ingressos by sessao:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching ingressos by sessao:', error)
        reject(error)
      })
  })
}

function getIngressoById(id) {
  return ingressoStore.ingressos.find((item) => item.id == id)
}

function createIngresso(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paraApi(data)),
    })
      .then(async (response) => {
        if (!response.ok) {
          const erro = await response.json().catch(() => ({}))
          const msg = Object.values(erro).flat().join(' ') || 'Erro ao cadastrar ingresso'
          reject(new Error(msg))
          return
        }

        response
          .json()
          .then((created) => {
            ingressoStore.ingressos = []
            resolve(daApi(created))
          })
          .catch((error) => {
            console.error('Error creating ingresso:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating ingresso:', error)
        reject(error)
      })
  })
}

function deleteIngresso(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir ingresso'))
          return
        }

        ingressoStore.ingressos = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting ingresso:', error)
        reject(error)
      })
  })
}

export {
  getAllIngressosFromRest,
  getIngressosByPedidoFromRest,
  getIngressosBySessaoFromRest,
  getIngressoById,
  createIngresso,
  deleteIngresso,
}
