import { CommitCreated, CommitMessageAdded } from '../events'
import { Aggregate } from '@/utils/event_sourcing'

type State = {
  mensagem?: string
}

export class CommitProjectionAgreggate extends Aggregate<State> {
  public CommitCreated(_event: CommitCreated) {
    this.state = {}
  }

  public CommitMessageAdded(event: CommitMessageAdded) {
    this.state.mensagem = event.mensagem
  }
}
