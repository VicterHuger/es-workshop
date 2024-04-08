import { Event, Fetcher } from '@/utils/event_sourcing'

export class CommitFetcher extends Fetcher {
  constructor(private streamId: string) {
    super()
  }

  public async fetch(): Promise<Event[]> {
    const persistedEvents = await prisma?.events.findMany({
      where: {
        streamId: this.streamId,
      },
      orderBy: { version: 'asc' },
      select: { actor: true, streamId: true, type: true, version: true, payload: true },
    })

    const normalizedEvents = persistedEvents?.map(({ payload, ...data }) => ({
      ...data,
      ...(payload as Record<string, unknown>),
    })) as Event[]

    return normalizedEvents || []
  }
}
