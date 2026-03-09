import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

const { testTokenValidity } = vi.hoisted(() => ({
  testTokenValidity: vi.fn(),
}));

vi.mock('./services/github/session', () => ({
  testTokenValidity,
}));

vi.mock('./components/dashboard/CustomizableDashboard', () => ({
  default: () => <div>Custom dashboard mock</div>,
}));

vi.mock('./components/Dashboard', () => ({
  default: () => <div>Standard dashboard mock</div>,
}));

vi.mock('./components/SearchPage', () => ({
  default: () => <div>Search page mock</div>,
}));

vi.mock('./components/NotificationCenter', () => ({
  default: () => <div>Notification center mock</div>,
}));

vi.mock('./components/UnifiedSearch', () => ({
  default: () => <button type="button">Unified search mock</button>,
}));

vi.mock('./components/CommandPalette', () => ({
  default: () => null,
}));

import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
  testTokenValidity.mockReset();
});

test('renders the GitHub dashboard login screen', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /github dashboard/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /sign in with a github token/i })
  ).toBeInTheDocument();
});

test('authenticates into the in-memory session and supports logout', async () => {
  const user = userEvent.setup();
  testTokenValidity.mockResolvedValue(true);

  render(<App />);

  await user.type(
    screen.getByLabelText(/personal access token/i),
    'github_pat_test'
  );
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));

  expect(await screen.findByText(/custom dashboard mock/i)).toBeInTheDocument();

  act(() => {
    window.dispatchEvent(new Event('github-dashboard:logout'));
  });

  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: /sign in with a github token/i })
    ).toBeInTheDocument();
  });
});
