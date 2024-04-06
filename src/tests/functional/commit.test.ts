import { CreateCommit } from '@/repository'
import { prisma } from '@/utils/prisma'

describe('CRIAR COMMIT', () => {
  it('criar commit', async () => {
    const actor = 'email@email.com'
    const mensagem = 'Meu commit'
    const result = await CreateCommit(actor, mensagem)

    const events = await prisma?.events.findMany({
      where: { streamId: result.events?.[0].streamId },
      orderBy: { version: 'asc' },
    })

    expect(result.state).toStrictEqual({ mensagem })
    expect(result.events[0]).toMatchObject({
      type: 'CommitCreated',
      streamId: expect.any(String),
      version: 1,
      actor: 'email@email.com',
    })
    expect(result.events[1]).toMatchObject({
      type: 'CommitMessageAdded',
      streamId: expect.any(String),
      version: 2,
      mensagem: 'Meu commit',
      actor: 'email@email.com',
    })

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
      payload: { mensagem: 'Meu commit' },
      actor: 'email@email.com',
    })
  })
})
