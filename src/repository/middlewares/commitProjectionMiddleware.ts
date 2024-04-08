import { CommitProjectionAgreggate } from '../aggregates'
import type { ExtendedContext } from './contextInitializer'
import { DomainMiddleware } from '@/utils/event_sourcing'

export class CommitProjectionMiddleware extends DomainMiddleware {
  public async apply(context: ExtendedContext): Promise<ExtendedContext> {
    for (const agg of context.affectedAggregates.values()) {
      if (!(agg instanceof CommitProjectionAgreggate)) continue

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
            typeof normalizedEvent?.commit === 'object' &&
            normalizedEvent?.commit &&
            'id' in normalizedEvent.commit &&
            typeof normalizedEvent?.commit.id === 'string'
          ) {
            selector = normalizedEvent?.commit?.id
            break
          }
        }
      }

      context.projections.push({
        collectionName: 'commitProjection',
        data: state,
        selector: state?.id || selector,
      })

      break
    }

    return context
  }
}
