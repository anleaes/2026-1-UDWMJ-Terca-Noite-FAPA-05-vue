import { API_URL } from './api'

const BASE = `${API_URL}/seat/api/`

function getAssentosBySalaFromRest(roomId) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}?room=${roomId}`)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar assentos'))
          return
        }

        response
          .json()
          .then((data) => {
            const assentos = Array.isArray(data) ? data : (data.results || [])
            resolve(assentos)
          })
          .catch((error) => {
            console.error('Error fetching assentos:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching assentos:', error)
        reject(error)
      })
  })
}

export {
  getAssentosBySalaFromRest,
}
