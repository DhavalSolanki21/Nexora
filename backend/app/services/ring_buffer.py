"""Ring buffer with asyncio support for SSE backpressure handling.

Implements a fixed-size buffer that drops oldest events when full,
and provides an async generator interface for SSE consumers.
"""

from __future__ import annotations

import asyncio
from collections import deque
from typing import Any


class RingBuffer:
    """Thread-safe ring buffer with async consumer support.

    When the buffer is full, the oldest event is silently dropped.
    Each consumer gets an independent asyncio.Queue fed from the buffer.
    """

    def __init__(self, maxsize: int = 1000) -> None:
        self._maxsize = maxsize
        self._buffer: deque[Any] = deque(maxlen=maxsize)
        self._consumers: list[asyncio.Queue[Any | None]] = []
        self._total_pushed = 0
        self._total_dropped = 0

    @property
    def size(self) -> int:
        return len(self._buffer)

    @property
    def capacity(self) -> int:
        return self._maxsize

    @property
    def total_pushed(self) -> int:
        return self._total_pushed

    @property
    def total_dropped(self) -> int:
        return self._total_dropped

    @property
    def consumer_count(self) -> int:
        return len(self._consumers)

    def push(self, item: Any) -> None:
        """Push an item; drop oldest if full. Fan-out to all consumers."""
        self._total_pushed += 1
        self._buffer.append(item)

        stale: list[asyncio.Queue] = []
        for q in self._consumers:
            if q.full():
                # Consumer is slow — drop its oldest buffered event
                try:
                    q.get_nowait()
                    self._total_dropped += 1
                except asyncio.QueueEmpty:
                    pass
            try:
                q.put_nowait(item)
            except asyncio.QueueFull:
                stale.append(q)

        # Remove any dead consumers
        for q in stale:
            if q in self._consumers:
                self._consumers.remove(q)

    def subscribe(self) -> asyncio.Queue[Any | None]:
        """Create a new consumer queue subscribed to future events."""
        q: asyncio.Queue[Any | None] = asyncio.Queue(maxsize=self._maxsize)
        self._consumers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        """Remove a consumer queue."""
        if q in self._consumers:
            self._consumers.remove(q)

    async def consume(self, q: asyncio.Queue[Any | None]):
        """Async generator that yields events from a consumer queue."""
        try:
            while True:
                item = await q.get()
                if item is None:
                    # Sentinel — stop consuming
                    break
                yield item
        finally:
            self.unsubscribe(q)

    def shutdown(self) -> None:
        """Send None sentinel to all consumers to signal shutdown."""
        for q in self._consumers:
            try:
                q.put_nowait(None)
            except asyncio.QueueFull:
                pass
