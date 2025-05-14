FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system build dependencies and dos2unix
RUN apt-get update && apt-get install -y \
    gcc python3-dev libpq-dev dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first for caching
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy application code (including entrypoint.sh)
COPY . ./

# Ensure entrypoint has Unix line endings and is executable
RUN dos2unix entrypoint.sh \
    && chmod +x entrypoint.sh

# Accept DATABASE_URL as a build argument
ARG DATABASE_URL
# Set it as an environment variable inside the container
ENV DATABASE_URL=${DATABASE_URL}

# Use a non-root user for security
RUN useradd -m appuser
USER appuser

EXPOSE 8000

# Use an entrypoint that first runs Alembic migrations then starts the API
CMD ["./entrypoint.sh"]


