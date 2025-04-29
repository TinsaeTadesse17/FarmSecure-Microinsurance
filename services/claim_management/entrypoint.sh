#!/bin/sh
# entrypoint.sh

# Run initial migrations (if no migration exists, alembic will create one based on your autogenerate settings)
alembic upgrade head

# Start the FastAPI application
exec uvicorn src.main:app --host 0.0.0.0 --port 8000