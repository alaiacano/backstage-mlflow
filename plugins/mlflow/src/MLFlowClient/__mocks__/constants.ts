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
import { Entity } from '@backstage/catalog-model';
import { Run, Experiment } from '../../MLFlowClient';

export const experimentIdWithRuns = '1';
export const entityWithRuns: Entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'software',
    annotations: {
      'mlflow.org/experiment_id': experimentIdWithRuns,
    },
  },
  spec: {
    owner: 'guest',
    type: 'mlflow',
    lifecycle: 'development',
  },
};

export const experimentIdWithoutRuns = '2';
export const entityWithoutRuns: Entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'software',
    annotations: {
      'mlflow.org/experiment_id': experimentIdWithoutRuns,
    },
  },
  spec: {
    owner: 'guest',
    type: 'mlflow',
    lifecycle: 'development',
  },
};

export const experimentWithRuns: Experiment = {
  experiment_id: '1',
  name: 'Experiment with no runs',
  artifact_location: 'file:///somewhere',
  last_update_time: 1000,
  creation_time: 1000,
  tags: [],
  lifecycle_stage: 'active',
};

export const experimentWithoutRuns: Experiment = {
  experiment_id: '2',
  name: 'Experiment with no runs',
  artifact_location: 'file:///somewhere',
  last_update_time: 1000,
  creation_time: 1000,
  tags: [],
  lifecycle_stage: 'active',
};

export const exampleRun: Run = {
  info: {
    run_id: 'run ID 1',
    experiment_id: experimentWithRuns.experiment_id,
    user_id: 'user',
    status: 'FINISHED',
    start_time: 10001,
    end_time: 10002,
    artifact_uri: experimentWithRuns.artifact_location,
    lifecycle_stage: 'active',
  },
  data: {
    metrics: [{ key: 'accuracy', value: 0.9, timestamp: '10002', step: 1 }],
    params: [
      { key: 'param1', value: '1.0' },
      { key: 'param2', value: '2.0' },
    ],
    tags: [
      { key: 'tag1', value: 'value1' },
      { key: 'tag2', value: 'value2' },
    ],
  },
};
