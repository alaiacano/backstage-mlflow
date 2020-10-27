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
import React, { useState, useEffect } from 'react';
import { InfoCard, StructuredMetadataTable } from '@backstage/core';
import {
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
} from '@material-ui/core';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Metric, Run, RunTag, EVALUATION_SET_TAG } from '../../MLFlowClient';

type MetricWithRun = {
  runId?: string;
  userId?: string;
  key: string;
  value: number;
  timestamp: number;
  dateString: string;
  step: number;
  evaluationSet?: string;
};

const metricWithRunSortFn = (m1: MetricWithRun, m2: MetricWithRun) => {
  return m1.timestamp - m2.timestamp;
};
function reformatRuns(runs: Run[]): Record<string, MetricWithRun[]> {
  const runMetrics = runs.flatMap(runToTrendMetric);
  const allKeys = new Set(runMetrics.map(rm => rm.key));
  let keyToMetricSeries: Record<string, MetricWithRun[]> = {};
  allKeys.forEach(key => {
    keyToMetricSeries = {
      [key]: runMetrics.filter(rm => rm.key === key).sort(metricWithRunSortFn),
      ...keyToMetricSeries,
    };
  });
  return keyToMetricSeries;
}
function runToTrendMetric(run: Run): MetricWithRun[] {
  const metrics: Metric[] = run.data.metrics || [];
  const tags: RunTag[] = run.data.tags || [];
  return metrics.map(m => {
    return {
      ...m,
      runId: run.info.run_id,
      userId: run.info.user_id,
      timestamp: parseInt(m.timestamp, 10),
      dateString: new Date(parseInt(m.timestamp, 10)).toLocaleString(),
      evaluationSet: tags.find(t => t.key === EVALUATION_SET_TAG)?.value,
    };
  });
}

export const RunTrend = ({ runs }: { runs: Run[] }) => {
  const [allEvalSets, setAllEvalSets] = useState<Set<string>>(new Set([]));
  const [activeEvalSet, setActiveEvalSet] = useState<string>();
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [parsedRuns, setParsedRuns] = useState<Record<string, MetricWithRun[]>>(
    { loading: [] },
  );
  const [trendData, setTrendData] = useState<MetricWithRun[]>([]);

  // THERE ARE THREE STEPS TO MANAGING THE STATE IN HERE:

  // 0. When new runs prop comes in, we parse them into a
  // mapping from (metric name) -> (array of metric values)
  useEffect(() => {
    setParsedRuns(reformatRuns(runs));
    setAllEvalSets(
      new Set(
        runs.flatMap(run =>
          run.data.tags
            .filter(t => t.key === EVALUATION_SET_TAG)
            .map(t => t.value),
        ),
      ),
    );
  }, [runs]);

  useEffect(() => {
    if (activeEvalSet) {
      const newRuns = activeEvalSet
        ? runs.filter(
            r =>
              r.data.tags.filter(
                t => t.key === EVALUATION_SET_TAG && t.value === activeEvalSet,
              ).length > 0,
          )
        : runs;
      setParsedRuns(reformatRuns(newRuns));
    } else {
      // if it becomes inactive, set runs to the full set.
      setParsedRuns(reformatRuns(runs));
    }
  }, [activeEvalSet, runs]);

  // 2. When a person picks a different metric, update selectedMetric
  function updateMetric(metric: string) {
    setSelectedMetric(metric);
  }

  // 3. When parsedRuns OR selectedMetric are changed, refresh the trend data used in the chart.
  useEffect(() => {
    const allMetrics: string[] = Object.keys(parsedRuns);
    setAvailableMetrics(allMetrics);
    if (selectedMetric === '' || !allMetrics.includes(selectedMetric)) {
      setSelectedMetric(allMetrics[0]);
    }
    setTrendData(parsedRuns[selectedMetric]);
  }, [parsedRuns, selectedMetric]);

  const handleESClick = (es: string) => {
    return () => {
      if (activeEvalSet === es) {
        setActiveEvalSet(undefined);
      } else {
        setActiveEvalSet(es);
      }
    };
  };

  const getVariant = (es: String) => {
    if (activeEvalSet && activeEvalSet === es) {
      return undefined;
    }
    return 'outlined';
  };

  return (
    <InfoCard title="Metric trends over time">
      <Grid container direction="column" spacing={3}>
        <Grid item>
          {[...allEvalSets].map((es, key) => (
            <Chip
              onClick={handleESClick(es)}
              variant={getVariant(es)}
              key={key}
              label={es}
            />
          ))}
        </Grid>
        <Grid item>
          <FormControl variant="outlined">
            <Select
              value={selectedMetric}
              onChange={e => updateMetric(e.target.value as string)}
            >
              {availableMetrics.map((metric, k) => {
                return (
                  <MenuItem key={k} value={metric}>
                    {metric}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>Select a metric</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
              <Tooltip content={<CustomTooltip />} />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="dateString" />
              <YAxis />
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: any;
  payload?: any;
  label?: any;
}) => {
  if (active) {
    const metric: MetricWithRun = payload[0].payload;
    const metadata = {
      [metric.key]: metric.value,
      runId: metric.runId,
      userId: metric.userId,
      evaluationSet: metric.evaluationSet || 'none',
    };
    return (
      <div>
        <StructuredMetadataTable metadata={metadata} />
      </div>
    );
  }

  return null;
};
