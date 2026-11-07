"""
Anonymous, aggregate usage counters. Each row is just "on this day, this event happened N times".
No user, session, IP address, device ID, timestamp finer than a day, or free text is ever stored,
so the rows are not personal information (RA 10173). Labels come from a fixed allow-list.
"""
from django.db import models


class UsageCount(models.Model):
    day = models.DateField(db_index=True)
    event = models.CharField(max_length=40)
    label = models.CharField(max_length=60, blank=True, default='')
    count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('day', 'event', 'label')
        ordering = ['-day', 'event']

    def __str__(self):
        return f'{self.day} {self.event}:{self.label} = {self.count}'
