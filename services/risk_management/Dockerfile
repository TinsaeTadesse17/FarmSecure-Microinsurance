FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .


EXPOSE 8000

RUN chmod +x entrypoint.sh

# Use a non-root user for security
RUN useradd -m appuser
USER appuser
# Use an entrypoint that first runs Alembic migrations then starts the API
CMD ["./entrypoint.sh"]
