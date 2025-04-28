# alembic/env.py

from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
import os
import sys

# 1. Determine the project root (one level up from the alembic directory)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# 2. Insert it into sys.path so that `import src` works
sys.path.insert(0, project_root)
from src.core.config import settings
from src.database.models.customer import Customer
from src.database.models.enrolement import Enrolement

# Interpret the alembic.ini for Python logging.
config = context.config
fileConfig(config.config_file_name)

# Pull URLs from env or settings
customer_url   = os.getenv("CUSTOMER_DATABASE_URL", settings.CUSTOMER_DATABASE_URL)
enrollment_url = os.getenv("ENROLEMENT_DATABASE_URL", settings.ENROLEMENT_DATABASE_URL)

# Import metadata that covers all models (ensure both DB models are imported)
from src.database.db import Base
target_metadata = Base.metadata

def run_migrations_online():
    """Run migrations against both Customer and Enrollment DBs."""
    # Create separate engines
    engines = {
        "customer": create_engine(customer_url, poolclass=pool.NullPool),
        "enrollment": create_engine(enrollment_url, poolclass=pool.NullPool)
    }
    for name, engine in engines.items():
        # Optionally set a custom version table per DB:
        # context.configure(connection=conn, version_table=f"alembic_version_{name}", ...)
        with engine.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                # version_table=f"alembic_version_{name}"
            )
            with context.begin_transaction():
                context.run_migrations()

if context.is_offline_mode():
    # In offline mode you can just run against one of them
    url = customer_url
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    run_migrations_online()
