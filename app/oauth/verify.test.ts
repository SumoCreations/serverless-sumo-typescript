import { User } from "../models"
import { verifyUser } from "./verify"

const email = "avaliduser@jimjeffers.com"
const password = "thisisjustatest"


describe("verifyUser", () => {
  beforeAll(async () => {
    await User.create({
      email,
      firstName: "Jim",
      lastName: "Jeffers",
      password,
    })
  })

  test("should verify a user who truly exists", async () => {
    expect.assertions(1)

    const user = await verifyUser(email, password)
    expect(user.email).toBe(email)
  })

  test("should not return a user if the password is incorrect", async () => {
    expect.assertions(1)
    const user = await verifyUser(email, "invalid_password")
    expect(user).toBe(null)
  })
})
