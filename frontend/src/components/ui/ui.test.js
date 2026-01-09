import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, Card, Badge, Input, Modal, Toast, Loading } from '../ui';

describe('UI Components', () => {
  describe('Button Component', () => {
    test('renders with correct variant', () => {
      render(<Button variant="primary">Click me</Button>);
      const button = screen.getByText('Click me');
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle('background-color: var(--color-primary)');
    });

    test('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    test('calls onClick handler', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      screen.getByText('Click').click();
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Card Component', () => {
    test('renders with title and content', () => {
      render(
        <Card title="Test Card">
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('renders with subtitle', () => {
      render(
        <Card title="Title" subtitle="Subtitle">
          Content
        </Card>
      );
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    test('renders with correct variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toBeInTheDocument();
    });

    test('renders with different sizes', () => {
      render(<Badge size="lg">Large Badge</Badge>);
      expect(screen.getByText('Large Badge')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    test('renders input field', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    test('displays error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('handles onChange event', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      input.value = 'test';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Modal Component', () => {
    test('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    test('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} title="Test" onClose={handleClose}>
          Content
        </Modal>
      );
      const closeButton = screen.getByLabelText('Close modal');
      closeButton.click();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Toast Component', () => {
    test('renders when isVisible is true', () => {
      render(
        <Toast isVisible={true} message="Test message" onDismiss={() => {}} />
      );
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('does not render when isVisible is false', () => {
      render(
        <Toast isVisible={false} message="Test message" onDismiss={() => {}} />
      );
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    test('calls onDismiss when close button clicked', () => {
      const handleDismiss = jest.fn();
      render(
        <Toast isVisible={true} message="Test" onDismiss={handleDismiss} />
      );
      const closeButton = screen.getByLabelText('Dismiss notification');
      closeButton.click();
      expect(handleDismiss).toHaveBeenCalled();
    });
  });

  describe('Loading Component', () => {
    test('renders spinner', () => {
      const { container } = render(<Loading />);
      expect(
        container.querySelector('div[style*="animation"]')
      ).toBeInTheDocument();
    });

    test('renders with custom text', () => {
      render(<Loading text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders as overlay', () => {
      const { container } = render(<Loading overlay={true} />);
      const overlay = container.querySelector('[style*="position: fixed"]');
      expect(overlay).toBeInTheDocument();
    });
  });
});
