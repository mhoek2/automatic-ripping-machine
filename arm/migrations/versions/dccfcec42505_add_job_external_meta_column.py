"""Add job external_meta column

Revision ID: dccfcec42505
Revises: edf2272c0a9d
Create Date: 2026-11-09 13:41:16.282897

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dccfcec42505'
down_revision = 'edf2272c0a9d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('job',
                  sa.Column('external_meta', sa.JSON())
                  )


def downgrade():
    op.drop_column('job', 'external_meta')