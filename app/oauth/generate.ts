import * as jwt from "jsonwebtoken"
import { User } from "../models"
import { getDynamoClient } from "../util"
import { verifyUser } from "./verify"

export interface ITokenInput {
  userId: string
}

export interface ITokenOutput {
  token: string
  refresh: string
  expiresIn: number
}

export interface IRefreshToken {
  userId: string
  refresh: boolean
  iat: number
  exp: number
}

const client = getDynamoClient()
export const SUPPORTED_ALGORITHM = "HS512"

/**
 * Generates a JWT access and JWT refresh token.
 * @param input An object used to assign credentials for the token's payload.
 */
export const generate = (input: ITokenInput): ITokenOutput => {
  const { userId } = input
  const token = jwt.sign(
    {
      userId,
    },
    process.env.OAUTH_SIGNATURE,
    {
      algorithm: SUPPORTED_ALGORITHM,
      expiresIn: process.env.ACCESS_TOKEN_LIFESPAN,
    }
  )
  const refresh = jwt.sign(
    {
      refresh: true,
      userId,
    },
    process.env.OAUTH_SIGNATURE,
    {
      algorithm: SUPPORTED_ALGORITHM,
      expiresIn: process.env.REFRESH_TOKEN_LIFESPAN,
    }
  )
  return {
    expiresIn: parseInt(process.env.ACCESS_TOKEN_LIFESPAN, 0),
    refresh,
    token,
  }
}

/**
 * Validates and returns the content of a JWT signed by this
 * app.
 * @param token A JWT token to verify and decode.
 */
export const verifyAndDecode = (token: string): IRefreshToken | null => {
  try {
    const result = jwt.verify(token, process.env.OAUTH_SIGNATURE, {
      algorithms: [SUPPORTED_ALGORITHM],
    })
    if (typeof result === "string") {
      return null
    } else {
      return result as IRefreshToken
    }
  } catch {
    return null
  }
}

/**
 * Generates a fresh access and refresh token based on password credentials.
 * @param email The email address used to identify the user.
 * @param password The password associated to that user account.
 */
export const generateTokenFromPassword = async (
  email: string,
  password: string
): Promise<ITokenOutput | null> => {
  const user = await verifyUser(email, password)
  if (!user) {
    return null
  }
  return generate({ userId: user.partitionKey })
}

/**
 * Writes a JWT string to a lookup table of previously used tokens.
 * Throws an exception if the token already exists.
 * @param token A JWT string to add to the blacklist.
 */
const blacklistToken = async (token: string) => {
  const params = {
    ConditionExpression: "attribute_not_exists(id)",
    Item: { id: token },
    TableName: process.env.DYNAMODB_TOKEN_LOOKUP_TABLE,
  }
  await client.put(params).promise()
}

/**
 * Generates a fresh access and refresh token based on refresh token.
 * @param refreshToken A JWT refresh token.
 */
export const generateTokenFromRefreshToken = async (
  refreshToken: string
): Promise<ITokenOutput | null> => {
  const token = verifyAndDecode(refreshToken)
  if (!token) {
    return null
  }
  const { refresh, userId } = token as IRefreshToken
  if (!refresh) {
    return null
  }
  if (!(await User.find(userId))) {
    return null
  }
  try {
    await blacklistToken(refreshToken)
  } catch (e) {
    return null
  }
  return generate({ userId })
}
