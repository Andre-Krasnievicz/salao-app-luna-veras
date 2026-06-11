"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("admin", "client", name="user_role"), nullable=False),
        sa.Column("terms_accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("privacy_policy_accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # password_reset_tokens
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_password_reset_tokens_id", "password_reset_tokens", ["id"])
    op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"], unique=True)

    # appointments
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("client_user_id", sa.Integer(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.Enum("pending_payment", "confirmed", "cancelled", "payment_failed", name="appointment_status"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("source", sa.Enum("public", "admin", name="appointment_source"), nullable=False),
        sa.Column("reservation_amount_cents", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("payment_status", sa.String(50), nullable=True),
        sa.Column("mercado_pago_preference_id", sa.String(255), nullable=True),
        sa.Column("mercado_pago_payment_id", sa.String(255), nullable=True),
        sa.Column("client_reminder_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("admin_reminder_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("client_name", sa.String(255), nullable=True),
        sa.Column("client_phone", sa.String(30), nullable=True),
        sa.Column("client_email", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["client_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_appointments_id", "appointments", ["id"])
    op.create_index("ix_appointments_start_time", "appointments", ["start_time"])
    op.create_index("ix_appointments_status", "appointments", ["status"])

    # settings
    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("salon_name", sa.String(255), nullable=False, server_default="Salão Luna"),
        sa.Column("admin_whatsapp", sa.String(30), nullable=True),
        sa.Column("reservation_amount_cents", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("appointment_duration_minutes", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("timezone", sa.String(100), nullable=False, server_default="America/Sao_Paulo"),
        sa.Column("whatsapp_reminders_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_settings_id", "settings", ["id"])

    # business_hours
    op.create_table(
        "business_hours",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("opens_at", sa.String(5), nullable=False, server_default="09:00"),
        sa.Column("closes_at", sa.String(5), nullable=False, server_default="18:00"),
        sa.Column("is_open", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("weekday"),
    )
    op.create_index("ix_business_hours_id", "business_hours", ["id"])

    # site_visits
    op.create_table(
        "site_visits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("path", sa.String(500), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_site_visits_id", "site_visits", ["id"])

    # audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity", sa.String(100), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("ip_hash", sa.String(64), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])

    # data_deletion_requests
    op.create_table(
        "data_deletion_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.Enum("pending", "completed", "rejected", name="deletion_status"), nullable=False, server_default="pending"),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_data_deletion_requests_id", "data_deletion_requests", ["id"])


def downgrade() -> None:
    op.drop_table("data_deletion_requests")
    op.drop_table("audit_logs")
    op.drop_table("site_visits")
    op.drop_table("business_hours")
    op.drop_table("settings")
    op.drop_table("appointments")
    op.drop_table("password_reset_tokens")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS deletion_status")
    op.execute("DROP TYPE IF EXISTS appointment_source")
    op.execute("DROP TYPE IF EXISTS appointment_status")
    op.execute("DROP TYPE IF EXISTS user_role")
