import { IUser, User } from "../models"
import { comparePassword } from "./passwords"

/**
 * Verifies a given user by comparing their plain text password to a hashed version.
 * @param id The unique ID of the user to verify.
 * @param password The plain text password associated with that account.
 */
export const verifyUser = async (
  email: string,
  password: string
): Promise<IUser | null> => {
  try {
    const user = await User.findByEmail(email)
    const verified = await comparePassword(user.password, password)
    return verified ? user : null
  } catch (e) {
    return null
  }
}
