import api from './axios'

export type Company = {
  id?: number
  name: string
  cnpj: string
  status: 'active' | 'inactive'
}

const onlyDigits = (s: string) => (s || '').replace(/\D/g, '')
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ') 
    .trim()

export async function listCompanies(page = 1, limit = 10, q?: string) {
  const res = await api.get('/companies', { params: { _sort: 'id', _order: 'desc' } })
  const all = (res.data as Company[]) ?? []

  let filtered = all
  const raw = (q ?? '').trim()

  if (raw) {
    const needleName = normalize(raw)
    const needleDigits = onlyDigits(raw)

    filtered = all.filter((c) => {
      const name = normalize(c.name || '')
      const cnpjNorm = normalize(c.cnpj || '')
      const cnpjDigits = onlyDigits(c.cnpj || '')

      const nameMatch = needleName ? name.includes(needleName) : false
      const cnpjMatch =
        (needleDigits ? cnpjDigits.includes(needleDigits) : false) ||
        (needleName ? cnpjNorm.includes(needleName) : false)

      return nameMatch || cnpjMatch
    })
  }

  const total = filtered.length
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)

  return { data, total }
}

export async function getCompany(id: number) {
  const res = await api.get(`/companies/${id}`)
  return res.data as Company
}

export async function updateCompany(id: number, payload: Partial<Company>) {
  const res = await api.patch(`/companies/${id}`, payload)
  return res.data as Company
}

export async function deleteCompany(id: number) {
  await api.delete(`/companies/${id}`)
}
