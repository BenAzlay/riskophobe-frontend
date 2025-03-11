import { render, screen, fireEvent } from '../../test/utils'
import { act } from '@testing-library/react'
import BuyModal from '../BuyModal'
import '@testing-library/jest-dom'
import { useAccount } from 'wagmi'
import { getTokenAllowance, getTokenBalance } from '@/utils/tokenMethods'
import CONSTANTS from '@/utils/constants'

// Mock SwitchChainButton
jest.mock('../SwitchChainButton', () => {
  return {
    __esModule: true,
    default: () => (
      <button className="btn btn-primary w-full">SWITCH TO BASE</button>
    ),
  }
})

// Mock dependencies
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}))

jest.mock('@/utils/tokenMethods', () => ({
  getTokenAllowance: jest.fn(),
  getTokenBalance: jest.fn(),
}))

jest.mock('@/store/useStore', () => ({
  __esModule: true,
  default: () => ({
    updateOffer: jest.fn(),
    addDeposit: jest.fn(),
    updateDeposit: jest.fn(),
  }),
}))

jest.mock('@/utils/useContractTransaction', () => ({
  __esModule: true,
  default: () => ({
    isPending: false,
    executeTransaction: jest.fn(),
  }),
}))

describe('BuyModal', () => {
  const mockOffer = {
    id: '1',
    soldToken: {
      address: '0x123',
      decimals: 18,
      symbol: 'TEST',
      logo: 'test-logo.png',
      price: 1,
    },
    collateralToken: {
      address: '0x456',
      decimals: 18,
      symbol: 'USDC',
      logo: 'usdc-logo.png',
      price: 1,
    },
    exchangeRate: 1000000000000000000, // 1:1 ratio
    creatorFeeBp: 100, // 1%
    startTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    endTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    soldTokenAmount: 1000000000000000000, // 1 token
    collateralBalance: 1000000000000000000, // 1 token
    creator: '0x789',
    collateralPerSoldToken: 1000000000000000000, // 1:1 ratio
    pricePerSoldToken: 1000000000000000000, // 1 USDC per token
    soldTokenMarketPriceDifference: 0, // No price difference
  }

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    offer: mockOffer,
    deposit: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAccount as jest.Mock).mockReturnValue({
      address: '0xuser',
      chainId: 8453, // Base network chainId
    })
    ;(getTokenBalance as jest.Mock).mockResolvedValue('1000000000000000000')
    ;(getTokenAllowance as jest.Mock).mockResolvedValue('0')
  })

  it('renders correctly when visible', async () => {
    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    expect(screen.getByText(/Buy TEST/i)).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('does not render when not visible', async () => {
    await act(async () => {
      render(<BuyModal {...defaultProps} visible={false} />)
    })
    
    expect(screen.queryByText(/Buy TEST/i)).not.toBeInTheDocument()
  })

  it('shows connect wallet button when wallet is not connected', async () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      chainId: undefined,
    })

    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    expect(screen.getByText(/SIGN IN/i)).toBeInTheDocument()
  })

  it('shows switch chain button when on wrong network', async () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      address: '0xuser',
      chainId: 999, // Wrong chain ID
    })

    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    expect(screen.getByText(/SWITCH TO BASE/i)).toBeInTheDocument()
  })

  it('updates collateral input when slider changes', async () => {
    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    const slider = screen.getByRole('slider')
    await act(async () => {
      fireEvent.change(slider, { target: { value: '0.5' } })
    })
    
    // Check if the collateral input value is updated
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument()
  })

  it('shows approval button when allowance is insufficient', async () => {
    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    const slider = screen.getByRole('slider')
    await act(async () => {
      fireEvent.change(slider, { target: { value: '1' } })
    })
    
    expect(screen.getByText(/APPROVE USDC/i)).toBeInTheDocument()
  })

  it('shows buy button when allowance is sufficient', async () => {
    ;(getTokenAllowance as jest.Mock).mockResolvedValue('2000000000000000000') // More than needed

    await act(async () => {
      render(<BuyModal {...defaultProps} />)
    })
    
    const slider = screen.getByRole('slider')
    await act(async () => {
      fireEvent.change(slider, { target: { value: '1' } })
    })
    
    expect(screen.getByText(/BUY TEST/i)).toBeInTheDocument()
  })
})
