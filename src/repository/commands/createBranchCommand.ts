import { BranchCreated, BranchNameAdded } from '../events'
import { cuid } from '@/utils/cuid'
import { Command, Event } from '@/utils/event_sourcing'

export class CreateBranchCommand extends Command {
  constructor(
    private actor: string,
    private name: string
  ) {
    super()
  }

  protected preValidate(): void {
    if (this.name.length <= 3) {
      throw new Error('nome muito curto, deve ser maior que 3 caracteres')
    }
  }

  protected postValidate(): void {
    return
  }

  protected async execute(version: number): Promise<Event[]> {
    const streamId = cuid()

    const branchCreated = new BranchCreated(streamId, version, this.actor)

    const branchMessageAdded = new BranchNameAdded(streamId, version + 1, this.name, this.actor)

    const events: Event[] = [branchCreated, branchMessageAdded]

    return events
  }
}
