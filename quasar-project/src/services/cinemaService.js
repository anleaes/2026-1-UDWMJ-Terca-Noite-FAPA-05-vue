import { request } from './api'

const BASE_PATH = '/cinema/api/'

export const cinemaService = {
  list() {
    return request(BASE_PATH)
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
