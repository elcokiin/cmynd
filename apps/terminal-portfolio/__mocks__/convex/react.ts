let callCount = 0

const values: unknown[] = [
  { _id: "test-id" as const, name: "Diego Tenjo", headline: "Software Engineer", philosophy: "Build things that matter", avatarUrl: undefined, about: undefined, socialLinks: undefined, hobbies: undefined, playlist: undefined, createdAt: 0, updatedAt: 0 },
  [],
  [],
  [],
]

export function useQuery() {
  const idx = callCount % values.length
  callCount++
  return values[idx]
}

export function useMutation() {
  return () => Promise.resolve({ threadId: "test-thread" })
}

export function __resetQueryCount() {
  callCount = 0
}
