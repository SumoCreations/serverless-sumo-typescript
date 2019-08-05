import { IUser, User } from "../../../../models"
import { destroyUser } from "./destroyUser"

const sampleParams = { email: "destroy-user-test@example.com", firstName: "Jim", lastName: "Jeffers", password: "password" }

describe("destroyUser", () => {
  let user: IUser
  beforeEach(async (done) => {
    user = await User.create({ ...sampleParams })
    done()
  })

  afterEach(async (done) => {
    await User.destroyByEmail(sampleParams.email)
    done()
  })

  test("should destroy the user", async () => {
    expect.assertions(1)
    const output = await destroyUser(null, { id: user.partitionKey })
    expect(output.success).toBe(true)
  })

  test("should fail the user does not exist", async () => {
    expect.assertions(1)
    const output = await destroyUser(null, { id: "some-made-up-id-or-key" })
    expect(output.success).toBe(false)
  })

})
