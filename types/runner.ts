export default {}

declare global {
  type OnEventStartProps = {
    flowId: string
    event: any
    taskId: string
  }

  type OnEventEndProps = {
    event: any
    taskId: string
    setRunnerState?: Function
  }

  interface BaseRunnerProps {
    task: any
    flowId?: string
    onEventStart: (props: OnEventStartProps) => Promise<void>
    onEventEnd: (props: OnEventEndProps) => Promise<void>
  }

  interface ExecuteTaskProp extends BaseRunnerProps {
    flow: { flowId: string; eventIds: string[] } & any
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

  interface FlowsRetrieval {
    flowId: string
    flows: any[]
    query: string
  }

  type Flow = {
    id: string
    name: string
    description: string
    events: any[]
    eventIds: string[]
  }

  type QueuedItem =  {
    flow: Flow
    task: any
    query: string
    eventsCompleted: string[]
  }

  type RunnerState = {
    runQueue: QueuedItem[]
    runningFlow: QueuedItem | null
  }
}
