FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app

# Accept DATABASE_URL as a build argument
ARG DATABASE_URL
# Set it as an environment variable inside the container
ENV DATABASE_URL=${DATABASE_URL}

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Ensure Unix line endings and make entrypoint executable
RUN apt-get update && apt-get install -y dos2unix \
    && dos2unix entrypoint.sh \
    && chmod +x entrypoint.sh

EXPOSE 8000

RUN chmod +x entrypoint.sh

# Use a non-root user for security
RUN useradd -m appuser
USER appuser
# Use an entrypoint that first runs Alembic migrations then starts the API
CMD ["./entrypoint.sh"]
