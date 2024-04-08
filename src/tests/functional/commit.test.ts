import { CreateCommit, UpdateMessageCommit } from '@/repository'
import { cuid } from '@/utils/cuid'
import { prisma } from '@/utils/prisma'

describe('COMMIT', () => {
  it('criar commit com branch ja criada', async () => {
    const actor = 'email@email.com'
    const message = 'Meu commit'
    const branchBeforeUpdate = await prisma.branch.create({ data: { countCommits: 8, name: 'branch old' } })
    const branch = { id: branchBeforeUpdate.id, name: branchBeforeUpdate.name }

    await Promise.all([
      prisma?.events.create({
        data: {
          type: 'BranchCreated',
          streamId: branch.id,
          version: 1,
          actor: 'email@email.com',
          payload: {},
        },
      }),

      prisma?.events.create({
        data: {
          type: 'BranchNameAdded',
          streamId: branch.id,
          version: 2,
          actor: 'email@email.com',
          payload: { name: branch.name },
        },
      }),
    ])

    await CreateCommit(actor, message, branch)

    const events = await prisma?.events.findMany({})

    expect(events?.[0]).toMatchObject({
      type: 'BranchCreated',
      streamId: expect.any(String),
      version: 1,
      actor: 'email@email.com',
    })
    expect(events?.[1]).toMatchObject({
      type: 'BranchNameAdded',
      streamId: expect.any(String),
      version: 2,
      payload: { name: branch.name },
      actor: 'email@email.com',
    })

    expect(events[2]).toMatchObject({
      type: 'CommitCreated',
      streamId: expect.any(String),
      version: 1,
      actor: 'email@email.com',
      payload: { branch },
    })
    expect(events[3]).toMatchObject({
      type: 'CommitMessageAdded',
      streamId: expect.any(String),
      version: 2,
      payload: { message: 'Meu commit' },
      actor: 'email@email.com',
    })

    const branchDb = await prisma.branch.findUnique({ where: { id: branch.id } })

    expect(branchDb?.name).toBe(branch.name)
    expect(branchDb?.countCommits).toBe(9)
  })

  it('editar commit', async () => {
    const actor = 'email@email.com'
    const message = 'Meu commit'

    const commit = await prisma.commitProjection.create({ data: { message } })
    const commitCreatedEvent = await prisma.events.create({
      data: {
        type: 'CommitCreated',
        version: 1,
        payload: { branch: { id: cuid(), name: 'branch' } },
        actor,
        streamId: commit.id,
      },
    })
    const commitAddedMessageEvent = await prisma.events.create({
      data: { type: 'CommitMessageAdded', version: 2, payload: { message }, actor, streamId: commit.id },
    })

    const newMessage = 'other message'

    await UpdateMessageCommit(commit.id, actor, newMessage)

    const events = await prisma?.events.findMany({})

    const commitUpdate = await prisma.commitProjection.findUnique({ where: { id: commit.id } })

    expect(events[0]).toMatchObject({
      type: commitCreatedEvent.type,
      streamId: commitCreatedEvent.streamId,
      version: commitCreatedEvent.version,
      actor: commitCreatedEvent.actor,
    })
    expect(events[1]).toMatchObject({
      type: commitAddedMessageEvent.type,
      streamId: commitAddedMessageEvent.streamId,
      version: commitAddedMessageEvent.version,
      actor: commitAddedMessageEvent.actor,
      payload: commitAddedMessageEvent.payload,
    })
    expect(events[2]).toMatchObject({
      type: 'CommitMessageRemoved',
      streamId: commit.id,
      version: 3,
      actor: 'email@email.com',
    })
    expect(events[3]).toMatchObject({
      type: 'CommitMessageAdded',
      streamId: commit.id,
      version: 4,
      actor: 'email@email.com',
    })

    expect(commitUpdate?.message).toBe(newMessage)
  })

  it('should not create new events and not update the commit with the same already informed', async () => {
    const actor = 'email@email.com'
    const message = 'Meu commit'

    const commit = await prisma.commitProjection.create({ data: { message } })
    const commitCreatedEvent = await prisma.events.create({
      data: {
        type: 'CommitCreated',
        version: 1,
        payload: { branch: { id: cuid(), name: 'branch' } },
        actor,
        streamId: commit.id,
      },
    })
    const commitAddedMessageEvent = await prisma.events.create({
      data: { type: 'CommitMessageAdded', version: 2, payload: { message }, actor, streamId: commit.id },
    })

    const newMessage = message

    await UpdateMessageCommit(commit.id, actor, newMessage)

    const events = await prisma?.events.findMany({})

    const commitUpdate = await prisma.commitProjection.findUnique({ where: { id: commit.id } })

    expect(events[0]).toMatchObject({
      type: commitCreatedEvent.type,
      streamId: commitCreatedEvent.streamId,
      version: commitCreatedEvent.version,
      actor: commitCreatedEvent.actor,
    })
    expect(events[1]).toMatchObject({
      type: commitAddedMessageEvent.type,
      streamId: commitAddedMessageEvent.streamId,
      version: commitAddedMessageEvent.version,
      actor: commitAddedMessageEvent.actor,
      payload: commitAddedMessageEvent.payload,
    })
    expect(events[2]).toBeUndefined()

    expect(commitUpdate?.message).toBe(message)
  })

  it('should throw Commit not created, if there is no events', async () => {
    const actor = 'email@email.com'
    const message = 'Meu commit'

    const commit = await prisma.commitProjection.create({ data: { message } })

    const newMessage = message

    const promise = UpdateMessageCommit(commit.id, actor, newMessage)

    await expect(promise).rejects.toThrow('Commit not created')
  })
})
