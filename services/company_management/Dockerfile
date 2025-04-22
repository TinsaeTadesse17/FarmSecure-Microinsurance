FROM python:3.11-slim

WORKDIR /app
ENV PYTHONPATH=/app

COPY . .
COPY requirements.txt .


# Accept DATABASE_URL as a build argument
ARG DATABASE_URL
# Set it as an environment variable inside the container
ENV DATABASE_URL=${DATABASE_URL}

RUN pip install -r requirements.txt
RUN chmod +x entrypoint.sh

# Use a non-root user for security
RUN useradd -m appuser
USER appuser

EXPOSE 8000

# Use an entrypoint that first runs Alembic migrations then starts the API
CMD ["./entrypoint.sh"]


