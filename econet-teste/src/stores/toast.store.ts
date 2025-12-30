import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastItem = {
  id: number
  type: ToastType
  message: string
  duration?: number
}

let _id = 1

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[],
  }),
  actions: {
    push(partial: Omit<ToastItem, 'id'>) {
      const item: ToastItem = { id: _id++, duration: 3500, ...partial }
      this.items.unshift(item)
      if (item.duration && item.duration > 0) {
        const id = item.id
        setTimeout(() => this.dismiss(id), item.duration)
      }
    },
    dismiss(id: number) {
      this.items = this.items.filter(t => t.id !== id)
    },
    clear() {
      this.items = []
    },

    success(message: string, duration = 3000) {
      this.push({ type: 'success', message, duration })
    },
    error(message: string, duration = 4500) {
      this.push({ type: 'error', message, duration })
    },
    warning(message: string, duration = 4000) {
      this.push({ type: 'warning', message, duration })
    },
    info(message: string, duration = 3500) {
      this.push({ type: 'info', message, duration })
    },
  }
})
