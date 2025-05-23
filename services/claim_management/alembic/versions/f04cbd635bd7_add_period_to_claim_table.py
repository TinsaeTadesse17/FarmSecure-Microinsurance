"""add_period_to_claim_table

Revision ID: f04cbd635bd7
Revises: 6082c1a9b25d
Create Date: 2025-05-23 09:05:59.796388

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f04cbd635bd7'
down_revision: Union[str, None] = '6082c1a9b25d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('claim', sa.Column('period', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('claim', 'period')
