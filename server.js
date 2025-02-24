service: get-games-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  iamRoleStatements:
    - Effect: Allow
      Action:
        - lambda:InvokeFunction
        - dynamodb:Scan
      Resource: "*"

functions:
  getGames:
    handler: server.handler
    memorySize: 256
    timeout: 10
    package:
      exclude:
        - node_modules/**  # EXCLUIR NODE_MODULES PARA EVITAR ERRORES DE TAMAÑO
    events:
      - http:
          path: api/games
          method: get
          cors: true
