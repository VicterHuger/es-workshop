import { CommitProjectionAgreggate } from './aggregates'
import { CreateCommitCommand, UpdateMessageCommitCommand } from './commands'
import { CommitFetcher } from './fetchers'
import { CommitProjectionMiddleware } from './middlewares/commitProjectionMiddleware'
import { ContextInitializerMiddleware } from './middlewares/contextInitializer'
import { PersistenceMiddleware } from './middlewares/persistenceMiddleware'
import { Command, EventSourcingDomain } from '@/utils/event_sourcing'

function createDommain(command: Command): EventSourcingDomain {
  const domain = new EventSourcingDomain()

  domain.registerAggregate(new CommitProjectionAgreggate())

  domain.registerMiddleware(new ContextInitializerMiddleware())
  // adicionar middlewares aqui
  domain.registerMiddleware(new CommitProjectionMiddleware())

  domain.registerMiddleware(new PersistenceMiddleware())

  domain.withCommand(command)

  return domain
}

//CRIAR COMMIT
export async function CreateCommit(actor: string, message: string): Promise<void> {
  const commitProjectionAgreggate = new CommitProjectionAgreggate()
  const createCommitCommand = new CreateCommitCommand(actor, message).withAggregate(commitProjectionAgreggate)

  await createDommain(createCommitCommand).run()
}

//EDITAR MENSAGEM DO COMMIT
export async function UpdateMessageCommit(streamId: string, actor: string, message: string): Promise<void> {
  const fetcher = new CommitFetcher(streamId)
  const commitProjectionAgreggate = new CommitProjectionAgreggate().withFetcher(fetcher)
  const updateCommitCommand = new UpdateMessageCommitCommand(streamId, actor, message).withAggregate(
    commitProjectionAgreggate
  )

  await createDommain(updateCommitCommand).run()
}
