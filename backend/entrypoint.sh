#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Running seed..."
python seed.py

echo "Starting server..."
if [ "$ENVIRONMENT" = "production" ]; then
    exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
else
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi
