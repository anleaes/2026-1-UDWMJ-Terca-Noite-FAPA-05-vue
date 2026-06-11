function getClientesCountFromRest() {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/clientes')
      .then((response) => {
        response
          .json()
          .then((data) => {
            resolve(data.length)
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

export { getClientesCountFromRest }
