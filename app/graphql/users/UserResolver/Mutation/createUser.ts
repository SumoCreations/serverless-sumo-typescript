import * as Validation from "validation-schema-example"
import { IUserInput, User } from "../../../../models"
import { ErrorUserCredentialsInvalid, ErrorUserWithEmailAlreadyExists } from "./userErrors"
import { IMutationOutput } from "./userMutationTypes"

export const createUser = async (
  _: any,
  { userInput }: { userInput: IUserInput }
): Promise<IMutationOutput> => {
  try {
    await Validation.User.New.validate(userInput, { abortEarly: false })
  } catch (e) {
    return { errors: Validation.formatError(e), success: false }
  }

  const { email, password, firstName, lastName } = userInput
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    return {
      errors: [ErrorUserWithEmailAlreadyExists],
      success: false
    }
  }

  try {
    const user = await User.create({ email, password, firstName, lastName })
    return { user: User.output(user), success: true }
  } catch (e) {
    return { success: false, errors: [ErrorUserCredentialsInvalid] }
  }
}