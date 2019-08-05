import { comparePassword, hashPassword } from "./passwords"
process.env.SALT_ROUNDS = "10"

const plainTextPassword = "thisisatest"
const hashedPassword =
  "$2a$10$31LTUe4VISHFVivG65Sd6uJa/tkqMaUK8GgAJmIW9aGW7eBWQntf2"

describe("compare password", () => {
  test("should generate a verifiably hashed password via bcrypt", async () => {
    expect.assertions(1)
    const generatedHash = await hashPassword(plainTextPassword)
    expect(await comparePassword(generatedHash, plainTextPassword)).toBe(true)
  })

  test("should verify a password via bcrypt", async () => {
    expect.assertions(1)
    expect(await comparePassword(hashedPassword, plainTextPassword)).toBe(true)
  })

  test("should verify a password is invalid via bcrypt", async () => {
    expect.assertions(1)
    expect(await comparePassword("wrongPassword!1", plainTextPassword)).toBe(
      false
    )
  })
})
