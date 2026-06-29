import { useEffect, useRef, useState, useCallback } from 'react';

export interface RawNetworkLog {
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  bytes_sent: number;
  bytes_received: number;
  duration_ms: number;
  packet_count: number;
  tcp_flags: string;
  is_encrypted: number;
  src_lat?: number;
  src_lon?: number;
}

export interface ScoredEvent {
  row_id: string;
  timestamp: string;
  anomaly_score: number;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  top_features: string[];
  raw: RawNetworkLog;
}

export interface CyberStats {
  totalEvents: number;
  anomalyRate: number;
  threatsDetected: number;
  avgScore: number;
}

export interface RollingPoint {
  time: string;
  rate: number;
  timestamp: number;
}

interface UseCyberStreamOptions {
  rowsPerSec?: number;
  maxTableRows?: number;
  rollingWindowSec?: number;
  criticalThreshold?: number;
  onCritical?: () => void;
  enabled?: boolean;
}

export function useCyberStream(options: UseCyberStreamOptions = {}) {
  const {
    rowsPerSec = 10,
    maxTableRows = 50,
    rollingWindowSec = 60,
    criticalThreshold = 0.8,
    onCritical,
    enabled = true,
  } = options;

  const [rows, setRows] = useState<ScoredEvent[]>([]);
  const [rollingData, setRollingData] = useState<RollingPoint[]>([]);
  const [stats, setStats] = useState<CyberStats>({
    totalEvents: 0,
    anomalyRate: 0,
    threatsDetected: 0,
    avgScore: 0,
  });
  const [connected, setConnected] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  // Refs for mutable state inside the event handler
  const allScoresRef = useRef<{ score: number; ts: number; isAnomaly: boolean }[]>([]);
  const totalRef = useRef(0);
  const scoreSum = useRef(0);
  const threatsRef = useRef(0);
  const criticalFiredRef = useRef(false);
  const onCriticalRef = useRef(onCritical);
  onCriticalRef.current = onCritical;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    const url = `/api/cyber/stream?rows_per_sec=${rowsPerSec}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retryCountRef.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const data: ScoredEvent = JSON.parse(event.data);
        const now = Date.now();
        const isAnomaly = data.anomaly_score >= 0.6;

        totalRef.current += 1;
        scoreSum.current += data.anomaly_score;
        if (data.threat_level === 'HIGH' || data.threat_level === 'CRITICAL') {
          threatsRef.current += 1;
        }

        allScoresRef.current.push({ score: data.anomaly_score, ts: now, isAnomaly });

        // Trim to rolling window
        const cutoff = now - rollingWindowSec * 1000;
        allScoresRef.current = allScoresRef.current.filter((s) => s.ts >= cutoff);

        // Calculate rolling anomaly rate
        const windowScores = allScoresRef.current;
        const anomalyCount = windowScores.filter((s) => s.isAnomaly).length;
        const rate = windowScores.length > 0 ? anomalyCount / windowScores.length : 0;

        // Check critical threshold
        if (rate >= criticalThreshold && !criticalFiredRef.current) {
          criticalFiredRef.current = true;
          setIsCritical(true);
          onCriticalRef.current?.();
        } else if (rate < criticalThreshold) {
          criticalFiredRef.current = false;
          setIsCritical(false);
        }

        // Update rows (newest first, capped)
        setRows((prev) => [data, ...prev].slice(0, maxTableRows));

        // Update rolling chart data
        const timeStr = new Date(now).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setRollingData((prev) => {
          const updated = [
            ...prev,
            { time: timeStr, rate: Math.round(rate * 100), timestamp: now },
          ];
          // Keep only last 60 seconds of chart points
          return updated.filter((p) => p.timestamp >= cutoff);
        });

        // Update stats
        setStats({
          totalEvents: totalRef.current,
          anomalyRate: Math.round(rate * 100),
          threatsDetected: threatsRef.current,
          avgScore:
            totalRef.current > 0
              ? Math.round((scoreSum.current / totalRef.current) * 100) / 100
              : 0,
        });
      } catch {
        // Ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();

      // Exponential backoff reconnection
      const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
      retryCountRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [enabled, rowsPerSec, maxTableRows, rollingWindowSec, criticalThreshold]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnected(false);
  }, []);

  return {
    rows,
    rollingData,
    stats,
    connected,
    isCritical,
    disconnect,
  };
}
