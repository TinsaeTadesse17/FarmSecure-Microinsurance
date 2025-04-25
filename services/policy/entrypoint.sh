#!/usr/bin/env sh
# policy/entrypoint.sh

# Apply migrations
alembic upgrade head

# Start the API
exec uvicorn src.main:app --host 0.0.0.0 --port 8000
