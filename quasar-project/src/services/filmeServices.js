import { createCrudService } from '@/services/createCrudService.js'

const {
  getAllFromRest: getAllFilmesFromRest,
  getCountFromRest: getFilmesCountFromRest,
  createFromRest: createFilmeFromRest,
  updateFromRest: updateFilmeFromRest,
  deleteFromRest: deleteFilmeFromRest,
} = createCrudService('filmes')

export {
  getAllFilmesFromRest,
  getFilmesCountFromRest,
  createFilmeFromRest,
  updateFilmeFromRest,
  deleteFilmeFromRest,
}
