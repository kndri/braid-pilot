import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../Header'

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />)
    const logo = screen.getByText('braidpilot')
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders call-to-action button', () => {
    render(<Header />)
    
    expect(screen.getByText('Get Started for Free')).toBeInTheDocument()
  })

  it('has correct link hrefs', () => {
    render(<Header />)
    
    const getStartedLink = screen.getByText('Get Started for Free').closest('a')
    expect(getStartedLink).toHaveAttribute('href', '/sign-up')
    
    const pricingLink = screen.getByText('Pricing').closest('a')
    expect(pricingLink).toHaveAttribute('href', '/pricing')
  })
})