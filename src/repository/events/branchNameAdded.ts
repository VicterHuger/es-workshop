import { Event } from '@/utils/event_sourcing'

export class BranchNameAdded implements Event {
  public readonly type = 'BranchNameAdded'

  constructor(
    public streamId: string,
    public version: number,
    public name: string,
    public actor?: string
  ) {}
}
