import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import type { TransactionInputProps } from '@/types';
import type { Hex } from '@/types';

export function TransactionInput({
  onSubmit,
  isLoading,
  error,
}: TransactionInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateHex(value: string): string | null {
    if (!value.trim()) {
      return null; // Empty is not an error, just disable button
    }
    if (!value.startsWith('0x')) {
      return 'Invalid hex: must start with 0x';
    }
    const hexPart = value.slice(2);
    if (!/^[0-9a-fA-F]*$/.test(hexPart)) {
      return 'Invalid hex: contains non-hex characters';
    }
    if (value.length < 10) {
      return 'Invalid calldata: minimum 4 bytes required';
    }
    return null;
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    setValidationError(validateHex(value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const error = validateHex(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    onSubmit({
      hex: inputValue.trim() as Hex,
    });
  }

  const isEmpty = !inputValue.trim();
  const hasError = validationError !== null;
  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Paste raw transaction hex (0x...)"
          rows={4}
          disabled={isLoading}
          error={displayError}
          className="resize-none"
          aria-label="Transaction hex input"
        />
      </div>

      <Button
        type="submit"
        disabled={isEmpty || hasError || isLoading}
        className="w-full"
      >
        {isLoading ? 'Decoding...' : 'Decode'}
      </Button>
    </form>
  );
}
