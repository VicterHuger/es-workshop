import { Event } from '@/utils/event_sourcing'

export class CommitMessageRemoved implements Event {
  public readonly type = 'CommitMessageRemoved'

  constructor(
    public streamId: string,
    public version: number,
    public actor?: string
  ) {}
}
