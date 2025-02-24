#!/bin/bash

set -e  # Detener el script en caso de error

AWS_REGION="us-east-1"
LOG_GROUP_NAME="/aws/lambda/get-games"
LOG_STREAM_COUNT=5  # Número de streams de logs a mostrar
LOG_EVENTS_COUNT=20  # Número de eventos de logs a mostrar

echo "🔍 Buscando logs para Lambda: $LOG_GROUP_NAME en $AWS_REGION..."

# Verificar si el grupo de logs existe correctamente
LOG_GROUP_EXISTS=$(aws logs describe-log-groups --region "$AWS_REGION" --query "logGroups[].logGroupName" --output text | grep -w "$LOG_GROUP_NAME" || true)

if [[ -z "$LOG_GROUP_EXISTS" ]]; then
    echo "❌ Error: El grupo de logs '$LOG_GROUP_NAME' no existe en AWS CloudWatch."
    echo "⚠️  Posibles soluciones:"
    echo "   - Asegúrate de que la función Lambda ha sido ejecutada al menos una vez."
    echo "   - Verifica en la consola de AWS CloudWatch si el nombre del grupo de logs es correcto."
    echo "   - Asegúrate de que tienes los permisos adecuados en AWS IAM para acceder a los logs."
    echo "   - Ejecuta manualmente la Lambda para generar logs."
    exit 1
fi

# Obtener los últimos streams de logs
echo "📜 Obteniendo los últimos $LOG_STREAM_COUNT streams de logs..."
LOG_STREAMS=$(aws logs describe-log-streams --log-group-name "$LOG_GROUP_NAME" --region "$AWS_REGION" \
    --order-by "LastEventTime" --descending --limit $LOG_STREAM_COUNT --query "logStreams[].logStreamName" --output text 2>/dev/null || true)

if [[ -z "$LOG_STREAMS" ]]; then
    echo "⚠️ No se encontraron streams de logs recientes en $LOG_GROUP_NAME."
    echo "   - La función Lambda puede no haber generado registros aún."
    echo "   - Intenta ejecutar la Lambda manualmente y luego revisa nuevamente."
    exit 1
fi

echo "✅ Streams de logs encontrados: "
echo "$LOG_STREAMS"

# Obtener los últimos eventos de logs de cada stream
for STREAM in $LOG_STREAMS; do
    echo "📌 Logs del stream: $STREAM"
    aws logs get-log-events --log-group-name "$LOG_GROUP_NAME" --log-stream-name "$STREAM" --limit $LOG_EVENTS_COUNT --region "$AWS_REGION" --query "events[].{timestamp:timestamp, message:message}" --output table 2>/dev/null || echo "⚠️ No se encontraron eventos en el stream $STREAM"
    echo "----------------------------------------"
done

echo "🎉 Logs obtenidos exitosamente."
