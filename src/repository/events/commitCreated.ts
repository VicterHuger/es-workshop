import { Event } from '@/utils/event_sourcing'

export class CommitCreated implements Event {
  public readonly type = 'CommitCreated'

  constructor(
    public streamId: string,
    public version: number,
    public branch: { id: string; name: string },
    public actor?: string
  ) {}
}
