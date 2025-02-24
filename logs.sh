#!/bin/bash

set -e  # Detener el script en caso de error

AWS_REGION="us-east-1"
LOG_GROUP_NAME="/aws/lambda/get-games"
LOG_STREAM_COUNT=5  # Número de streams de logs a mostrar
LOG_EVENTS_COUNT=20  # Número de eventos de logs a mostrar

echo "🔍 Buscando logs para Lambda: $LOG_GROUP_NAME en $AWS_REGION..."

LOG_GROUP_EXISTS=$(aws logs describe-log-groups --region "$AWS_REGION" --query "logGroups[].logGroupName" --output text | grep -w "$LOG_GROUP_NAME" || true)

if [[ -z "$LOG_GROUP_EXISTS" ]]; then
    echo "❌ Error: El grupo de logs '$LOG_GROUP_NAME' no existe en AWS CloudWatch."
    echo "⚠️  Asegúrate de que la función Lambda se haya ejecutado al menos una vez."
    exit 1
fi

echo "✅ Logs encontrados en CloudWatch."
