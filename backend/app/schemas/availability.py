from datetime import datetime
from typing import List
from pydantic import BaseModel


class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool


class AvailabilityResponse(BaseModel):
    date: str
    slots: List[TimeSlot]
