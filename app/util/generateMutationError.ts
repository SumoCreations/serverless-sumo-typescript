interface IMutationError {
  path: string
  message: string
}

interface IMutationErrorOutput {
  success: boolean,
  errors: IMutationError[]
}

/**
 * Processes an array of errors so that they can be returned by the GraphQL schema.
 * @param errors A standardized mutation error utilized in the GraphQL API.
 */
export const generateMutationError = (errors: IMutationError[]): IMutationErrorOutput => ({
  errors,
  success: false,
})