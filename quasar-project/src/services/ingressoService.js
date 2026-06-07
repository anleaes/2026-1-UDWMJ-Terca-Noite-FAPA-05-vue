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

function getIngressoById(id) {
  return ingressoStore.ingressos.find((item) => item.id == id)
}

export {
  getAllIngressosFromRest,
  getIngressoById,
}
