import { render, screen, fireEvent } from '../../test/utils'
import '@testing-library/jest-dom'
import TransactionButton from '../TransactionButton'

describe('TransactionButton', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with children content', () => {
    render(
      <TransactionButton onClickAction={mockOnClick}>
        Test Button
      </TransactionButton>
    )
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('calls onClickAction when clicked', () => {
    render(
      <TransactionButton onClickAction={mockOnClick}>
        Test Button
      </TransactionButton>
    )
    
    fireEvent.click(screen.getByText('Test Button'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner when loading prop is true', () => {
    render(
      <TransactionButton onClickAction={mockOnClick} loading={true}>
        Test Button
      </TransactionButton>
    )
    
    expect(screen.getByText('Test Button')).toBeInTheDocument()
    const loadingSpinner = screen.getByTestId('loading-spinner')
    expect(loadingSpinner).toHaveClass('loading loading-spinner')
  })

  it('disables button when disabled prop is true', () => {
    render(
      <TransactionButton onClickAction={mockOnClick} disabled={true}>
        Test Button
      </TransactionButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('displays error message when provided', () => {
    const errorMessage = 'Transaction failed'
    render(
      <TransactionButton onClickAction={mockOnClick} errorMessage={errorMessage}>
        Test Button
      </TransactionButton>
    )
    
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
  })

  it('does not display error message when not provided', () => {
    render(
      <TransactionButton onClickAction={mockOnClick}>
        Test Button
      </TransactionButton>
    )
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
