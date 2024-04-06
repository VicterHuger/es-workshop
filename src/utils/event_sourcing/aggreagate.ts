import Event from './event'
import Fetcher from './fetcher'

export default abstract class Aggregate<S> {
  protected version = 0
  protected events: Event[] = []
  protected fetcher: Fetcher | null = null
  protected state = null as S
  protected originalState = null as S

  public withInitialState(initialState: S): this {
    this.state = initialState
    this.originalState = structuredClone(initialState)
    return this
  }

  public withFetcher(fetcher: Fetcher): this {
    this.fetcher = fetcher
    return this
  }

  public getFetcher(): Fetcher | null {
    return this.fetcher
  }

  public async apply(event: Event): Promise<this> {
    const handler: (event: Event) => Promise<void> = this[event.type]
    if (handler) {
      await handler.call(this, event)
    }
    this.version = this.version + 1
    return this
  }

  public async load(): Promise<this> {
    if (this.fetcher) {
      const events = await this.fetcher.fetch()
      await this.replay(events)
    }
    return this
  }

  public hasEvent(event: Event): boolean {
    return Boolean(this[event.type])
  }

  public getState(): S {
    return this.state
  }

  public getVersion(): number {
    return this.version
  }

  public getEvents(): Event[] {
    return this.events
  }

  public reset(): void {
    this.state = structuredClone(this.originalState)
    this.version = 0
    this.events = []
  }

  public async replay(events: Event[]): Promise<this> {
    this.reset()
    this.events = events
    for (const event of events) {
      await this.apply(event)
    }

    return this
  }
}
