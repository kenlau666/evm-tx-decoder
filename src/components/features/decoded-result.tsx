import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  DecodedResultProps,
  DecodedTransaction,
  DecodedFunctionCall,
  TransactionAction,
  TokenAmount,
  DecodeStatus,
} from '@/types';

// Action icons mapping
const ACTION_ICONS: Record<TransactionAction, string> = {
  swap: '\u21C4',
  transfer: '\u2192',
  approve: '\u2713',
  'add-liquidity': '+',
  'remove-liquidity': '-',
  stake: '\u2191',
  unstake: '\u2193',
  borrow: '\u2190',
  repay: '\u2192',
  deposit: '\u2193',
  withdraw: '\u2191',
  mint: '+',
  burn: '\u2717',
  bridge: '\u2194',
  wrap: '\u21BB',
  unwrap: '\u21BA',
  unknown: '?',
};

export function DecodedResult({ result, showRawData = false }: DecodedResultProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(showRawData);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <SummaryCard result={result} />

      {/* Token Amounts */}
      {(result.summary.tokensIn.length > 0 || result.summary.tokensOut.length > 0) && (
        <TokenAmountsCard
          tokensIn={result.summary.tokensIn}
          tokensOut={result.summary.tokensOut}
        />
      )}

      {/* Function Call Details */}
      {result.functionCall && (
        <FunctionCallCard
          functionCall={result.functionCall}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
      )}

      {/* Protocol Label */}
      {result.protocol && (
        <ProtocolCard protocol={result.protocol} contractLabel={result.contractLabel} />
      )}

      {/* Status/Error Display */}
      {result.status.type !== 'success' && <StatusCard status={result.status} />}

      {/* Raw Data Toggle */}
      <RawDataCard
        parsed={result.parsed}
        showRaw={showRaw}
        onToggle={() => setShowRaw(!showRaw)}
      />
    </div>
  );
}

function SummaryCard({ result }: { result: DecodedTransaction }) {
  const { summary } = result;
  const icon = ACTION_ICONS[summary.action];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{summary.title}</h2>
            <p className="text-sm text-gray-500 capitalize">{summary.action.replace('-', ' ')}</p>
          </div>
        </div>
      </CardHeader>
      {Object.keys(summary.details).length > 0 && (
        <CardContent>
          <dl className="space-y-1 text-sm">
            {Object.entries(summary.details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-gray-500">{key}</dt>
                <dd className="font-mono text-gray-900 truncate max-w-[200px]" title={value}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
    </Card>
  );
}

function TokenAmountsCard({
  tokensIn,
  tokensOut,
}: {
  tokensIn: TokenAmount[];
  tokensOut: TokenAmount[];
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-medium text-gray-900">Token Amounts</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokensIn.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Tokens In</p>
            {tokensIn.map((token, i) => (
              <TokenAmountRow key={i} amount={token} direction="in" />
            ))}
          </div>
        )}
        {tokensOut.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Tokens Out</p>
            {tokensOut.map((token, i) => (
              <TokenAmountRow key={i} amount={token} direction="out" />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TokenAmountRow({
  amount,
  direction,
}: {
  amount: TokenAmount;
  direction: 'in' | 'out';
}) {
  const colorClass = direction === 'in' ? 'text-green-600' : 'text-red-600';
  const prefix = direction === 'in' ? '+' : '-';

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {amount.token.logoURI && (
          <img
            src={amount.token.logoURI}
            alt={amount.token.symbol}
            className="w-5 h-5 rounded-full"
          />
        )}
        <span className="font-medium">{amount.token.symbol}</span>
      </div>
      <span className={`font-mono ${colorClass}`}>
        {prefix}
        {amount.formatted}
      </span>
    </div>
  );
}

function FunctionCallCard({
  functionCall,
  expanded,
  onToggle,
}: {
  functionCall: DecodedFunctionCall;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{functionCall.name}</h3>
          <p className="text-xs font-mono text-gray-500">{functionCall.selector}</p>
        </div>
        <Button variant="ghost" onClick={onToggle} className="text-sm">
          {expanded ? 'Hide' : 'Show'} Arguments
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent>
          <p className="text-xs font-mono text-gray-500 mb-3">{functionCall.signature}</p>
          {functionCall.args.length > 0 ? (
            <dl className="space-y-2">
              {functionCall.args.map((arg, i) => (
                <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                  <dt className="text-xs text-gray-500">
                    {arg.name} <span className="text-gray-400">({arg.type})</span>
                  </dt>
                  <dd className="font-mono text-sm text-gray-900 break-all">{arg.formatted}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No arguments</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ProtocolCard({
  protocol,
  contractLabel,
}: {
  protocol: DecodedTransaction['protocol'];
  contractLabel: DecodedTransaction['contractLabel'];
}) {
  if (!protocol) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        {protocol.logoURI && (
          <img
            src={protocol.logoURI}
            alt={protocol.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div>
          <p className="font-medium text-gray-900">{protocol.name}</p>
          {contractLabel && (
            <p className="text-sm text-gray-500">{contractLabel.contractName}</p>
          )}
        </div>
        {protocol.website && (
          <a
            href={protocol.website}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-blue-600 hover:underline"
          >
            Website
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function StatusCard({ status }: { status: DecodeStatus }) {
  if (status.type === 'success') return null;

  const statusStyles: Record<DecodeStatus['type'], { bg: string; text: string }> = {
    success: { bg: 'bg-green-50', text: 'text-green-800' },
    partial: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
    'unknown-function': { bg: 'bg-orange-50', text: 'text-orange-800' },
    'unknown-protocol': { bg: 'bg-gray-50', text: 'text-gray-800' },
    'invalid-input': { bg: 'bg-red-50', text: 'text-red-800' },
  };

  const style = statusStyles[status.type];

  const getMessage = () => {
    switch (status.type) {
      case 'partial':
        return status.message;
      case 'unknown-function':
        return `Unknown function selector: ${status.selector}`;
      case 'unknown-protocol':
        return 'Contract not recognized';
      case 'invalid-input':
        return status.message;
      default:
        return '';
    }
  };

  return (
    <Card className={style.bg}>
      <CardContent>
        <p className={`text-sm ${style.text}`}>{getMessage()}</p>
      </CardContent>
    </Card>
  );
}

function RawDataCard({
  parsed,
  showRaw,
  onToggle,
}: {
  parsed: DecodedTransaction['parsed'];
  showRaw: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-medium text-gray-900">Raw Transaction Data</h3>
        <Button variant="ghost" onClick={onToggle} className="text-sm">
          {showRaw ? 'Hide' : 'Show'}
        </Button>
      </CardHeader>
      {showRaw && (
        <CardContent>
          <dl className="space-y-2 text-sm">
            {parsed.to && (
              <div>
                <dt className="text-gray-500">To</dt>
                <dd className="font-mono text-gray-900 break-all">{parsed.to}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Value</dt>
              <dd className="font-mono text-gray-900">{parsed.value.toString()} wei</dd>
            </div>
            <div>
              <dt className="text-gray-500">Data</dt>
              <dd className="font-mono text-gray-900 break-all text-xs max-h-32 overflow-y-auto">
                {parsed.data}
              </dd>
            </div>
            {parsed.chainId && (
              <div>
                <dt className="text-gray-500">Chain ID</dt>
                <dd className="font-mono text-gray-900">{parsed.chainId}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-mono text-gray-900">{parsed.txType}</dd>
            </div>
            {parsed.gas && (
              <>
                <div>
                  <dt className="text-gray-500">Gas Limit</dt>
                  <dd className="font-mono text-gray-900">{parsed.gas.limit.toString()}</dd>
                </div>
                {parsed.gas.maxFeePerGas && (
                  <div>
                    <dt className="text-gray-500">Max Fee Per Gas</dt>
                    <dd className="font-mono text-gray-900">
                      {parsed.gas.maxFeePerGas.toString()} wei
                    </dd>
                  </div>
                )}
              </>
            )}
            {parsed.nonce !== undefined && (
              <div>
                <dt className="text-gray-500">Nonce</dt>
                <dd className="font-mono text-gray-900">{parsed.nonce}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      )}
    </Card>
  );
}
