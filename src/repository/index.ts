import { CommitProjectionAgreggate } from './aggregates'
import { CreateCommitCommand } from './commands'
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
