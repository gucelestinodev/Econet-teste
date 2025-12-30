import axios from 'axios'
import { useToastStore } from '../stores/toast.store'

const api = axios.create({
  baseURL: 'http://localhost:3333',
  timeout: 10000,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const toast = useToastStore()
    const isNetwork = !error.response
    const status = error.response?.status

    const msg =
      isNetwork
        ? 'Falha de conexão. Verifique sua internet.'
        : status >= 500
          ? 'Serviço indisponível. Tente novamente em instantes.'
          : error.response?.data?.message || 'Ops, algo deu errado.'

    if (!error.config.__handled) {
      toast.error(msg)
    }

    return Promise.reject(error)
  }
)

export default api
