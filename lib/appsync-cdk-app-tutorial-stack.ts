// 必要なパッケージをインストール
import * as cdk from '@aws-cdk/core'
import * as appsync from '@aws-cdk/aws-appsync'
import * as ddb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'

export class AppsyncCdkAppTutorialStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // GraphQL API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-notes-appsync-api', // API名
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'), // schemaファイルの場所
      // デフォルトの認証モードと構成、追加の認証モードを設定
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      xrayEnabled: true, // xrayのデバッグを有効にする。
    })

    // GraphQL APIのAPIキーを出力
    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    })
    // リージョンを出力
    new cdk.CfnOutput(this, 'Stack Region', {
      value: this.region,
    })

    // lambda function
    const notesLambda = new lambda.Function(this, 'AppSyncNotesHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda-fns'),
      memorySize: 1024,
    })

    // Appsyncのデータソースとしてラムダ関数をセットする
    const lambdaDataSource = api.addLambdaDataSource('lambdaDataSource', notesLambda)
  }
}
