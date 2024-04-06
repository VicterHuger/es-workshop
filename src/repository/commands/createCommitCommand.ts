import { CommitCreated, CommitMessageAdded } from '../events'
import { cuid } from '@/utils/cuid'
import { Command, Event } from '@/utils/event_sourcing'

export class CreateCommitCommand extends Command {
  constructor(
    private actor: string,
    private mensagem: string
  ) {
    super()
  }

  protected preValidate(): void {
    if (this.mensagem.length <= 3) {
      throw new Error('Mensagem muito curta, fazer escrever maior que 3 characteres')
    }
  }

  protected postValidate(): void {
    return
  }

  protected async execute(version: number): Promise<Event[]> {
    const streamId = cuid()

    const commitCreated = new CommitCreated(streamId, version, this.actor)

    const commitMessageAdded = new CommitMessageAdded(streamId, version + 1, this.mensagem, this.actor)

    const events: Event[] = [commitCreated, commitMessageAdded]

    return events
  }
}
