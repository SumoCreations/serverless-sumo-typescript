import { makeExecutableSchema, mergeSchemas } from "apollo-server-lambda"
import * as users from "./users"

export const schemas = [users]
export const schema = mergeSchemas({
  schemas: schemas.map(({ typeDefs, resolvers }) =>
    makeExecutableSchema({ typeDefs, resolvers })
  ),
})
