import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders healthy badge', () => {
    render(<StatusBadge status="healthy" />)
    expect(screen.getByText('healthy')).toBeTruthy()
  })
})
