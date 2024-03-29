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
import { useAsync } from 'react-use';
import { InfoCard, Progress, StructuredMetadataTable } from '@backstage/core';
import { ArtifactList } from '../../MLFlowClient';
import { mlFlowClient } from '../../index';

type RunArtifactsProps = {
  runId: string;
};
const RunArtifacts = ({ runId }: RunArtifactsProps) => {
  const { loading, value } = useAsync(async (): Promise<ArtifactList> => {
    return mlFlowClient.listArtifacts(runId);
  }, []);

  if (loading) {
    return <Progress />;
  }

  const metadataInfo = {
    artifactLocation: value?.root_uri,
    files: (
      <ul>
        {value?.files
          .filter(f => !f.is_dir)
          .map((f, k) => (
            <li key={k}>{f.path}</li>
          ))}
      </ul>
    ),
    directories: (
      <ul>
        {value?.files
          .filter(f => f.is_dir)
          .map((f, k) => (
            <li key={k}>{f.path}</li>
          ))}
      </ul>
    ),
  };

  return (
    <InfoCard
      title="File Artifacts"
      subheader="Anyone want to build a file browser?"
    >
      <StructuredMetadataTable metadata={metadataInfo} />
    </InfoCard>
  );
};

export default RunArtifacts;
