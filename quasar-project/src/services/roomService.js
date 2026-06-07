import { request } from './api'

const BASE_PATH = '/room/api/'

export const roomService = {
  listByCinema(cinemaId) {
    return request(`${BASE_PATH}?cinema=${cinemaId}`)
  },
  create(data) {
    return request(BASE_PATH, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  update(id, data) {
    return request(`${BASE_PATH}${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  remove(id) {
    return request(`${BASE_PATH}${id}/`, {
      method: 'DELETE',
    })
  },
}
