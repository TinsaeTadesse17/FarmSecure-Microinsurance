import os
from sqlalchemy import create_engine, inspect

def check_tables_exist():
    database_url = os.getenv("DATABASE_URL")
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    required_tables = {"claim"}
    existing_tables = set(inspector.get_table_names())
    
    missing_tables = required_tables - existing_tables
    if missing_tables:
        raise RuntimeError(f"Missing tables: {missing_tables}")
    print("All required tables exist")

if __name__ == "__main__":
    check_tables_exist()