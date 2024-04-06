import { Aggregate, Event, Fetcher } from '@/utils/event_sourcing'

// Mock implementation of Event
class MyEvent implements Event {
  constructor(
    public streamId: string = 'my-stream-id',
    public readonly version: number = 0,
    public readonly payload: { count: number; description?: string },
    public readonly type: 'MY_EVENT' | 'MY_OTHER_EVENT' = 'MY_EVENT'
  ) {}
}

class MyOtherEvent implements Event {
  constructor(
    public streamId: string = 'my-stream-id',
    public readonly version: number = 0,
    public readonly payload: { count: number; description?: string },
    public readonly type: 'MY_EVENT' | 'MY_OTHER_EVENT' = 'MY_OTHER_EVENT'
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
    this.state.count += event.payload.count as number
  }
}

describe('Aggregate abstract class', () => {
  it('should be able to apply events and increment version', async () => {
    const myAggregate = new MyAggregate().withFetcher(new MyFetcher([])).withInitialState({ count: 0 })
    expect(myAggregate.getVersion()).toBe(0)

    await myAggregate.apply(new MyEvent('my-stream-id', 1, { count: 1 }))
    expect(myAggregate.getVersion()).toBe(1)

    await myAggregate.apply(new MyEvent('my-stream-id', 2, { count: 2 }))
    expect(myAggregate.getVersion()).toBe(2)
  })

  it('should be able to load events from fetcher', async () => {
    const myAggregate = new MyAggregate()
      .withFetcher(
        new MyFetcher([
          new MyEvent('my-stream-id', 1, { count: 1 }),
          new MyEvent('my-stream-id', 2, { count: 2 }),
          new MyOtherEvent('my-stream-id', 3, { count: 3 }),
        ])
      )
      .withInitialState({ count: 0 })

    await myAggregate.load()

    expect(myAggregate.getVersion()).toBe(3)
    expect(myAggregate.getState()).toEqual({ count: 3 })
    expect(myAggregate.getEvents()).toEqual([
      new MyEvent('my-stream-id', 1, { count: 1 }),
      new MyEvent('my-stream-id', 2, { count: 2 }),
      new MyOtherEvent('my-stream-id', 3, { count: 3 }),
    ])
    expect(myAggregate.getFetcher()).toBeInstanceOf(MyFetcher)
  })

  it('should be able to reset state', async () => {
    const myAggregate = new MyAggregate()
      .withFetcher(
        new MyFetcher([new MyEvent('my-stream-id', 1, { count: 1 }), new MyEvent('my-stream-id', 2, { count: 2 })])
      )
      .withInitialState({ count: 0 })
    await myAggregate.apply(new MyEvent('my-stream-id', 1, { count: 1 }))

    myAggregate.reset()

    expect(myAggregate.getVersion()).toBe(0)
    expect(myAggregate.getState()).toEqual({ count: 0 })
    expect(myAggregate.getEvents()).toEqual([])
  })

  it('should do nothing if event handler is not implemented', async () => {
    const myAggregate = new MyAggregate().withFetcher(new MyFetcher([])).withInitialState({ count: 0 })

    const event = new MyEvent('my-stream-id', 1, { count: 1 })

    await myAggregate.apply({ ...event, type: 'NOT_IMPLEMENTED' })

    expect(myAggregate.getVersion()).toBe(1)
    expect(myAggregate.getState()).toEqual({ count: 0 })
    expect(myAggregate.getEvents()).toEqual([])
  })

  it('return as empty state when loading without fetcher', async () => {
    const myAggregate = new MyAggregate().withInitialState({ count: 0 })

    await myAggregate.load()

    expect(myAggregate.getVersion()).toBe(0)
    expect(myAggregate.getState()).toEqual({ count: 0 })
    expect(myAggregate.getEvents()).toEqual([])
  })
})
