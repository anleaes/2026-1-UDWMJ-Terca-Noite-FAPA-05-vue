export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Erro na requisição (${response.status})`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
