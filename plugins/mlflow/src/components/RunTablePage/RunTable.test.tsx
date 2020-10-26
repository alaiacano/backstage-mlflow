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
import { render } from '@testing-library/react';
import { lightTheme } from '@backstage/theme';
import { ThemeProvider } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { EntityContext } from '@backstage/plugin-catalog';
import { Run } from '../../MLFlowClient';
import { RunTable } from './RunTable';
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line jest/no-mocks-import
import {
  entityWithRuns,
  exampleRun,
} from '../../MLFlowClient/__mocks__/constants';

jest.mock('../../MLFlowClient');

describe('<RunTable />', () => {
  const subject = (entity: Entity, runs: Run[], value = {}) => (
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <EntityContext.Provider
          value={{ entity: entity, loading: false, ...value }}
        >
          <RunTable runs={runs} />
        </EntityContext.Provider>
      </MemoryRouter>
    </ThemeProvider>
  );

  it('renders the runs table when there are runs', () => {
    const { getByText } = render(subject(entityWithRuns, [exampleRun]));
    expect(getByText(exampleRun.info.run_id)).toBeInTheDocument();
  });
});
