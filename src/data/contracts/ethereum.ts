import type { ContractLabel, ProtocolInfo } from '@/types';

// Protocol definitions
const UNISWAP: ProtocolInfo = {
  id: 'uniswap',
  name: 'Uniswap',
  website: 'https://uniswap.org',
};

const SUSHISWAP: ProtocolInfo = {
  id: 'sushiswap',
  name: 'SushiSwap',
  website: 'https://sushi.com',
};

const WETH_PROTOCOL: ProtocolInfo = {
  id: 'weth',
  name: 'Wrapped Ether',
};

const ONEINCH: ProtocolInfo = {
  id: '1inch',
  name: '1inch',
  website: 'https://1inch.io',
};

const CURVE: ProtocolInfo = {
  id: 'curve',
  name: 'Curve Finance',
  website: 'https://curve.fi',
};

// Ethereum mainnet contracts (chainId: 1)
export const ETHEREUM_CONTRACTS: ContractLabel[] = [
  // WETH
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chainId: 1,
    protocol: WETH_PROTOCOL,
    contractName: 'WETH9',
  },
  // Uniswap V2
  {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    chainId: 1,
    protocol: UNISWAP,
    contractName: 'Uniswap V2: Router 2',
  },
  {
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    chainId: 1,
    protocol: UNISWAP,
    contractName: 'Uniswap V2: Factory',
  },
  // Uniswap V3
  {
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    chainId: 1,
    protocol: UNISWAP,
    contractName: 'Uniswap V3: Router',
  },
  {
    address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    chainId: 1,
    protocol: UNISWAP,
    contractName: 'Uniswap V3: Router 2',
  },
  {
    address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    chainId: 1,
    protocol: UNISWAP,
    contractName: 'Uniswap V3: Factory',
  },
  // SushiSwap
  {
    address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    chainId: 1,
    protocol: SUSHISWAP,
    contractName: 'SushiSwap: Router',
  },
  // 1inch
  {
    address: '0x1111111254EEB25477B68fb85Ed929f73A960582',
    chainId: 1,
    protocol: ONEINCH,
    contractName: '1inch V5: Aggregation Router',
  },
  // Curve
  {
    address: '0x99a58482BD75cbab83b27EC03CA68fF489b5788f',
    chainId: 1,
    protocol: CURVE,
    contractName: 'Curve: Router',
  },
];
