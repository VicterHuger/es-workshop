import { CommitCreated } from '../events'
import { Aggregate } from '@/utils/event_sourcing'

type State = {
  countCommits: number
  name: string
  id: string
}

export class BranchAgreggate extends Aggregate<State> {
  public async CommitCreated(event: CommitCreated) {
    if (!this.state) {
      const branchDb = await prisma?.branch.findUnique({ where: { id: event.branch.id } })
      this.state = {
        countCommits: (branchDb?.countCommits ?? 0) + 1,
        id: event.branch.id,
        name: event.branch.name,
      }

      return
    }

    this.state.countCommits = this.state.countCommits ? this.state.countCommits + 1 : 1
    this.state.name = event.branch.name
    this.state.id = event.branch.id
  }
}
