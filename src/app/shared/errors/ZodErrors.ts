import { $ZodIssue } from "zod/v4/core"

export const getZodErrorMessage = (issues: $ZodIssue[]): string => {
  return issues
    .flatMap(issue => `[${issue.path}]: ${issue.message}`)
    .join('; ')
}
