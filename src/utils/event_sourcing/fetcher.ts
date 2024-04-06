import Event from './event'

export default abstract class Fetcher {
  public abstract fetch(): Promise<Event[]>
}
