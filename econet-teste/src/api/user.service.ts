import api from './axios'

export type User = {
  id?: number
  companyId: number
  name: string
  email: string
  role: string
}

export async function listUsersByCompany(companyId: number) {
  const res = await api.get('/users', { params: { companyId, _sort: 'id', _order: 'desc' } })
  return res.data as User[]
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`)
}
