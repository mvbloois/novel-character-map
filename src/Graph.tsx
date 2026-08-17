import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape'
import fcose from 'cytoscape-fcose'
import type { NovelData } from './types'

cytoscape.use(fcose)

// A palette assigned to character groups in the order they first appear.
const GROUP_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
]

function buildElements(data: NovelData, colorForGroup: (g: string) => string): ElementDefinition[] {
  const nodes: ElementDefinition[] = data.characters.map((c) => ({
    data: {
      id: c.id,
      label: c.name,
      role: c.role ?? '',
      color: colorForGroup(c.group ?? 'default'),
    },
  }))
  const validIds = new Set(data.characters.map((c) => c.id))
  const edges: ElementDefinition[] = data.relationships
    .filter((r) => validIds.has(r.source) && validIds.has(r.target))
    .map((r) => ({
      data: {
        id: r.id,
        source: r.source,
        target: r.target,
        label: r.label,
        directed: r.directed ? 'yes' : 'no',
      },
    }))
  return [...nodes, ...edges]
}

interface GraphProps {
  data: NovelData
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function Graph({ data, selectedId, onSelect }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  // Initialize cytoscape once.
  useEffect(() => {
    if (!containerRef.current) return
    const cy = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#e5e7eb',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'text-outline-color': '#0f172a',
            'text-outline-width': 2,
            width: 34,
            height: 34,
            'border-width': 2,
            'border-color': '#0f172a',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(label)',
            'font-size': '9px',
            color: '#94a3b8',
            'text-rotation': 'autorotate',
            'text-background-color': '#0f172a',
            'text-background-opacity': 0.7,
            'text-background-padding': '2px',
            width: 1.5,
            'line-color': '#475569',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[directed = "yes"]',
          style: {
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#fbbf24',
            'border-width': 4,
          },
        },
        {
          selector: '.faded',
          style: { opacity: 0.15 },
        },
        {
          selector: '.highlight',
          style: { 'line-color': '#fbbf24', 'target-arrow-color': '#fbbf24', width: 2.5 },
        },
      ],
      elements: [],
      minZoom: 0.2,
      maxZoom: 3,
    })
    cy.on('tap', 'node', (evt) => onSelect(evt.target.id()))
    cy.on('tap', (evt) => {
      if (evt.target === cy) onSelect(null)
    })
    cyRef.current = cy

    // Cytoscape reads the container size at init; if the container isn't laid
    // out yet the canvas stays 0×0 and nothing draws. Keep it in sync.
    const ro = new ResizeObserver(() => {
      cy.resize()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      cy.destroy()
      cyRef.current = null
    }
    // onSelect is stable enough for our use; re-init only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync elements whenever data changes, preserving positions where possible.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    const groupColor = makeGroupColorFn()
    const next = buildElements(data, groupColor)
    cy.json({ elements: next })
    cy.resize()
    const layout = cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 400,
      nodeRepulsion: 6500,
      idealEdgeLength: 110,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    layout.one('layoutstop', () => cy.fit(undefined, 40))
    layout.run()
  }, [data])

  // Reflect selection: highlight the node and its neighborhood.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().removeClass('faded highlight')
    cy.nodes().unselect()
    if (!selectedId) return
    const node = cy.getElementById(selectedId)
    if (node.empty()) return
    node.select()
    const neighborhood = node.closedNeighborhood()
    cy.elements().not(neighborhood).addClass('faded')
    node.connectedEdges().addClass('highlight')
  }, [selectedId])

  return <div ref={containerRef} className="graph-canvas" />
}

// Assigns a stable color per group based on first-seen order.
function makeGroupColorFn() {
  const map = new Map<string, string>()
  return (group: string) => {
    if (!map.has(group)) {
      map.set(group, GROUP_COLORS[map.size % GROUP_COLORS.length])
    }
    return map.get(group)!
  }
}
