export default interface Event {
  type: string
  streamId: string
  version: number
  actor?: string
}
