export default {}

declare global {
  interface BaseRunnerProps {
    task: any
    flowId: string
    onEventStart: (props: { flowId: string; event: any; taskId: string }) => Promise<void>
    onEventEnd: (props: { flowId: string; event: any; taskId: string }) => Promise<void>
  }

  interface RunnerFlowsProps extends BaseRunnerProps {
    flows: any[]
    flowsToRun: { flowId: string; eventIds: string[] }[]
    query: string
  }

  interface RunnerEventProps extends BaseRunnerProps {
    events: any[]
    data: any
  }

  interface RunnerComponentProps extends RunnerEventProps {
    event: any
    runEvents?: (props: RunnerEventProps) => Promise<void>
  }
}
