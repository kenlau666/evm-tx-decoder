// Placeholder for ABI registry - implemented in Issue #5
// Maps 4-byte selectors to function ABIs

export interface SelectorIndex {
  [selector: string]: readonly unknown[];
}

// TODO: Implement selector index in Issue #5
export const SELECTOR_INDEX: SelectorIndex = {};
