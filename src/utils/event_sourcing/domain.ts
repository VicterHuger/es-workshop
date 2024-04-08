import Aggregate from './aggreagate'
import Command from './command'
import Event from './event'
import { DomainMiddleware } from './middleware'

export interface DomainContext {
  affectedAggregates: Map<string, Aggregate<unknown>>
  events: Event[]
  command: Command
  fetchedEventsfromCommandAggregate: Event[]
}

export default class EventSourcingDomain {
  private aggregateRegistry = new Map<string, Aggregate<unknown>>()
  private command: Command | null = null
  private middlewares: Array<DomainMiddleware> = []

  public withCommand(command: Command): this {
    this.command = command
    return this
  }

  public getCommand(): Command | null {
    return this.command
  }

  public registerAggregate(aggregate: Aggregate<unknown>): void {
    this.aggregateRegistry.set(aggregate.constructor.name, aggregate)
  }

  public registerMiddleware(middleware: DomainMiddleware): void {
    this.middlewares.push(middleware)
  }

  public async run(): Promise<DomainContext> {
    const command = this.getCommand()

    if (!command) throw new Error('No command was provided')

    const events = await command.run()

    const affectedAggregates = new Map<string, Aggregate<unknown>>()

    for (const event of events) {
      for (const [aggregateName, aggreagateInstance] of this.aggregateRegistry.entries()) {
        if (aggreagateInstance.hasEvent(event)) {
          affectedAggregates.set(aggregateName, aggreagateInstance)
        }
      }
    }

    const fetchedEventsfromCommandAggregate = command.getAggregate()?.getEvents() ?? []

    let context: DomainContext = {
      affectedAggregates,
      command,
      events,
      fetchedEventsfromCommandAggregate,
    }

    for (const middleware of this.middlewares) {
      context = await middleware.apply(context)
    }

    return context
  }
}
