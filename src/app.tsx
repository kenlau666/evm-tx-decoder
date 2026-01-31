import { useReducer, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { TransactionInput } from '@/components/features/transaction-input';
import { DecodedResult } from '@/components/features/decoded-result';
import { ChainSelector } from '@/components/features/chain-selector';
import { useDecoder } from '@/hooks';
import { DEFAULT_CHAIN_ID } from '@/data/chains';
import type { AppState, AppAction, RawTransactionInput } from '@/types';

// Initial state
const initialState: AppState = {
  input: null,
  result: null,
  isLoading: false,
  error: null,
  selectedChain: DEFAULT_CHAIN_ID,
  preferences: {
    showRawData: false,
    expandArgs: false,
  },
};

// Reducer for app state management
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload,
        error: null,
      };
    case 'DECODE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'DECODE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        result: action.payload,
        error: null,
      };
    case 'DECODE_ERROR':
      return {
        ...state,
        isLoading: false,
        result: null,
        error: action.payload,
      };
    case 'SET_CHAIN':
      return {
        ...state,
        selectedChain: action.payload,
      };
    case 'TOGGLE_RAW_DATA':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          showRawData: !state.preferences.showRawData,
        },
      };
    case 'TOGGLE_EXPAND_ARGS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          expandArgs: !state.preferences.expandArgs,
        },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { decode } = useDecoder();

  const handleSubmit = useCallback(
    async (input: RawTransactionInput) => {
      dispatch({ type: 'SET_INPUT', payload: input });
      dispatch({ type: 'DECODE_START' });

      try {
        const result = await decode(input, state.selectedChain);
        dispatch({ type: 'DECODE_SUCCESS', payload: result });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to decode transaction';
        dispatch({ type: 'DECODE_ERROR', payload: message });
      }
    },
    [decode, state.selectedChain]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Chain selector and input section */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Decode Transaction
            </h2>
            <ChainSelector
              value={state.selectedChain}
              onChange={(chainId) =>
                dispatch({ type: 'SET_CHAIN', payload: chainId })
              }
            />
          </div>

          <TransactionInput
            onSubmit={handleSubmit}
            isLoading={state.isLoading}
            error={state.error ?? undefined}
          />
        </div>

        {/* Loading state */}
        {state.isLoading && (
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-gray-600">Decoding transaction...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {state.error && !state.isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow">
            <div className="flex items-start space-x-3">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-red-800">Decode Error</h3>
                <p className="mt-1 text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result section */}
        {state.result && !state.isLoading && (
          <DecodedResult
            result={state.result}
            showRawData={state.preferences.showRawData}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default App;
