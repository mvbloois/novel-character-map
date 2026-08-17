import { useEffect, useMemo, useRef, useState } from 'react'
import { Graph } from './Graph'
import { loadData, saveData, newId } from './storage'
import type { Character, NovelData, Relationship } from './types'

export function App() {
  const [data, setData] = useState<NovelData>(() => loadData())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Persist on every change.
  useEffect(() => {
    saveData(data)
  }, [data])

  const nameById = useMemo(() => {
    const m = new Map<string, string>()
    data.characters.forEach((c) => m.set(c.id, c.name))
    return m
  }, [data.characters])

  const selectedChar = data.characters.find((c) => c.id === selectedId) ?? null
  const selectedRels = selectedId
    ? data.relationships.filter((r) => r.source === selectedId || r.target === selectedId)
    : []

  function addCharacter(name: string, role: string, group: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const c: Character = { id: newId('c'), name: trimmed, role: role.trim() || undefined, group: group.trim() || undefined }
    setData((d) => ({ ...d, characters: [...d.characters, c] }))
  }

  function updateCharacter(updated: Character) {
    setData((d) => ({
      ...d,
      characters: d.characters.map((c) => (c.id === updated.id ? updated : c)),
    }))
  }

  function deleteCharacter(id: string) {
    setData((d) => ({
      ...d,
      characters: d.characters.filter((c) => c.id !== id),
      relationships: d.relationships.filter((r) => r.source !== id && r.target !== id),
    }))
    if (selectedId === id) setSelectedId(null)
  }

  function addRelationship(source: string, target: string, label: string, directed: boolean) {
    if (!source || !target || source === target) return
    const r: Relationship = { id: newId('r'), source, target, label: label.trim() || 'related', directed }
    setData((d) => ({ ...d, relationships: [...d.relationships, r] }))
  }

  function deleteRelationship(id: string) {
    setData((d) => ({ ...d, relationships: d.relationships.filter((r) => r.id !== id) }))
  }

  function resetAll() {
    if (!confirm('Clear all characters and relationships and start a blank map?')) return
    setData({ title: 'Untitled novel', characters: [], relationships: [] })
    setSelectedId(null)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar-header">
          <input
            className="title-input"
            value={data.title}
            onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
            aria-label="Novel title"
          />
          <Toolbar data={data} setData={setData} onReset={resetAll} />
        </header>

        <Section title={`Characters (${data.characters.length})`}>
          <AddCharacterForm onAdd={addCharacter} />
          <ul className="list">
            {data.characters.map((c) => (
              <li
                key={c.id}
                className={c.id === selectedId ? 'list-item selected' : 'list-item'}
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
              >
                <div className="list-item-main">
                  <span className="list-item-name">{c.name}</span>
                  {c.role && <span className="list-item-sub">{c.role}</span>}
                </div>
                <button
                  className="icon-btn"
                  title="Delete character"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCharacter(c.id)
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Add relationship">
          <AddRelationshipForm characters={data.characters} onAdd={addRelationship} />
        </Section>

        {selectedChar && (
          <Section title={`Selected: ${selectedChar.name}`}>
            <EditCharacter character={selectedChar} onChange={updateCharacter} />
            <div className="rel-list">
              {selectedRels.length === 0 && <p className="muted">No relationships yet.</p>}
              {selectedRels.map((r) => {
                const otherId = r.source === selectedChar.id ? r.target : r.source
                const arrow = r.directed ? (r.source === selectedChar.id ? '→' : '←') : '—'
                return (
                  <div key={r.id} className="rel-row">
                    <span>
                      {arrow} <strong>{r.label}</strong> {nameById.get(otherId)}
                    </span>
                    <button className="icon-btn" title="Delete" onClick={() => deleteRelationship(r.id)}>
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </Section>
        )}
      </aside>

      <main className="main">
        <Graph data={data} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="hint">Click a character to highlight their connections · drag to rearrange · scroll to zoom</div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  )
}

function AddCharacterForm({ onAdd }: { onAdd: (name: string, role: string, group: string) => void }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [group, setGroup] = useState('')
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(name, role, group)
        setName('')
        setRole('')
      }}
    >
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <div className="form-row">
        <input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} />
        <input placeholder="Group (optional)" value={group} onChange={(e) => setGroup(e.target.value)} />
      </div>
      <button type="submit">+ Add character</button>
    </form>
  )
}

function AddRelationshipForm({
  characters,
  onAdd,
}: {
  characters: Character[]
  onAdd: (source: string, target: string, label: string, directed: boolean) => void
}) {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [label, setLabel] = useState('')
  const [directed, setDirected] = useState(false)

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(source, target, label, directed)
        setLabel('')
      }}
    >
      <div className="form-row">
        <select value={source} onChange={(e) => setSource(e.target.value)} required>
          <option value="">From…</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={target} onChange={(e) => setTarget(e.target.value)} required>
          <option value="">To…</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <input placeholder='Relationship, e.g. "sister", "rival"' value={label} onChange={(e) => setLabel(e.target.value)} />
      <label className="checkbox">
        <input type="checkbox" checked={directed} onChange={(e) => setDirected(e.target.checked)} />
        Directed (draws an arrow From → To)
      </label>
      <button type="submit" disabled={characters.length < 2}>
        + Add relationship
      </button>
    </form>
  )
}

function EditCharacter({ character, onChange }: { character: Character; onChange: (c: Character) => void }) {
  return (
    <div className="form">
      <input value={character.name} onChange={(e) => onChange({ ...character, name: e.target.value })} placeholder="Name" />
      <div className="form-row">
        <input
          value={character.role ?? ''}
          onChange={(e) => onChange({ ...character, role: e.target.value || undefined })}
          placeholder="Role"
        />
        <input
          value={character.group ?? ''}
          onChange={(e) => onChange({ ...character, group: e.target.value || undefined })}
          placeholder="Group"
        />
      </div>
    </div>
  )
}

function Toolbar({
  data,
  setData,
  onReset,
}: {
  data: NovelData
  setData: React.Dispatch<React.SetStateAction<NovelData>>
  onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'novel'}-map.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJson(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as NovelData
        if (!Array.isArray(parsed.characters) || !Array.isArray(parsed.relationships)) {
          throw new Error('Missing characters or relationships')
        }
        setData({
          title: parsed.title ?? 'Imported novel',
          characters: parsed.characters,
          relationships: parsed.relationships,
        })
      } catch (err) {
        alert('Could not import file: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="toolbar">
      <button onClick={exportJson} title="Download the map as JSON">
        Export
      </button>
      <button onClick={() => fileRef.current?.click()} title="Load a map from a JSON file">
        Import
      </button>
      <button onClick={onReset} title="Clear everything">
        New
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importJson(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
