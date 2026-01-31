import { useState, useRef, useEffect } from 'react';
import { CHAINS, SUPPORTED_CHAIN_IDS, DEFAULT_CHAIN_ID } from '@/data/chains';
import type { ChainSelectorProps, ChainId } from '@/types';

// Chain icons using emoji/unicode (can be replaced with actual icons)
const CHAIN_ICONS: Record<ChainId, string> = {
  1: '\u039E', // Ethereum
  10: '\uD83D\uDD34', // Optimism (red circle)
  137: '\uD83D\uDFE3', // Polygon (purple)
  42161: '\uD83D\uDD35', // Arbitrum (blue)
  8453: '\uD83D\uDD35', // Base (blue)
  43114: '\uD83D\uDD34', // Avalanche (red)
  56: '\uD83D\uDFE1', // BSC (yellow)
};

export function ChainSelector({
  value,
  onChange,
  supportedOnly = true,
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChainId = value ?? DEFAULT_CHAIN_ID;
  const selectedChain = CHAINS[selectedChainId];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const chainIds = supportedOnly ? SUPPORTED_CHAIN_IDS : SUPPORTED_CHAIN_IDS;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-lg" aria-hidden="true">
          {CHAIN_ICONS[selectedChainId]}
        </span>
        <span className="flex-1 text-left text-gray-900">{selectedChain.name}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          role="listbox"
          aria-activedescendant={`chain-${selectedChainId}`}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {chainIds.map((chainId) => {
            const chain = CHAINS[chainId];
            const isSelected = chainId === selectedChainId;

            return (
              <li
                key={chainId}
                id={`chain-${chainId}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(chainId);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                  isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {CHAIN_ICONS[chainId]}
                </span>
                <span className="flex-1">{chain.name}</span>
                <span className="text-xs text-gray-500">{chain.shortName}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
