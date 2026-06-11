function getCinemasCountFromRest() {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3000/cinemas')
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

export { getCinemasCountFromRest }
