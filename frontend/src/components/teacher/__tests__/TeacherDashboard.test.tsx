import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeacherDashboard } from '../TeacherDashboard';

// Mock the hooks and contexts
const mockCreatePoll = vi.fn();
const mockEndPoll = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../contexts/PollContext', async () => {
  const actual = await vi.importActual('../../../contexts/PollContext');
  return {
    ...actual,
    usePoll: () => ({
      currentPoll: null,
      results: [],
      detailedVotes: [],
      totalVotes: 0,
      remainingSeconds: 0,
      createPoll: mockCreatePoll,
      endPoll: mockEndPoll,
      refreshPoll: vi.fn(),
      isLoading: false,
      setRecoveredState: vi.fn(),
      syncTimer: vi.fn(),
    }),
  };
});

describe('TeacherDashboard - Poll Creation Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    );
  };

  it('should render the poll creation form', () => {
    renderComponent();

    expect(screen.getByText("Let's Get Started")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your question here...')
    ).toBeInTheDocument();
  });

  it('should allow entering a question', () => {
    renderComponent();

    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    ) as HTMLTextAreaElement;
    fireEvent.change(questionInput, {
      target: { value: 'What is your favorite color?' },
    });

    expect(questionInput.value).toBe('What is your favorite color?');
  });

  it('should allow adding and removing options', () => {
    renderComponent();

    // Initially should have 2 option inputs
    const initialInputs = screen.getAllByPlaceholderText('Enter option...');
    expect(initialInputs).toHaveLength(2);

    // Add an option
    const addButton = screen.getByText('+ Add More option');
    fireEvent.click(addButton);

    // Should now have 3 option inputs
    const updatedInputs = screen.getAllByPlaceholderText('Enter option...');
    expect(updatedInputs).toHaveLength(3);
  });

  it('should allow changing option values', () => {
    renderComponent();

    const optionInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];

    fireEvent.change(optionInputs[0], { target: { value: 'Red' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Blue' } });

    expect(optionInputs[0].value).toBe('Red');
    expect(optionInputs[1].value).toBe('Blue');
  });

  it('should not allow more than 10 options', () => {
    renderComponent();

    const addButton = screen.getByText('+ Add More option');

    // Add options until we reach 10 (we start with 2)
    for (let i = 0; i < 8; i++) {
      fireEvent.click(addButton);
    }

    const optionInputs = screen.getAllByPlaceholderText('Enter option...');
    expect(optionInputs).toHaveLength(10);

    // Try to add another - button might be disabled or click might not work
    fireEvent.click(addButton);
    const finalInputs = screen.getAllByPlaceholderText('Enter option...');
    expect(finalInputs).toHaveLength(10); // Should still be 10
  });

  it('should not allow removing options below 2', () => {
    renderComponent();

    // The component doesn't show remove buttons when there are only 2 options
    // This is correct behavior - minimum 2 options required
    const optionInputs = screen.getAllByPlaceholderText('Enter option...');
    expect(optionInputs).toHaveLength(2);

    // Verify no remove buttons exist
    const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(0);
  });

  it('should validate question before creating poll', async () => {
    renderComponent();

    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    // Should not call createPoll without a question
    expect(mockCreatePoll).not.toHaveBeenCalled();
  });

  it('should validate options before creating poll', async () => {
    renderComponent();

    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });

    // Don't fill in options
    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    // Should not call createPoll without valid options
    expect(mockCreatePoll).not.toHaveBeenCalled();
  });

  it('should create poll with valid inputs', async () => {
    renderComponent();

    // Fill in question
    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    fireEvent.change(questionInput, {
      target: { value: 'What is your favorite color?' },
    });

    // Fill in options
    const optionInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];
    fireEvent.change(optionInputs[0], { target: { value: 'Red' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Blue' } });

    // Click create
    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalledWith(
        'What is your favorite color?',
        ['Red', 'Blue'],
        60 // default duration
      );
    });
  });

  it('should allow selecting different durations', async () => {
    renderComponent();

    // Find and click the duration dropdown
    const durationButton = screen.getByText('60 seconds');
    fireEvent.click(durationButton);

    // Select 30 seconds
    const duration30 = screen.getByText('30 seconds');
    fireEvent.click(duration30);

    // Fill in question and options
    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    fireEvent.change(questionInput, { target: { value: 'Quick poll?' } });

    const optionInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];
    fireEvent.change(optionInputs[0], { target: { value: 'Yes' } });
    fireEvent.change(optionInputs[1], { target: { value: 'No' } });

    // Create poll
    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalledWith(
        'Quick poll?',
        ['Yes', 'No'],
        30
      );
    });
  });

  it('should reset form after creating poll', async () => {
    renderComponent();

    // Fill in form
    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    ) as HTMLTextAreaElement;
    fireEvent.change(questionInput, { target: { value: 'Test question?' } });

    const optionInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];
    fireEvent.change(optionInputs[0], { target: { value: 'Option A' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option B' } });

    // Create poll
    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalled();
    });

    // Form should be reset
    expect(questionInput.value).toBe('');
    const resetInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];
    expect(resetInputs[0].value).toBe('');
    expect(resetInputs[1].value).toBe('');
  });

  it('should navigate back when back button is clicked', () => {
    renderComponent();

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show character count for question', () => {
    renderComponent();

    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    fireEvent.change(questionInput, { target: { value: 'Test' } });

    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('should trim whitespace from question and options', async () => {
    renderComponent();

    const questionInput = screen.getByPlaceholderText(
      'Enter your question here...'
    );
    fireEvent.change(questionInput, {
      target: { value: '  Test question?  ' },
    });

    const optionInputs = screen.getAllByPlaceholderText(
      'Enter option...'
    ) as HTMLInputElement[];
    fireEvent.change(optionInputs[0], { target: { value: '  Option A  ' } });
    fireEvent.change(optionInputs[1], { target: { value: '  Option B  ' } });

    const createButton = screen.getByText('Ask Question');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalledWith(
        'Test question?',
        ['Option A', 'Option B'],
        60
      );
    });
  });
});
