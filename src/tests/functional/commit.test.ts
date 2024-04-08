import { CreateCommit } from '@/repository'
import { prisma } from '@/utils/prisma'

describe('CRIAR COMMIT', () => {
  it('criar commit', async () => {
    const actor = 'email@email.com'
    const message = 'Meu commit'
    await CreateCommit(actor, message)

    const events = await prisma?.events.findMany({})

    const commit = await prisma.commitProjection.findFirst({})

    expect(events[0]).toMatchObject({
      type: 'CommitCreated',
      streamId: expect.any(String),
      version: 1,
      actor: 'email@email.com',
    })
    expect(events[1]).toMatchObject({
      type: 'CommitMessageAdded',
      streamId: expect.any(String),
      version: 2,
      payload: { message: 'Meu commit' },
      actor: 'email@email.com',
    })

    console.log('events', events)
    console.log('commit', commit)
  })
})
