import * as jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"
import { User } from "../models"
import {
  generate,
  generateTokenFromPassword,
  generateTokenFromRefreshToken,
  SUPPORTED_ALGORITHM,
} from "./generate"

const userId = uuid()
const email = "generate-user-test@example.com"
const password = "thisisjustatest"

describe("generate", () => {
  test("should generate an access token with the associated user's ID", () => {
    const { token } = generate({ userId })
    const decoded = jwt.decode(token) as any
    expect(decoded.userId).toBe(userId)
  })

  test("should generate a refresh token with the associated user's ID", () => {
    const { refresh } = generate({ userId })
    const decoded = jwt.decode(refresh) as any
    expect(decoded.userId).toBe(userId)
  })

  test("should generate a refresh attribute", () => {
    const { refresh } = generate({ userId })
    const decoded = jwt.decode(refresh) as any
    expect(decoded.refresh).toBe(true)
  })
})

describe("generate from credentials", () => {
  beforeAll(async () => {
    return await User.create({
      email,
      firstName: "Jim",
      lastName: "Jeffers",
      password,
    })
  })

  describe("generateTokenFromPassword", () => {
    test("should generate tokens given valid credentials", async () => {
      expect.assertions(3)
      const tokens = await generateTokenFromPassword(email, password)
      expect(tokens).not.toBeNull()
      expect(tokens.token).toBeDefined()
      expect(tokens.refresh).toBeDefined()
    })

    test("should not generate tokens if given invalid email", async () => {
      expect.assertions(1)
      const tokens = await generateTokenFromPassword(
        "email@doesnotexist.com",
        password
      )
      expect(tokens).toBeNull()
    })

    test("should not generate tokens if given invalid credentials", async () => {
      expect.assertions(1)
      const tokens = await generateTokenFromPassword(email, "att3mpt3dh4x0rs")
      expect(tokens).toBeNull()
    })
  })

  describe("generateTokenFromRefreshToken", () => {
    const generateValidRefreshToken = async (): Promise<string> => {
      const user = await User.findByEmail(email)
      const token = jwt.sign(
        {
          refresh: true,
          userId: user.partitionKey,
        },
        process.env.OAUTH_SIGNATURE,
        {
          algorithm: SUPPORTED_ALGORITHM,
          expiresIn: process.env.REFRESH_TOKEN_LIFESPAN,
        }
      )
      return token
    }

    test("should generate new credentials from a valid refresh token", async () => {
      expect.assertions(3)
      const tokens = await generateTokenFromRefreshToken(
        await generateValidRefreshToken()
      )
      expect(tokens).not.toBeNull()
      expect(tokens.token).not.toBeNull()
      expect(tokens.refresh).not.toBeNull()
    })

    test("should prevent replay attacks", async () => {
      expect.assertions(1)
      await generateTokenFromRefreshToken(await generateValidRefreshToken()) // First request
      expect(
        await generateTokenFromRefreshToken(await generateValidRefreshToken()) // Replay
      ).toBeNull()
    })

    test("should not generate new credentials for a non existent user", async () => {
      expect.assertions(1)
      const refresh = jwt.sign(
        {
          refresh: true,
          userId: "1234-NOT-REAL",
        },
        process.env.OAUTH_SIGNATURE,
        {
          algorithm: SUPPORTED_ALGORITHM,
          expiresIn: process.env.REFRESH_TOKEN_LIFESPAN,
        }
      )
      const tokens = await generateTokenFromRefreshToken(refresh)
      expect(tokens).toBeNull()
    })

    test("should not generate new credentials for a standard access token", async () => {
      expect.assertions(1)
      const refresh = jwt.sign(
        {
          userId,
        },
        process.env.OAUTH_SIGNATURE,
        {
          algorithm: SUPPORTED_ALGORITHM,
          expiresIn: process.env.REFRESH_TOKEN_LIFESPAN,
        }
      )
      const tokens = await generateTokenFromRefreshToken(refresh)
      expect(tokens).toBeNull()
    })

    test("should not generate new credentials if the token is not signed with the supported algorithm", async () => {
      expect.assertions(1)
      const refresh = jwt.sign(
        {
          refresh: true,
          userId,
        },
        process.env.OAUTH_SIGNATURE,
        {
          algorithm: "HS256",
          expiresIn: process.env.REFRESH_TOKEN_LIFESPAN,
        }
      )
      const tokens = await generateTokenFromRefreshToken(refresh)
      expect(tokens).toBeNull()
    })
  })
})
