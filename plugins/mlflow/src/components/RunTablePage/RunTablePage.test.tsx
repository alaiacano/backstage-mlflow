/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { lightTheme } from '@backstage/theme';
import { ThemeProvider } from '@material-ui/core';
import { EntityContext } from '@backstage/plugin-catalog';
import { Entity } from '@backstage/catalog-model';
import { RunTablePage } from './RunTablePage';
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line jest/no-mocks-import
import {
  experimentIdWithRuns,
  entityWithRuns,
  experimentIdWithoutRuns,
  entityWithoutRuns,
} from '../../MLFlowClient/__mocks__/constants';

jest.mock('../../MLFlowClient');

describe('<RunTablePage />', () => {
  const subject = (
    experimentId: string,
    entity: Entity,
    showTrend: boolean,
    value = {},
  ) => (
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <EntityContext.Provider
          value={{ entity: entity, loading: false, ...value }}
        >
          <RunTablePage experimentId={experimentId} showTrend={showTrend} />
        </EntityContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  );

  it('renders the runs table when there are runs', async () => {
    const { queryByTestId } = render(
      subject(experimentIdWithRuns, entityWithRuns, false),
    );

    await waitFor(() => !queryByTestId('progress'));
    expect(queryByTestId('RunInfoItem')).toBeInTheDocument();
    expect(queryByTestId('RunTable')).toBeInTheDocument();
  });

  it('renders the trend graph table when there are runs', async () => {
    const { queryByTestId } = render(
      subject(experimentIdWithRuns, entityWithRuns, true),
    );

    await waitFor(() => !queryByTestId('progress'));
    expect(queryByTestId('RunInfoItem')).toBeInTheDocument();
    expect(queryByTestId('RunTrend')).toBeInTheDocument();
  });

  it('Does not render the runs table when there are no runs', async () => {
    const { queryByTestId } = render(
      subject(experimentIdWithoutRuns, entityWithoutRuns, false),
    );

    await waitFor(() => !queryByTestId('progress'));
    expect(queryByTestId('RunInfoItem')).toBeInTheDocument();
    expect(queryByTestId('RunTable')).not.toBeInTheDocument();
  });

  it('Does not render the runs trend when there are no runs', async () => {
    const { queryByTestId } = render(
      subject(experimentIdWithoutRuns, entityWithoutRuns, true),
    );

    await waitFor(() => !queryByTestId('progress'));
    expect(queryByTestId('RunInfoItem')).toBeInTheDocument();
    expect(queryByTestId('NoRunsFound')).toBeInTheDocument();
  });
});
