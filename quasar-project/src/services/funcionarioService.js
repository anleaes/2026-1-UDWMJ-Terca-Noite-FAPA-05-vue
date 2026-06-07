import { API_URL } from './api'
import { funcionarioStore } from 'src/stores/funcionario-store.js'

const BASE = `${API_URL}/employee/api/`

function getAllEmployeesFromRest(forceReload = false) {
  return new Promise((resolve, reject) => {
    if (!forceReload && funcionarioStore.employees.length > 0) {
      resolve(funcionarioStore.employees)
      return
    }

    fetch(BASE)
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao buscar funcionários'))
          return
        }

        response
          .json()
          .then((data) => {
            const employees = Array.isArray(data) ? data : (data.results || [])
            console.log(employees)
            funcionarioStore.employees = employees
            resolve(employees)
          })
          .catch((error) => {
            console.error('Error fetching employees:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error fetching employees:', error)
        reject(error)
      })
  })
}

function getEmployeeById(id) {
  console.log('getEmployeeById', id)
  console.log(funcionarioStore.employees.length)
  const employee = funcionarioStore.employees.find((item) => item.id == id)
  return employee
}

function createEmployee(data) {
  return new Promise((resolve, reject) => {
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao cadastrar funcionário'))
          return
        }

        response
          .json()
          .then((created) => {
            funcionarioStore.employees = []
            resolve(created)
          })
          .catch((error) => {
            console.error('Error creating employee:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error creating employee:', error)
        reject(error)
      })
  })
}

function updateEmployee(id, data) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao atualizar funcionário'))
          return
        }

        response
          .json()
          .then((updated) => {
            funcionarioStore.employees = []
            resolve(updated)
          })
          .catch((error) => {
            console.error('Error updating employee:', error)
            reject(error)
          })
      })
      .catch((error) => {
        console.error('Error updating employee:', error)
        reject(error)
      })
  })
}

function deleteEmployee(id) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE}${id}/`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          reject(new Error('Erro ao excluir funcionário'))
          return
        }

        funcionarioStore.employees = []
        resolve()
      })
      .catch((error) => {
        console.error('Error deleting employee:', error)
        reject(error)
      })
  })
}

export {
  getAllEmployeesFromRest,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
}
