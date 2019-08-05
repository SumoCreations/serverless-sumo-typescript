import { User } from "../../../../models"
import { createUser } from "./createUser"

const email = "create-user-test@example.com"
const password = "password"
const firstName = "Jim"
const lastName = "Jeffers"

const sampleParams = { email: "jim-developer@example.com", firstName: "Jim", lastName: "Jeffers", password: "password" }

describe("createUser", () => {
  beforeEach(async () =>
    await User.create({
      email,
      firstName,
      lastName,
      password,
    })
  )

  afterEach(async () => await User.destroyByEmail(email))

  test("should generate a new user model if the user is valid", async () => {
    expect.assertions(1)
    const output = await createUser(null, { userInput: { ...sampleParams } })
    expect(output.success).toBe(true)
  })

  test("should fail if the email is invalid", async () => {
    expect.assertions(2)
    const output = await createUser(null, { userInput: { ...sampleParams, email: "invalid@notemail" } })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("email")
  })

  test("should fail if the password is invalid", async () => {
    expect.assertions(2)
    const output = await createUser(null, { userInput: { ...sampleParams, password: "short" } })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("password")
  })

  test("should fail and report multiple invalid values", async () => {
    expect.assertions(5)
    const output = await createUser(null, { userInput: { email: "jimsumocreations.com", firstName: "", lastName: "", password: "short", } })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("email")
    expect(output.errors.map(e => e.path)).toContain("password")
    expect(output.errors.map(e => e.path)).toContain("firstName")
    expect(output.errors.map(e => e.path)).toContain("lastName")
  })

  test("should fail if the email is already in use", async () => {
    expect.assertions(2)
    const output = await createUser(null, { userInput: { ...sampleParams, email } })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("email")
  })

})
