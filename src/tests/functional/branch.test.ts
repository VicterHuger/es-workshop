import { CreateBranch, CreateCommit } from '@/repository'
import { cuid } from '@/utils/cuid'

describe('BRANCH', () => {
  it('criar branch', async () => {
    const actor = 'email@email.com'
    const name = 'develop'
    await CreateBranch(actor, name)

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
      payload: { name },
      actor: 'email@email.com',
    })

    const branchDb = await prisma?.branchProjection.findFirst({})

    expect(branchDb?.name).toBe(name)
    expect(branchDb?.countCommits).toBe(0)
  })

  it('criar commit e alterar numero de commits na branch', async () => {
    const actor = 'email@email.com'
    const name = 'develop'
    const branch = { id: cuid(), name }

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

      prisma?.branchProjection.create({
        data: {
          id: branch.id,
          name: branch.name,
          countCommits: 0,
        },
      }),
    ])

    await CreateCommit(actor, 'Meu commit', branch)

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
      payload: { name },
      actor: 'email@email.com',
    })

    expect(events?.[2]).toMatchObject({
      type: 'CommitCreated',
      streamId: expect.any(String),
      version: 1,
      payload: { branch },
      actor: 'email@email.com',
    })

    expect(events?.[3]).toMatchObject({
      type: 'CommitMessageAdded',
      streamId: expect.any(String),
      version: 2,
      payload: { message: 'Meu commit' },
      actor: 'email@email.com',
    })

    const branchDb = await prisma?.branchProjection.findFirst({})

    const commit = await prisma?.commitProjection.findFirst({})

    expect(branchDb?.name).toBe(name)
    expect(branchDb?.countCommits).toBe(1)

    expect(commit?.message).toBe('Meu commit')
  })
})
