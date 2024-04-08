import { CommitProjectionAgreggate } from '../aggregates'
import { CommitMessageAdded, CommitMessageRemoved } from '../events'
import { Command, Event } from '@/utils/event_sourcing'

export class UpdateMessageCommitCommand extends Command {
  constructor(
    private streamId: string,
    private actor: string,
    private message: string
  ) {
    super()
  }

  protected preValidate(): void {
    if (this.message && this.message.length <= 3) {
      throw new Error('message muito curta, fazer escrever maior que 3 characteres')
    }
  }

  protected postValidate(): void {
    const aggreagate = this.aggregate as CommitProjectionAgreggate
    const state = aggreagate.getState()

    if (!state) {
      throw new Error('Commit not created')
    }
  }

  protected async execute(version: number): Promise<Event[]> {
    const events: Event[] = []
    const aggreagate = this.aggregate as CommitProjectionAgreggate
    const state = aggreagate.getState()

    const isMessageChanged = state?.message !== this.message

    if (isMessageChanged && state?.message) {
      events.push(new CommitMessageRemoved(this.streamId, version, this.actor))
    }

    if (isMessageChanged && this.message) {
      events.push(new CommitMessageAdded(this.streamId, events.length + version, this.message, this.actor))
    }

    return events
  }
}
