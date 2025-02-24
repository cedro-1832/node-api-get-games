#!/bin/bash

set -e  # Detener el script en caso de error

AWS_PROFILE="serverless-deployer"
AWS_REGION="us-east-1"
STACK_NAME="get-games-api"
BUCKET_NAME="serverless-framework-deployments"
IAM_ROLE="get-games-api-lambda-role"
FUNCTION_NAME="get-games"
DEPLOY_DIR="dist"

echo "🚀 [1/7] Iniciando despliegue de la API Get Games en AWS..."

# 🛠️ [2/7] Instalar dependencias si es necesario
echo "📦 Instalando dependencias..."
npm install

# 🏗️ [3/7] Construir la aplicación si es necesario
echo "🔧 Construyendo el proyecto..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r server.js package.json node_modules "$DEPLOY_DIR"

# 📤 [4/7] Empaquetar código para AWS Lambda
echo "📤 Empaquetando código para AWS Lambda..."
zip -r "$DEPLOY_DIR/$FUNCTION_NAME.zip" "$DEPLOY_DIR"

# 🔍 [5/7] Verificar si la función Lambda ya existe
echo "🔍 Verificando si la función Lambda $FUNCTION_NAME existe en AWS..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --profile "$AWS_PROFILE" --region "$AWS_REGION" &>/dev/null; then
    echo "📤 Actualizando código de la función Lambda..."
    aws lambda update-function-code --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$DEPLOY_DIR/$FUNCTION_NAME.zip" \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"
else
    echo "🚀 Creando nueva función Lambda..."
    aws lambda create-function --function-name "$FUNCTION_NAME" \
        --runtime "nodejs20.x" \
        --role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$IAM_ROLE" \
        --handler "server.handler" \
        --zip-file "fileb://$DEPLOY_DIR/$FUNCTION_NAME.zip" \
        --timeout 15 \
        --memory-size 128 \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"
fi

echo "✅ Función Lambda lista."

# 🔥 [6/7] Desplegar API Gateway con Serverless Framework
echo "🌐 Desplegando API Gateway con Serverless..."
serverless deploy --profile "$AWS_PROFILE"

# 📌 [7/7] Obtener la URL del API Gateway
API_URL=$(aws apigateway get-rest-apis --profile "$AWS_PROFILE" --region "$AWS_REGION" \
    --query "items[?name=='$STACK_NAME'].id" --output text)

if [[ -z "$API_URL" ]]; then
    echo "❌ Error: No se pudo obtener la URL de la API Gateway."
else
    echo "✅ API desplegada exitosamente: https://$API_URL.execute-api.$AWS_REGION.amazonaws.com/dev"
fi

echo "🎉 Despliegue completado con éxito."
