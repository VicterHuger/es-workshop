import type { ExtendedContext } from './contextInitializer'
import type { Event } from '@/utils/event_sourcing'
import { DomainMiddleware } from '@/utils/event_sourcing'
import { prisma } from '@/utils/prisma'

const getEventPayload = (instance: Event) => {
  return JSON.parse(JSON.stringify(instance))
}

export class PersistenceMiddleware extends DomainMiddleware {
  public async apply(context: ExtendedContext): Promise<ExtendedContext> {
    await prisma.$transaction(async (tx) => {
      for (const event of context.events) {
        const { streamId, type, version, actor, ...payload } = getEventPayload(event)

        const normalizedPayload = payload?.payload !== undefined ? { ...structuredClone(payload.payload) } : payload

        await tx.events.create({
          data: {
            streamId,
            type,
            version,
            payload: normalizedPayload,
            actor,
          },
        })
      }

      for (const projection of context.projections) {
        if (projection.data === null) {
          await tx[projection.collectionName].delete({ where: { id: projection.selector } })
          continue
        }

        await tx[projection.collectionName].upsert({
          where: { id: projection.selector },
          update: projection.data,
          create: {
            ...projection.data,
            id: projection.selector,
          },
        })
      }
    })

    return context
  }
}
