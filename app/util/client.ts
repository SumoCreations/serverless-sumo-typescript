import * as AWS from "aws-sdk"

/**
 * A configuration you can override with a local set of
 * AWS credentials to connect remotely to some AWS resources
 * that are running outside of SLS offline.
 */
const defaultOfflineConfig = {
  accessKeyId: "SPECIFY_ACCESS_KEY_ID",
  region: "us-west-1",
  secretAccessKey: "SPECIFY_SECRET_KEY",
}

/**
 * A simple way to detect if the current process is running
 * via SLS Offline.
 */
export const isOffline = () => process.env.IS_OFFLINE === "true"

/**
 * A convenience method to retrieve an SNS client with an offline 
 * configuration for development testing.
 */
export const getSNSClient = () => isOffline() ? new AWS.SNS(defaultOfflineConfig) : new AWS.SNS()

/**
 * A convenience method to retrieve an S3 client with an offline 
 * configuration for development testing.
 */
export const getS3Client = () => isOffline() ? new AWS.S3(defaultOfflineConfig) : new AWS.S3()

/**
 * A convenience method to retrieve a DynamoDB client with an offline 
 * configuration for development testing.
 */
export const getDynamoClient = () => isOffline()
  ? new AWS.DynamoDB.DocumentClient({
    accessKeyId: 'MOCK_ACCESS_KEY_ID',
    endpoint: 'http://localhost:8000',
    region: 'localhost',
    secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
  })
  : new AWS.DynamoDB.DocumentClient()

/**
 * 
 * @param tableName The name of the dynamoDB table to reset.
 * @param key A callback used to generate the key which will be used to delete each individual item.
 */
export const resetTable = async (
  tableName: string,
  key: (i: any) => { [key: string]: any }
) => {
  try {
    const params = {
      TableName: tableName,
    }
    const client = getDynamoClient()
    const results = await client.scan(params).promise()
    const requests = results.Items.map(async i => {
      const deleteParams = {
        Key: key(i),
        TableName: tableName,
      }
      await client.delete(deleteParams).promise()
    })

    await Promise.all(requests)
  } catch (e) {
    // tslint:disable no-console
    console.log(`Could not reset table: ${tableName}`)
    console.log(e)
    // tslint:enable no-console
    return
  }
}