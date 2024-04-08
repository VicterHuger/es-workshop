import { Event } from '@/utils/event_sourcing'

export class BranchCreated implements Event {
  public readonly type = 'BranchCreated'

  constructor(
    public streamId: string,
    public version: number,
    public actor?: string
  ) {}
}
