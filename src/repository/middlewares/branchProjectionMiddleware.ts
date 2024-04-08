import { BranchProjectionAgreggate } from '../aggregates'
import type { ExtendedContext } from './contextInitializer'
import { DomainMiddleware } from '@/utils/event_sourcing'

export class BranchProjectionMiddleware extends DomainMiddleware {
  public async apply(context: ExtendedContext): Promise<ExtendedContext> {
    for (const agg of context.affectedAggregates.values()) {
      if (!(agg instanceof BranchProjectionAgreggate)) continue

      const replayed = await agg.replay(context.fetchedEventsfromCommandAggregate)

      for (const event of context.events) {
        await replayed.apply(event)
      }

      const state = replayed.getState()

      let selector = ''
      if (!state?.id) {
        for (const event of context.events) {
          const normalizedEvent = event as unknown as Event & Record<string, unknown>

          if (
            typeof normalizedEvent?.branch === 'object' &&
            normalizedEvent?.branch &&
            'id' in normalizedEvent.branch &&
            typeof normalizedEvent?.branch.id === 'string'
          ) {
            selector = normalizedEvent?.branch?.id
            break
          }
        }
      }

      context.projections.push({
        collectionName: 'branchProjection',
        data: state,
        selector: state?.id || selector,
      })

      break
    }

    return context
  }
}
