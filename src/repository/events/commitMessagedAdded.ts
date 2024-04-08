import { Event } from '@/utils/event_sourcing'

export class CommitMessageAdded implements Event {
  public readonly type = 'CommitMessageAdded'

  constructor(
    public streamId: string,
    public version: number,
    public message: string,
    public actor?: string
  ) {}
}
