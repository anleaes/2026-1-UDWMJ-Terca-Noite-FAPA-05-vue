import { createCrudService } from '@/services/createCrudService.js'

const {
  getAllFromRest: getAllClientesFromRest,
  getCountFromRest: getClientesCountFromRest,
  createFromRest: createClienteFromRest,
  updateFromRest: updateClienteFromRest,
  deleteFromRest: deleteClienteFromRest,
} = createCrudService('clientes')

export {
  getAllClientesFromRest,
  getClientesCountFromRest,
  createClienteFromRest,
  updateClienteFromRest,
  deleteClienteFromRest,
}
