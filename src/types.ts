export interface Character {
  id: string
  name: string
  /** Optional short descriptor, e.g. "protagonist", "the detective" */
  role?: string
  /** Grouping used to color the node, e.g. a family or faction */
  group?: string
  notes?: string
}

export interface Relationship {
  id: string
  source: string // Character id
  target: string // Character id
  /** How they relate, e.g. "sister", "rival", "mentor" */
  label: string
  /** Directed relationships (mentor -> student) draw an arrow */
  directed?: boolean
}

export interface NovelData {
  title: string
  characters: Character[]
  relationships: Relationship[]
}
