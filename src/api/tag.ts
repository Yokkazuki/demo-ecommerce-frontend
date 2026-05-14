import api from './axios'

export interface Tag {
  id: number
  name: string
  color: string
}

export const tagApi = {
  getAll() {
    return api.get<Tag[]>('/tags')
  },
  create(data: Partial<Tag>) {
    return api.post<Tag>('/tags', data)
  },
  update(id: number, data: Partial<Tag>) {
    return api.put<Tag>(`/tags/${id}`, data)
  },
  delete(id: number) {
    return api.delete(`/tags/${id}`)
  },
}
