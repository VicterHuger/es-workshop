import { BranchAgreggate, BranchProjectionAgreggate, CommitProjectionAgreggate } from './aggregates'
import { CreateBranchCommand, CreateCommitCommand, UpdateMessageCommitCommand } from './commands'
import { CommitFetcher } from './fetchers'
import { BranchMiddleware } from './middlewares/branchMiddleware'
import { BranchProjectionMiddleware } from './middlewares/branchProjectionMiddleware'
import { CommitProjectionMiddleware } from './middlewares/commitProjectionMiddleware'
import { ContextInitializerMiddleware } from './middlewares/contextInitializer'
import { PersistenceMiddleware } from './middlewares/persistenceMiddleware'
import { Command, EventSourcingDomain } from '@/utils/event_sourcing'

function createDommain(command: Command): EventSourcingDomain {
  const domain = new EventSourcingDomain()

  domain.registerAggregate(new CommitProjectionAgreggate())
  domain.registerAggregate(new BranchAgreggate())
  domain.registerAggregate(new BranchProjectionAgreggate())

  domain.registerMiddleware(new ContextInitializerMiddleware())
  // adicionar middlewares aqui
  domain.registerMiddleware(new CommitProjectionMiddleware())
  domain.registerMiddleware(new BranchMiddleware())
  domain.registerMiddleware(new BranchProjectionMiddleware())

  domain.registerMiddleware(new PersistenceMiddleware())

  domain.withCommand(command)

  return domain
}

//CRIAR BRANCH
export async function CreateBranch(actor: string, name: string): Promise<void> {
  const createBranchCommand = new CreateBranchCommand(actor, name)

  await createDommain(createBranchCommand).run()
}

//CRIAR COMMIT
export async function CreateCommit(
  actor: string,
  message: string,
  branch: { id: string; name: string }
): Promise<void> {
  const createCommitCommand = new CreateCommitCommand(actor, message, branch)

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
