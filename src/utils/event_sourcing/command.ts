import Aggregate from './aggreagate'
import Event from './event'

export default abstract class Command {
  protected abstract preValidate(): void
  protected abstract postValidate(): void
  protected abstract execute(version: number): Promise<Event[]>
  protected aggregate: Aggregate<unknown> | null = null

  public withAggregate(aggregate: Aggregate<unknown>) {
    this.aggregate = aggregate
    return this
  }

  public getAggregate(): Aggregate<unknown> | null {
    return this.aggregate
  }

  public async run(): Promise<Event[]> {
    const aggregate = this.getAggregate()

    await Promise.resolve(this.preValidate())
    if (aggregate) {
      await aggregate.load()
    }
    await Promise.resolve(this.postValidate())

    const version = aggregate ? aggregate.getVersion() + 1 : 1

    const events = await this.execute(version)
    if (aggregate) {
      for (const event of events) {
        await aggregate.apply(event)
      }
    }

    return events
  }
}
