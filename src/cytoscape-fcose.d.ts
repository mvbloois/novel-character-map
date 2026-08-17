// cytoscape-fcose ships no type declarations; register it as a cytoscape
// extension (a plugin function passed to cytoscape.use).
declare module 'cytoscape-fcose' {
  import type { Ext } from 'cytoscape'
  const ext: Ext
  export default ext
}
