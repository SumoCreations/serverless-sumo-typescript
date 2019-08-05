import { gql } from "apollo-server-lambda"

export const typeDefs = gql`
  """
  A registered user object from API. Could be a customer, admin, or partner account.
  """
  type User {
    """
    The unique identifier for this user
    """
    id: ID!
    """
    The email address for this user.
    """
    email: String!
    """
    The actual first name of the user.
    """
    firstName: String
    """
    The actual last name of the user.
    """
    lastName: String
  }

  type ValidationError {
    """
    A path indicating the attribute that failed validation.
    """
    path: String!, 
    """
    A brief description of why the specified attribute failed validation.
    """
    message: String!
  }
  
  """
  The result of a mutation applied to a user.
  """
  type UserMutationOutput {
    """
    The resulting user if the operation was successful.
    """
    user: User
    """
    Any validation errors encountered while running the mutation.
    """
    errors: [ValidationError]
    """
    A simple boolean indicating whether or not the operation was successful.
    """
    success: Boolean!
  }

  type Query {
    """
    All users in the system
    """
    users: [User]
    """
    A specific user in the system via ID.
    """
    user(id: String!): User
    """
    A specific user in the system via email address.
    """
    userWithEmail(email: String!): User
  }

  """
  A set of fields used to create or update a user.
  """
  input NewUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  """
  A set of fields used to create or update a user.
  """
  input ExistingUserInput {
    id: ID!
    email: String!
    password: String
    firstName: String!
    lastName: String!
  }

  type Mutation {
    """
    Creates a new authenticatable user.
    """
    createUser(
      userInput: NewUserInput!
    ): UserMutationOutput!

    """
    Updates an existing user.
    """
    updateUser(
      userInput: ExistingUserInput!
    ): UserMutationOutput!

    """
    Removes an existing user.
    """
    destroyUser(
      id: String!
    ): UserMutationOutput!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`
