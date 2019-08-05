import { User } from "../../../../models"
import { ErrorUserCouldNotBeDestroyed, ErrorUserWithIDDoesNotExist } from "./userErrors"
import { IMutationOutput } from "./userMutationTypes"

export const destroyUser = async (
  _: any,
  { id }: { id: string }
): Promise<IMutationOutput> => {
  const user = await User.find(id)
  if (!user) {
    return { success: false, errors: [ErrorUserWithIDDoesNotExist] }
  }
  try {
    await User.destroy(id)
  } catch (e) {
    return { success: false, errors: [ErrorUserCouldNotBeDestroyed] }
  }
  return { user: User.output(user), success: true }
}