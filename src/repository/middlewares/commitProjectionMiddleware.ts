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

      context.projections.push({
        collectionName: 'commitProjection',
        data: state,
        selector: context.events[0]?.streamId,
      })

      break
    }

    return context
  }
}
