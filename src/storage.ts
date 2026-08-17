import type { NovelData } from './types'
import { seedData } from './seed'

const KEY = 'novel-character-map:data'

export function loadData(): NovelData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(seedData)
    const parsed = JSON.parse(raw) as NovelData
    if (!parsed.characters || !parsed.relationships) return structuredClone(seedData)
    return parsed
  } catch {
    return structuredClone(seedData)
  }
}

export function saveData(data: NovelData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
