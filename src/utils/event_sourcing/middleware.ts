import { DomainContext } from './domain'

export abstract class DomainMiddleware {
  public abstract apply(context: DomainContext): Promise<DomainContext>
}
