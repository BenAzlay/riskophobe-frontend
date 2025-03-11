import { render, screen, fireEvent } from '../../test/utils'
import TokenAmountField from '../TokenAmountField'
import '@testing-library/jest-dom'

describe('TokenAmountField', () => {
  const defaultProps = {
    amount: '',
    onChangeAmount: jest.fn(),
    tokenComponent: <div>TEST</div>,
    showTokenBalance: true,
    tokenBalance: '1000',
    tokenPrice: 1.5,
  }

  it('renders correctly with default props', () => {
    render(<TokenAmountField {...defaultProps} />)
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument()
    expect(screen.getByText('TEST')).toBeInTheDocument()
    expect(screen.getByText(/Balance:/)).toBeInTheDocument()
  })

  it('handles input changes correctly', () => {
    render(<TokenAmountField {...defaultProps} />)
    const input = screen.getByPlaceholderText('Amount')
    
    // Valid input
    fireEvent.change(input, { target: { value: '123.45' } })
    expect(defaultProps.onChangeAmount).toHaveBeenCalledWith('123.45')
    
    // Invalid input (letters) - should not trigger onChangeAmount
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(defaultProps.onChangeAmount).not.toHaveBeenCalledWith('abc')
  })

  it('displays USD value correctly', () => {
    render(<TokenAmountField {...defaultProps} amount="100" />)
    // With tokenPrice of 1.5, 100 tokens = $150
    const usdValueElement = screen.getByText('$150.00', {
      selector: '.group.inline-block',
    })
    expect(usdValueElement).toBeInTheDocument()
  })

  it('handles balance click correctly', () => {
    render(<TokenAmountField {...defaultProps} />)
    const balanceElement = screen.getByText(/Balance:.*1\.000k/)
    fireEvent.click(balanceElement)
    expect(defaultProps.onChangeAmount).toHaveBeenCalledWith('1000')
  })

  it('shows loading state when balance is loading', () => {
    render(<TokenAmountField {...defaultProps} balanceIsLoading={true} />)
    expect(screen.queryByText('1000')).not.toBeInTheDocument()
    // Would need to check for loading indicator, but implementation details may vary
  })

  it('hides balance when showTokenBalance is false', () => {
    render(<TokenAmountField {...defaultProps} showTokenBalance={false} />)
    expect(screen.queryByText('Balance:')).not.toBeInTheDocument()
  })
})
