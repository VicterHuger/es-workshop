import {
  Aggregate,
  Command,
  DomainContext,
  DomainMiddleware,
  Event,
  EventSourcingDomain,
  Fetcher,
} from '@/utils/event_sourcing'

// Mock implementation of Event
class MyEvent implements Event {
  constructor(
    public streamId: string = 'my-stream-id',
    public readonly version: number = 0,
    public readonly payload: { count: number; description?: string },
    public readonly type: 'MY_EVENT' | 'MY_OTHER_EVENT' = 'MY_EVENT'
  ) {}
}

// Mock implementation of Fetcher
class MyFetcher extends Fetcher {
  constructor(private readonly events: MyEvent[] = []) {
    super()
  }

  public async fetch(): Promise<MyEvent[]> {
    return this.events
  }
}

// A sample implementation of an Aggregate
class MyAggregate extends Aggregate<{ count: number }> {
  public MY_EVENT(event: MyEvent): void {
    this.state.count += event.payload.count
  }

  public MY_OTHER_EVENT(event: MyEvent): void {
    this.state.count += event.payload.count
  }
}

class MyAnotherAggregate extends Aggregate<{ count: number }> {
  public MY_OTHER_EVENT(event: MyEvent): void {
    this.state.count += event.payload.count * 2
  }
}

// A sample implementation of a Command
class MyCommand extends Command {
  constructor(private abc: string) {
    super()
  }

  protected preValidate(): void {
    // Do nothing
  }

  protected postValidate(): void {
    // Do nothing
  }

  protected async execute(version: number): Promise<MyEvent[]> {
    const event = new MyEvent(
      'my-stream-id',
      version,
      {
        count: version,
        description: this.abc,
      },
      'MY_EVENT'
    )

    return [event]
  }
}

describe('EventSourcingDomain', () => {
  it('Should teste event sourcing domain', async () => {
    const domain = new EventSourcingDomain()
    domain.registerAggregate(new MyAggregate())
    domain.registerAggregate(new MyAnotherAggregate())

    const eventStore = new Array(5).fill(null).map((_, i) => new MyEvent('my-stream-id', i, { count: i }))
    const fetcher = new MyFetcher(eventStore)

    class MyValidatorAggregate extends Aggregate<{ count: number }> {
      public MY_EVENT(event: MyEvent): void {
        this.state.count += event.payload.count
      }
    }

    domain.withCommand(
      new MyCommand('xurupita').withAggregate(
        new MyValidatorAggregate()
          .withInitialState({
            count: 0,
          })
          .withFetcher(fetcher)
      )
    )

    class MyMiddleware extends DomainMiddleware {
      public async apply(context: DomainContext): Promise<DomainContext> {
        return context
      }
    }

    domain.registerMiddleware(new MyMiddleware())

    await domain.run()
  })

  it('should throw if a command is not provided', async () => {
    const domain = new EventSourcingDomain()

    await expect(domain.run()).rejects.toThrowError('No command was provided')
  })

  it('should execute a command without an aggreagate', async () => {
    const domain = new EventSourcingDomain()

    const command = new MyCommand('xurupita')

    const context = await domain.withCommand(command).run()

    expect(context.fetchedEventsfromCommandAggregate).toEqual([])
    expect(context.events).toEqual([
      new MyEvent('my-stream-id', 1, {
        count: 1,
        description: 'xurupita',
      }),
    ])
  })
})
