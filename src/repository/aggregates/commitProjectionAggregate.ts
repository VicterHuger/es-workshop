import { CommitCreated, CommitMessageAdded, CommitMessageRemoved } from '../events'
import { Aggregate } from '@/utils/event_sourcing'

type State = {
  message?: string | null
}

export class CommitProjectionAgreggate extends Aggregate<State> {
  public CommitCreated(_event: CommitCreated) {
    this.state = {}
  }

  public CommitMessageAdded(event: CommitMessageAdded) {
    this.state.message = event.message
  }

  public CommitMessageRemoved(_event: CommitMessageRemoved) {
    this.state.message = null
  }
}
