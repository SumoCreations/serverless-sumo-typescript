import { ErrorList } from "validation-schema-example"
import { IUserOutput } from "../../../../models"

export interface IMutationOutput {
  user?: IUserOutput
  errors?: ErrorList
  success: boolean
}