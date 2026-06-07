import { API_URL } from './api'
import { clienteStore } from 'src/stores/cliente-store.js'

const BASE = `${API_URL}/client/api/`

function getAllClientsFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && clienteStore.clients.length > 0) {
      resolve(clienteStore.clients)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar clientes'))
          return
        }

        response
          .json()
          .then((data) => {
            const clients = Array.isArray(data) ? data : (data.results || [])
            console.log(clients)
            clienteStore.clients = clients
            resolve(clients)
          })
          .catch((error) => {
            console.error('Error fetching clients:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching clients:', error)
        reject(error)
      })
  })
}

function getClientById(id) {
  console.log('getClientById', id)
  console.log(clienteStore.clients.length)
  const client = clienteStore.clients.find((item) => item.id == id)
  return client
}

function createClient(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar cliente'))
          return
        }

        response
          .json()
          .then((created) => {
            clienteStore.clients = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating client:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating client:', error)
        reject(error)
      })
  })
}

function updateClient(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar cliente'))
          return
        }

        response
          .json()
          .then((updated) => {
            clienteStore.clients = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating client:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating client:', error)
        reject(error)
      })
  })
}

function deleteClient(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir cliente'))
          return
        }

        clienteStore.clients = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting client:', error)
        reject(error)
      })
  })
}

export {
  getAllClientsFromRest,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
}
