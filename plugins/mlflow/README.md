# mlflow

Welcome to the mlflow plugin!

The goal of this plugin is to integrate MLflow experiments with Backstage's software catalog. [Backstage software catalog model](https://backstage.io/docs/features/software-catalog/software-catalog-overview) so that your ML code can be organized with the data pipelines, backend services, or other Components that make up your ML system. It also adds some additional features and visualizations for tracking and comparing experiments over time.

In addition to integrating experiments with the Backstage catalog, we introduced the concept of Evaluation Sets via tagging standards. It is common to want to compare model metrics that were evaluated against a common set of held out evaluation data (Evaluation Set), and we add that functionality by enforcing conventions. Tagging a run with the tag `{key: 'mlflow.backstage.evaluation_set', value: '<your evaluation set ID>'}` will let you filter and compare model metrics compared against the same Evaluation Set.

## Getting started with the backstage plugin

To use this plugin, you need to configure your MLflow server host in the proxy settings of `app-config.yaml`. It is currently set to `localhost:5000`, which will work on a local mlflow server by running `mlflow server`. You can change this to the host of your production mlflow server.

You can register an MLFlow experiment as a Backstage Component by creating a `component-info.yaml` file in your repo that looks like the one below.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: unique-name-for-this-component
  description: A collection of your ML project.
  annotations:
    # The following annotation should be set to the _string_ (quoted) experiment number.
    # MLflow sometimes users Experiment names and sometimes numeric IDs.
    # This must be the numeric ID (in quotes).
    mlflow.org/experiment: '2'
  tags:
    - machine-learning
    - whatever-else-you-want
spec:
  # the spec type must be set to `mlflow` here!
  type: mlflow
  lifecycle: experimental
  owner: guest
```

Once you have this, you can register the component by clicking Create Component (the `+` on the sidebar), and then "Register Existing Component." Paste a link to the raw yaml file or github URL such as `https://github.com/alaiacano/backstage-mnist/blob/master/component-info.yaml`.

## Features

Backstage will display a list of all Components registered with the type `mlflow`. You can "star" specific experiments to mark them as favorites, or filter by Experiment tag (as defined in your `component-info.yaml`), owner, or any other way of filtering Components.

![List of experiments](screenshots/experiment-list.png)

### Run Comparison Views

When selecting a particular Experiment, you can see a list of all runs and their tags, metrics, and Evaluation Sets. You can filter this view by clicking on a particular Tag or Evaluation Set.

All runs:

![All runs](screenshots/run-table.png)

Filtered by tag `mnist`:

![Filtered by tags](screenshots/tag-filter.png)

You can also use the search query box to put any [mlflow search query](https://www.mlflow.org/docs/latest/search-syntax.html).

![Filtered using search](screenshots/search-filter.png)

In addition, you can view metric trends over time for all runs in this particular Experiment. If you tag Evaluation Sets in your runs, they will show up as filters on the metrics graph so you can be sure to compare models evaluated on the same hold-out set.

![Metrics trend](screenshots/metrics-trend.png)

### Run Details View

When clicking on any Run, you can see more details about the run itself, including start/end time, submission details, parameters, tags, notes, metrics, artifacts, and graphs of metrics produced during model training.

![run details 1](screenshots/run-view-1.png)

Loss metrics in this example were reported via `mlflow.keras.autolog()`. Also note that the artifact browser is not yet fully implemented!

![run details 2](screenshots/run-view-2.png)

## Usage in modeling code

This plugin uses the MLflow tracking API and shouldn't require much change from your usual workflow. See a basic working example [here](https://github.com/alaiacano/backstage-mnist). Some tips for successful use of this plugin are:

- Always set the Experiment Name in the beginning of your run via `mlflow.set_tracking_uri` and `mlflow.set_experiment`. Backstage tracks the `experiment_id` but mlflow makes you specify the corresponding `name` here! The repo linked above has a helper function for extracting the experiment name from the `component-info.yaml` file.
- use `mlflow.set_tag('mlflow.backstage.evaluation_set', MY_EVALUATION_SET)` to record the name or ID of your evaluation set. This isn't required, but will allow you to filter runs in this Experiment for the ones evaluated against this dataset.
- Parent/child runs are not supported yet. If you have a use case for this, please reach out to see how we can support it.
- Using mlflow's `autolog` methods will post training loss metrics during each epoch, which can be viewed from the Run Details page as each epoch finishes.
