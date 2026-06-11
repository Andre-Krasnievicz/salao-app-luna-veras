"""add services

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # services table
    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("price_cents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_services_id", "services", ["id"])
    op.create_index("ix_services_category", "services", ["category"])
    op.create_index("ix_services_is_active", "services", ["is_active"])

    # new columns on appointments
    op.add_column("appointments", sa.Column("total_duration_minutes", sa.Integer(), nullable=True))
    op.add_column("appointments", sa.Column("services_total_cents", sa.Integer(), nullable=True))

    # appointment_services junction table
    op.create_table(
        "appointment_services",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("appointment_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("service_name_snapshot", sa.String(255), nullable=False),
        sa.Column("service_duration_snapshot", sa.Integer(), nullable=False),
        sa.Column("service_price_snapshot", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["appointment_id"], ["appointments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_appointment_services_id", "appointment_services", ["id"])
    op.create_index("ix_appointment_services_appointment_id", "appointment_services", ["appointment_id"])


def downgrade() -> None:
    op.drop_table("appointment_services")
    op.drop_column("appointments", "services_total_cents")
    op.drop_column("appointments", "total_duration_minutes")
    op.drop_table("services")
