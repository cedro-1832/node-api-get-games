#!/bin/bash

set -e  # Detener el script en caso de error

AWS_PROFILE="serverless-deployer"
AWS_REGION="us-east-1"
STACK_NAME="get-games-api"
IAM_ROLE_NAME="get-games-api-lambda-role"
FUNCTION_NAME="get-games"
DEPLOY_DIR="dist"

echo "🚀 [1/9] Iniciando despliegue de la API Get Games en AWS..."

# 🛠️ [2/9] Instalar dependencias solo de producción
echo "📦 Instalando dependencias de producción..."
rm -rf node_modules

if [ -f "package-lock.json" ]; then
    npm ci --omit=dev
else
    npm install --omit=dev
fi

# 🏗️ [3/9] Construir la aplicación
echo "🔧 Construyendo el proyecto..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r server.js package.json "$DEPLOY_DIR"
cp -r node_modules "$DEPLOY_DIR"

# 📤 [4/9] Empaquetar código para AWS Lambda
echo "📤 Empaquetando código para AWS Lambda..."
cd "$DEPLOY_DIR"
zip -r "../$FUNCTION_NAME.zip" ./*
cd ..

# 🔍 [5/9] Verificar si el IAM Role existe, si no, crearlo
echo "🔍 Verificando si el IAM Role $IAM_ROLE_NAME existe..."
if ! aws iam get-role --role-name "$IAM_ROLE_NAME" --profile "$AWS_PROFILE" &>/dev/null; then
    echo "🚀 Creando IAM Role para Lambda..."
    aws iam create-role --role-name "$IAM_ROLE_NAME" \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": { "Service": "lambda.amazonaws.com" },
                    "Action": "sts:AssumeRole"
                }
            ]
        }' \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"

    # Asignar permisos al role
    aws iam attach-role-policy --role-name "$IAM_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"
    
    echo "✅ IAM Role creado y configurado."
else
    echo "✅ IAM Role ya existe."
fi

# 🔍 Obtener ARN del role
IAM_ROLE_ARN=$(aws iam get-role --role-name "$IAM_ROLE_NAME" --query 'Role.Arn' --output text --profile "$AWS_PROFILE")

# 🔍 [6/9] Verificar si la función Lambda ya existe
echo "🔍 Verificando si la función Lambda $FUNCTION_NAME existe en AWS..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --profile "$AWS_PROFILE" --region "$AWS_REGION" &>/dev/null; then
    echo "📤 Actualizando código de la función Lambda..."
    aws lambda update-function-code --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$FUNCTION_NAME.zip" \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"
else
    echo "🚀 Creando nueva función Lambda..."
    aws lambda create-function --function-name "$FUNCTION_NAME" \
        --runtime "nodejs20.x" \
        --role "$IAM_ROLE_ARN" \
        --handler "server.handler" \
        --zip-file "fileb://$FUNCTION_NAME.zip" \
        --timeout 15 \
        --memory-size 128 \
        --profile "$AWS_PROFILE" --region "$AWS_REGION"
fi

echo "✅ Función Lambda lista."

# 🔥 [7/9] Desplegar API Gateway con Serverless Framework
echo "🌐 Desplegando API Gateway con Serverless..."
serverless deploy --stage dev --region "$AWS_REGION" --aws-profile "$AWS_PROFILE"

# 📌 [8/9] Obtener la URL del API Gateway
API_URL=$(aws apigateway get-rest-apis --profile "$AWS_PROFILE" --region "$AWS_REGION" \
    --query "items[?name=='$STACK_NAME'].id" --output text)

if [[ -z "$API_URL" ]]; then
    echo "❌ Error: No se pudo obtener la URL de la API Gateway."
else
    echo "✅ API desplegada exitosamente: https://$API_URL.execute-api.$AWS_REGION.amazonaws.com/dev"
fi

echo "🎉 Despliegue completado con éxito."
