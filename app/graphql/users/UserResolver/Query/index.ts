import { User } from "../../../../models"

export const user = async (_, args) => User.output(await User.find(args.id))

export const userWithEmail = async (_, args) =>
  User.output(await User.findByEmail(args.email))

export const users = async () => (await User.all()).map(User.output)
