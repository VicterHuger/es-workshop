import { CommitProjectionAgreggate } from './aggregates'
import { CreateCommitCommand } from './commands'
import { Event } from '@/utils/event_sourcing'

//CRIAR COMMIT
export async function CreateCommit(
  actor: string,
  mensagem: string
): Promise<{ events: Event[]; state: Record<string, string> }> {
  const commitProjectionAgreggate = new CommitProjectionAgreggate()
  const createCommitCommand = new CreateCommitCommand(actor, mensagem).withAggregate(commitProjectionAgreggate)

  const events = await createCommitCommand.run()

  for (const event of events) {
    const { streamId, type, version, actor, ...payload } = event
    await prisma?.events.create({
      data: { streamId, type, version, actor, payload },
    })
  }

  const state = commitProjectionAgreggate.getState()

  //TODO: ADD LOGIC TO ADD STATE FOR TABLE

  return { events, state }
}
