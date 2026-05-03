/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
jest.mock('next/link', () => function Link({ children }: { children: React.ReactNode }) { return <a>{children}</a>; });

import * as Sentry from '@sentry/nextjs';
import ErrorPage from './error';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Error boundary', () => {
  it('calls Sentry.captureException with the error on mount', () => {
    const err = new Error('something broke');
    render(<ErrorPage error={err} reset={jest.fn()} />);
    expect(Sentry.captureException).toHaveBeenCalledWith(err);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
