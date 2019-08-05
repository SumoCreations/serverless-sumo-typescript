import * as Validation from "validation-schema-example"
import { IUserInput, User } from "../../../../models"
import { ErrorUserWithEmailAlreadyExists } from "./userErrors"
import { IMutationOutput } from "./userMutationTypes"

export const updateUser = async (
  _: any,
  { userInput }: { userInput: IUserInput }
): Promise<IMutationOutput> => {
  try {
    await Validation.User.Existing.validate(userInput, { abortEarly: false })
  } catch (e) {
    return { errors: Validation.formatError(e), success: false }
  }
  let user = await User.find(userInput.id)
  if (!user) {
    return { success: false, errors: [{ message: "The requested user could not be found.", path: "_" }] }
  }
  const userWithEmail = await User.findByEmail(userInput.email)
  if (userWithEmail && userWithEmail.partitionKey !== user.partitionKey) {
    return { success: false, errors: [ErrorUserWithEmailAlreadyExists] }
  }
  user = await User.update(userInput)
  return { user: User.output(user), success: true }
}