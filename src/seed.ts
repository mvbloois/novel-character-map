import type { NovelData } from './types'

// A small public-domain example so the app isn't empty on first run.
// Replace it with the novel you're actually reading (or use "New" to clear).
export const seedData: NovelData = {
  title: 'Pride and Prejudice (example)',
  characters: [
    { id: 'lizzy', name: 'Elizabeth Bennet', role: 'protagonist', group: 'Bennet' },
    { id: 'jane', name: 'Jane Bennet', role: 'eldest sister', group: 'Bennet' },
    { id: 'lydia', name: 'Lydia Bennet', role: 'youngest sister', group: 'Bennet' },
    { id: 'mr-bennet', name: 'Mr. Bennet', role: 'father', group: 'Bennet' },
    { id: 'mrs-bennet', name: 'Mrs. Bennet', role: 'mother', group: 'Bennet' },
    { id: 'darcy', name: 'Fitzwilliam Darcy', role: 'love interest', group: 'Darcy' },
    { id: 'bingley', name: 'Charles Bingley', role: 'gentleman', group: 'Bingley' },
    { id: 'caroline', name: 'Caroline Bingley', role: 'sister', group: 'Bingley' },
    { id: 'wickham', name: 'George Wickham', role: 'officer', group: 'Other' },
    { id: 'collins', name: 'Mr. Collins', role: 'clergyman', group: 'Other' },
    { id: 'charlotte', name: 'Charlotte Lucas', role: "Elizabeth's friend", group: 'Other' },
  ],
  relationships: [
    { id: 'r1', source: 'lizzy', target: 'jane', label: 'sisters' },
    { id: 'r2', source: 'lizzy', target: 'lydia', label: 'sisters' },
    { id: 'r3', source: 'mr-bennet', target: 'lizzy', label: 'father', directed: true },
    { id: 'r4', source: 'mrs-bennet', target: 'lizzy', label: 'mother', directed: true },
    { id: 'r5', source: 'mr-bennet', target: 'mrs-bennet', label: 'married' },
    { id: 'r6', source: 'lizzy', target: 'darcy', label: 'love interest' },
    { id: 'r7', source: 'jane', target: 'bingley', label: 'courtship' },
    { id: 'r8', source: 'darcy', target: 'bingley', label: 'close friends' },
    { id: 'r9', source: 'bingley', target: 'caroline', label: 'siblings' },
    { id: 'r10', source: 'caroline', target: 'darcy', label: 'admires', directed: true },
    { id: 'r11', source: 'wickham', target: 'lydia', label: 'elopes with', directed: true },
    { id: 'r12', source: 'wickham', target: 'darcy', label: 'old rivalry' },
    { id: 'r13', source: 'collins', target: 'lizzy', label: 'proposes to', directed: true },
    { id: 'r14', source: 'collins', target: 'charlotte', label: 'marries' },
    { id: 'r15', source: 'charlotte', target: 'lizzy', label: 'best friends' },
  ],
}
