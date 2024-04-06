import { CreateCommit } from '@/repository'
import { Aggregate, Command, Event, Fetcher } from '@/utils/event_sourcing'

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
}

// A sample implementation of a Command
class MyCommand extends Command {
  protected preValidate(): void {
    // Do nothing
  }

  protected postValidate(): void {
    // Do nothing
  }

  protected async execute(version: number): Promise<MyEvent[]> {
    return [new MyEvent('my-stream-id', version, { count: 1 })]
  }
}

describe('Command abstract class', () => {
  it('should be able to run a command and return events', async () => {
    const myCommand = new MyCommand()

    const events = await myCommand.run()

    expect(events).toEqual([new MyEvent('my-stream-id', 1, { count: 1 })])
  })

  it('should call preValidate and postValidate at the appropriate times', async () => {
    const myCommand = new MyCommand()

    // Spy on preValidate and postValidate methods
    const spyPreValidate = jest.spyOn(myCommand, 'preValidate' as never)
    const spyPostValidate = jest.spyOn(myCommand, 'postValidate' as never)

    await myCommand.run()

    expect(spyPreValidate).toHaveBeenCalled()
    expect(spyPostValidate).toHaveBeenCalled()
  })

  it('should update the aggregate state after executing a command', async () => {
    const myAggregate = new MyAggregate().withFetcher(new MyFetcher([])).withInitialState({ count: 0 })
    const myCommand = new MyCommand().withAggregate(myAggregate)

    await myCommand.run()

    expect(myAggregate.getState().count).toEqual(0 + 1) // initialCount + 1
  })

  it('should throw an error if preValidate or postValidate fail', async () => {
    const myCommand = new MyCommand()

    // Force preValidate to fail
    jest.spyOn(myCommand, 'preValidate' as never).mockImplementation(() => {
      throw new Error('preValidate failed')
    })

    await expect(myCommand.run()).rejects.toThrow('preValidate failed')

    // Reset the spy and force postValidate to fail
    jest.spyOn(myCommand, 'preValidate' as never).mockImplementation(jest.fn() as never)
    jest.spyOn(myCommand, 'postValidate' as never).mockImplementation(() => {
      throw new Error('postValidate failed')
    })

    await expect(myCommand.run()).rejects.toThrow('postValidate failed')
  })

  it('should throw an error if execute fails', async () => {
    const myCommand = new MyCommand()

    // Force execute to fail
    jest.spyOn(myCommand, 'execute' as never).mockRejectedValue(new Error('execute failed') as never)

    await expect(myCommand.run()).rejects.toThrow('execute failed')
  })
})
