import { IUser, User } from "../../../../models"
import { updateUser } from "./updateUser"

const sampleParams = { email: "update-user-test@example.com", firstName: "Jim", lastName: "Jeffers", password: "password" }

describe("updateUser", () => {
  let user: IUser
  beforeEach(async (done) => {
    user = await User.create({ ...sampleParams })
    done()
  })

  afterEach(async (done) => {
    await User.destroyByEmail(sampleParams.email)
    done()
  })

  test("should update the user", async () => {
    expect.assertions(1)
    const userInput = { id: user.partitionKey, ...sampleParams, email: "update-user-2@example.com" }
    const output = await updateUser(null, { userInput })
    expect(output.success).toBe(true)
  })

  test("should fail the email is invalid", async () => {
    expect.assertions(2)
    const userInput = { id: user.partitionKey, ...sampleParams, email: "update-user-2@not-valid" }
    const output = await updateUser(null, { userInput })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("email")
  })

  test("should fail the password is invalid", async () => {
    expect.assertions(2)
    const userInput = { id: user.partitionKey, ...sampleParams, password: "short" }
    const output = await updateUser(null, { userInput })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("password")
  })

  test("should success if the password is not included", async () => {
    expect.assertions(1)
    const { password, ...slicedParams } = sampleParams
    const userInput = { id: user.partitionKey, ...slicedParams }
    const output = await updateUser(null, { userInput })
    expect(output.success).toBe(true)
  })

  test("should fail if the email is already in use", async () => {
    expect.assertions(2)
    const existingEmail = "another@user.com"
    await User.create({ ...sampleParams, email: existingEmail })
    const output = await updateUser(null, { userInput: { id: user.partitionKey, ...sampleParams, email: existingEmail } })
    expect(output.success).toBe(false)
    expect(output.errors.map(e => e.path)).toContain("email")
  })

  test("should fail if the user does not exist", async () => {
    expect.assertions(1)
    const output = await updateUser(null, { userInput: { id: "some-made-up-key", ...sampleParams } })
    expect(output.success).toBe(false)
  })

})
