import { DomainContext, DomainMiddleware } from '@/utils/event_sourcing'

export interface ExtendedContext extends DomainContext {
  projections: Array<{
    collectionName: string
    selector: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  }>
}

export class ContextInitializerMiddleware extends DomainMiddleware {
  public async apply(context: ExtendedContext): Promise<ExtendedContext> {
    context.projections = []

    return context
  }
}
