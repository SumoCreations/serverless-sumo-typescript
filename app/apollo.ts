import { ApolloServer } from "apollo-server-lambda"
import { schema } from "./graphql"
import { localeFromLanguage } from "./locales"

const server = new ApolloServer({
  context: ({ event }) => ({
    locale: localeFromLanguage(event.headers["Accept-Language"])
  }),
  playground: {
    settings: {
      "editor.theme": "light",
    },
  },
  schema,
})

export const graphqlHandler = server.createHandler({
  cors: {
    credentials: true,
    origin: true,
  },
})
