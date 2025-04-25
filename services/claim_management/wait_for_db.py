import os
import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection parameters
db_config = {
    "host": "claim_db",
    "port": 5432,
    "user": "claim_user",
    "password": "claim_password",
    "database": "claim_db"  # Connect to default DB first
}


max_retries = 30
retry_interval = 2

for attempt in range(max_retries):
    try:
        # First check basic connectivity
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if our database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='claim_database'")
        if not cursor.fetchone():
            cursor.execute("CREATE DATABASE claim_database")
        
        print("Database is ready!")
        cursor.close()
        conn.close()
        exit(0)
        
    except psycopg2.OperationalError as e:
        print(f"Attempt {attempt + 1}/{max_retries}: {str(e)}")
        time.sleep(retry_interval)

print("Failed to connect to database after multiple attempts")
exit(1)