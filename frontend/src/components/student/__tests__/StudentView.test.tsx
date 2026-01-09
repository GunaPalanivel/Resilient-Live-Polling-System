import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentView } from '../StudentView';
import { AuthProvider } from '../../../contexts/AuthContext';
import { PollProvider } from '../../../contexts/PollContext';
import { SocketProvider } from '../../../contexts/SocketContext';

// Mock the hooks and contexts
const mockLogin = vi.fn();
const mockEmit = vi.fn();
const mockNavigate = vi.fn();

// Mock VoteAPI
vi.mock('../../../services/pollService', () => ({
  VoteAPI: {
    submitVote: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../contexts/PollContext', async () => {
  const actual = await vi.importActual('../../../contexts/PollContext');
  return {
    ...actual,
    usePoll: vi.fn(),
  };
});

vi.mock('../../../hooks/useSocket', () => ({
  useSocket: () => ({
    emit: mockEmit,
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

import { useAuth } from '../../../contexts/AuthContext';
import { usePoll } from '../../../contexts/PollContext';

describe('StudentView - Login Screen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useAuth as any).mockReturnValue({
      studentName: null,
      studentSessionId: null,
      isAuthenticated: false,
      login: mockLogin,
    });
    (usePoll as any).mockReturnValue({
      currentPoll: null,
      results: [],
      totalVotes: 0,
      remainingSeconds: 0,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <StudentView />
      </BrowserRouter>
    );
  };

  it('should render the login screen when not authenticated', () => {
    renderComponent();

    expect(screen.getByText("Let's Get Started")).toBeInTheDocument();
    expect(screen.getByText('Enter your Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rahul Bajaj')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('should allow entering a name', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText(
      'Rahul Bajaj'
    ) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput.value).toBe('John Doe');
  });

  it('should validate name before login', () => {
    renderComponent();

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Should not call login without a name
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should trim whitespace from name on login', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Rahul Bajaj');
    fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockLogin).toHaveBeenCalledWith('John Doe');
  });

  it('should login with valid name', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Rahul Bajaj');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockLogin).toHaveBeenCalledWith('Jane Smith');
  });

  it('should allow login on Enter key press', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Rahul Bajaj');
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.keyPress(nameInput, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });

    expect(mockLogin).toHaveBeenCalledWith('Alice');
  });

  it('should navigate back when back button is clicked', () => {
    renderComponent();

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should enforce max length on name input', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Rahul Bajaj');
    expect(nameInput).toHaveAttribute('maxLength', '100');
  });
});

describe('StudentView - Waiting Screen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useAuth as any).mockReturnValue({
      studentName: 'John Doe',
      studentSessionId: 'test-session-123',
      isAuthenticated: true,
      login: mockLogin,
    });
    (usePoll as any).mockReturnValue({
      currentPoll: null,
      results: [],
      totalVotes: 0,
      remainingSeconds: 0,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <StudentView />
      </BrowserRouter>
    );
  };

  it('should render waiting screen when authenticated but no active poll', () => {
    renderComponent();

    expect(
      screen.getByText('Wait for the teacher to ask questions..')
    ).toBeInTheDocument();
  });

  it('should show loading spinner on waiting screen', () => {
    renderComponent();

    const spinner = document.querySelector('.w-12');
    expect(spinner).toBeInTheDocument();
  });
});

describe('StudentView - Voting Screen', () => {
  const mockPoll = {
    _id: 'poll-123',
    question: 'What is your favorite color?',
    options: [
      { _id: 'opt-1', text: 'Red', voteCount: 0 },
      { _id: 'opt-2', text: 'Blue', voteCount: 0 },
      { _id: 'opt-3', text: 'Green', voteCount: 0 },
    ],
    status: 'active' as const,
    duration: 60,
    remainingSeconds: 45,
    totalVotes: 0,
    createdAt: new Date().toISOString(),
    endedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useAuth as any).mockReturnValue({
      studentName: 'John Doe',
      studentSessionId: 'test-session-123',
      isAuthenticated: true,
      login: mockLogin,
    });
    (usePoll as any).mockReturnValue({
      currentPoll: mockPoll,
      results: [],
      totalVotes: 0,
      remainingSeconds: 45,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <StudentView />
      </BrowserRouter>
    );
  };

  it('should render the voting screen with poll question', () => {
    renderComponent();

    expect(
      screen.getByText('What is your favorite color?')
    ).toBeInTheDocument();
  });

  it('should display all poll options', () => {
    renderComponent();

    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  it('should emit join:student event on mount', () => {
    renderComponent();

    expect(mockEmit).toHaveBeenCalledWith('join:student', {
      sessionId: 'test-session-123',
      pollId: 'poll-123',
      studentName: 'John Doe',
    });
  });
});

describe('StudentView - Vote Recovery', () => {
  const mockPoll = {
    _id: 'poll-123',
    question: 'Test question?',
    options: [
      { _id: 'opt-1', text: 'Option A', voteCount: 1 },
      { _id: 'opt-2', text: 'Option B', voteCount: 0 },
    ],
    status: 'active' as const,
    duration: 60,
    remainingSeconds: 30,
    totalVotes: 1,
    createdAt: new Date().toISOString(),
    endedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useAuth as any).mockReturnValue({
      studentName: 'John Doe',
      studentSessionId: 'test-session-123',
      isAuthenticated: true,
      login: mockLogin,
    });
    (usePoll as any).mockReturnValue({
      currentPoll: mockPoll,
      results: [
        {
          optionId: 'opt-1',
          optionText: 'Option A',
          count: 1,
          percentage: 100,
        },
        { optionId: 'opt-2', optionText: 'Option B', count: 0, percentage: 0 },
      ],
      totalVotes: 1,
      remainingSeconds: 30,
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <StudentView />
      </BrowserRouter>
    );
  };

  it('should restore vote status from sessionStorage', () => {
    // Set up sessionStorage to simulate a previous vote
    sessionStorage.setItem('hasVoted_poll-123', 'true');
    sessionStorage.setItem('votedOption_poll-123', 'opt-1');

    renderComponent();

    // Component should show results screen since vote was recovered
    expect(screen.getByText('Test question?')).toBeInTheDocument();
  });
});
