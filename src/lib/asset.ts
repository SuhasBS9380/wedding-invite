/** Resolve a path under /public (works with any Vite `base`). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
