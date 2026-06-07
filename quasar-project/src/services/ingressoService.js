import { API_URL } from './api'
import { ingressoStore } from 'src/stores/ingresso-store.js'

const BASE = `${API_URL}/ticket/api/`

function getAllTicketsFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && ingressoStore.tickets.length > 0) {
      resolve(ingressoStore.tickets)
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
            const tickets = Array.isArray(data) ? data : (data.results || [])
            ingressoStore.tickets = tickets
            resolve(tickets)
          })
          .catch((error) => {
            console.error('Error fetching tickets:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error)
        reject(error)
      })
  })
}

export {
  getAllTicketsFromRest,
}
