import { API_URL } from '@/services/api.js'

function getAllPedidosFromRest() {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/pedidos`)
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

function getPedidosCountFromRest() {
  return new Promise((resolve, reject) => {
    getAllPedidosFromRest()
      .then((data) => {
        resolve(data.length)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export { getAllPedidosFromRest, getPedidosCountFromRest }
