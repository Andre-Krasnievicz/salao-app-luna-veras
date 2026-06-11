from sqlalchemy.orm import Session
from app.models.site_visit import SiteVisit
from app.models.audit_log import AuditLog


class SiteVisitRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, path: str, user_agent: str, ip_hash: str) -> SiteVisit:
        v = SiteVisit(path=path[:500], user_agent=user_agent[:500], ip_hash=ip_hash)
        self.db.add(v)
        self.db.commit()
        return v

    def count_total(self) -> int:
        return self.db.query(SiteVisit).count()


class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def log(self, action: str, user_id=None, entity=None, entity_id=None, ip_hash=None, user_agent=None):
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            ip_hash=ip_hash,
            user_agent=user_agent[:500] if user_agent else None,
        )
        self.db.add(log)
        self.db.commit()
