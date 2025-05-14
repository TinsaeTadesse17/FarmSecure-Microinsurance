FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code (including entrypoint.sh)
COPY . .

# Ensure Unix line endings and make entrypoint executable
RUN apt-get update && apt-get install -y dos2unix \
    && dos2unix entrypoint.sh \
    && chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]