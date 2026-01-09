import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple ResultsChart component for testing
interface ResultsChartProps {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ options, totalVotes }) => {
  const getPercentage = (votes: number) => {
    return totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="results-chart" data-testid="results-chart">
      {options.map((option) => {
        const percentage = getPercentage(option.votes);
        return (
          <div
            key={option.id}
            className="result-row"
            style={{ marginBottom: '16px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span className="option-text">{option.text}</span>
              <span
                className="vote-percentage"
                data-testid={`percentage-${option.id}`}
              >
                {percentage}%
              </span>
            </div>
            <div
              style={{
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                height: '24px',
                overflow: 'hidden',
              }}
            >
              <div
                className="bar"
                data-testid={`bar-${option.id}`}
                style={{
                  backgroundColor: '#3b82f6',
                  height: '100%',
                  width: `${percentage}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}
            >
              {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

describe('ResultsChart', () => {
  describe('Rendering', () => {
    it('should render all options', () => {
      const options = [
        { id: '1', text: 'Option A', votes: 5 },
        { id: '2', text: 'Option B', votes: 3 },
        { id: '3', text: 'Option C', votes: 2 },
      ];

      render(<ResultsChart options={options} totalVotes={10} />);

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('should render vote counts correctly', () => {
      const options = [
        { id: '1', text: 'Yes', votes: 7 },
        { id: '2', text: 'No', votes: 3 },
      ];

      render(<ResultsChart options={options} totalVotes={10} />);

      expect(screen.getByText('7 votes')).toBeInTheDocument();
      expect(screen.getByText('3 votes')).toBeInTheDocument();
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate percentages correctly', () => {
      const options = [
        { id: '1', text: 'Option A', votes: 50 },
        { id: '2', text: 'Option B', votes: 50 },
      ];

      render(<ResultsChart options={options} totalVotes={100} />);

      expect(screen.getByTestId('percentage-1')).toHaveTextContent('50%');
      expect(screen.getByTestId('percentage-2')).toHaveTextContent('50%');
    });

    it('should handle uneven distribution', () => {
      const options = [
        { id: '1', text: 'A', votes: 3 },
        { id: '2', text: 'B', votes: 1 },
      ];

      render(<ResultsChart options={options} totalVotes={4} />);

      expect(screen.getByTestId('percentage-1')).toHaveTextContent('75%');
      expect(screen.getByTestId('percentage-2')).toHaveTextContent('25%');
    });

    it('should handle zero votes', () => {
      const options = [
        { id: '1', text: 'Option A', votes: 0 },
        { id: '2', text: 'Option B', votes: 0 },
      ];

      render(<ResultsChart options={options} totalVotes={0} />);

      expect(screen.getByTestId('percentage-1')).toHaveTextContent('0%');
      expect(screen.getByTestId('percentage-2')).toHaveTextContent('0%');
    });

    it('should round percentages correctly', () => {
      const options = [
        { id: '1', text: 'A', votes: 1 },
        { id: '2', text: 'B', votes: 2 },
      ];

      render(<ResultsChart options={options} totalVotes={3} />);

      // 1/3 = 33.33... rounds to 33
      expect(screen.getByTestId('percentage-1')).toHaveTextContent('33%');
      // 2/3 = 66.66... rounds to 67
      expect(screen.getByTestId('percentage-2')).toHaveTextContent('67%');
    });
  });

  describe('Bar Width', () => {
    it('should set bar width to percentage', () => {
      const options = [{ id: '1', text: 'Option', votes: 60 }];

      render(<ResultsChart options={options} totalVotes={100} />);

      const bar = screen.getByTestId('bar-1');
      expect(bar).toHaveStyle('width: 60%');
    });

    it('should show zero width for zero votes', () => {
      const options = [{ id: '1', text: 'Option', votes: 0 }];

      render(<ResultsChart options={options} totalVotes={10} />);

      const bar = screen.getByTestId('bar-1');
      expect(bar).toHaveStyle('width: 0%');
    });

    it('should show full width for all votes', () => {
      const options = [{ id: '1', text: 'Option', votes: 100 }];

      render(<ResultsChart options={options} totalVotes={100} />);

      const bar = screen.getByTestId('bar-1');
      expect(bar).toHaveStyle('width: 100%');
    });
  });

  describe('Vote Count Display', () => {
    it('should use singular "vote" for 1 vote', () => {
      const options = [{ id: '1', text: 'Option', votes: 1 }];

      render(<ResultsChart options={options} totalVotes={1} />);

      expect(screen.getByText('1 vote')).toBeInTheDocument();
    });

    it('should use plural "votes" for multiple votes', () => {
      const options = [{ id: '1', text: 'Option', votes: 5 }];

      render(<ResultsChart options={options} totalVotes={5} />);

      expect(screen.getByText('5 votes')).toBeInTheDocument();
    });
  });

  describe('Large Result Sets', () => {
    it('should handle 6 options', () => {
      const options = Array.from({ length: 6 }, (_, i) => ({
        id: String(i + 1),
        text: `Option ${i + 1}`,
        votes: 16,
      }));

      render(<ResultsChart options={options} totalVotes={96} />);

      options.forEach((option) => {
        expect(screen.getByText(option.text)).toBeInTheDocument();
      });
    });

    it('should handle 100% winner', () => {
      const options = [
        { id: '1', text: 'Winner', votes: 100 },
        { id: '2', text: 'Loser', votes: 0 },
      ];

      render(<ResultsChart options={options} totalVotes={100} />);

      expect(screen.getByTestId('percentage-1')).toHaveTextContent('100%');
      expect(screen.getByTestId('percentage-2')).toHaveTextContent('0%');
    });
  });
});
