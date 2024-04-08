import { BranchCreated, BranchNameAdded, CommitCreated } from '../events'
import { BranchFetcher } from '../fetchers'
import { Aggregate } from '@/utils/event_sourcing'

type State = {
  id: string
  name?: string | null
  countCommits: number
}

export class BranchProjectionAgreggate extends Aggregate<State> {
  public BranchCreated(event: BranchCreated) {
    this.state = { countCommits: 0, id: event.streamId }
  }

  public BranchNameAdded(event: BranchNameAdded) {
    this.state.name = event.name
  }

  public async CommitCreated(event: CommitCreated) {
    if (!this.state) {
      const fetcher = new BranchFetcher(event.branch.id)
      const branchEvents = await fetcher.fetch()

      for (const event of branchEvents) {
        await this.apply(event)
      }

      const state = this.state as State

      if (!state) return

      this.state = {
        ...state,
        countCommits: state?.countCommits && state?.countCommits !== 0 ? state.countCommits + 1 : 1,
      }
      return
    }
    this.state.countCommits = this.state.countCommits + 1
  }
}
