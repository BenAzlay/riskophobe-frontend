import '@testing-library/jest-dom'

// Add TextEncoder polyfill
global.TextEncoder = require('util').TextEncoder

// Mock viem/chains
jest.mock('viem/chains', () => ({
  __esModule: true,
  base: {
    id: 8453,
    name: 'Base',
    network: 'base',
  },
}))

// Mock viem
jest.mock('viem', () => ({
  parseAbi: jest.fn(),
  createPublicClient: jest.fn(),
  getContract: jest.fn(),
}))

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  __esModule: true,
  useAccount: jest.fn(),
  useSwitchChain: jest.fn(() => ({
    switchChain: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  })),
  useNetwork: jest.fn(() => ({
    chain: { id: base.id },
  })),
}))

// Mock useContractTransaction
jest.mock('@/utils/useContractTransaction', () => ({
  __esModule: true,
  default: () => ({
    write: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  }),
}))
