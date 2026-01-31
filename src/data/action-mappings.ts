// Placeholder for action mappings - implemented in Issue #9
// Maps function selectors to human-readable action types

import type { TransactionAction } from '@/types';

export interface ActionMapping {
  selector: string;
  action: TransactionAction;
  template: string;
}

// TODO: Implement action mappings in Issue #9
export const ACTION_MAPPINGS: ActionMapping[] = [];
