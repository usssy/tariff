import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

// Use a valid colored earth texture
const EARTH_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

// Always use demo data (no fetch)
async function fetchTariffData() {
  return [
    { country: 'United States', lat: 38, lng: -97, tariff: 5, topCommodity: 'Copper', tradePartner: 'China', tradeLat: 35, tradeLng: 103, tradeVolume: 1200, lastChange: 1 },
    { country: 'China', lat: 35, lng: 103, tariff: 15, topCommodity: 'Oil', tradePartner: 'United States', tradeLat: 38, tradeLng: -97, tradeVolume: 900, lastChange: -1 },
    { country: 'Germany', lat: 51, lng: 10, tariff: 7, topCommodity: 'Wheat', tradePartner: 'Brazil', tradeLat: -14, tradeLng: -51, tradeVolume: 700, lastChange: 1 },
    { country: 'Brazil', lat: -14, lng: -51, tariff: 12, topCommodity: 'Steel', tradePartner: 'Germany', tradeLat: 51, tradeLng: 10, tradeVolume: 800, lastChange: -1 },
    { country: 'India', lat: 21, lng: 78, tariff: 18, topCommodity: 'Electronics', tradePartner: 'Russia', tradeLat: 61, tradeLng: 100, tradeVolume: 600, lastChange: 1 },
    { country: 'Russia', lat: 61, lng: 100, tariff: 10, topCommodity: 'Textiles', tradePartner: 'India', tradeLat: 21, tradeLng: 78, tradeVolume: 500, lastChange: -1 },
    { country: 'Australia', lat: -25, lng: 133, tariff: 6, topCommodity: 'Machinery', tradePartner: 'Japan', tradeLat: 36, tradeLng: 138, tradeVolume: 400, lastChange: 1 },
    { country: 'South Africa', lat: -30, lng: 25, tariff: 9, topCommodity: 'Copper', tradePartner: 'Canada', tradeLat: 56, tradeLng: -106, tradeVolume: 300, lastChange: -1 },
    { country: 'Canada', lat: 56, lng: -106, tariff: 4, topCommodity: 'Oil', tradePartner: 'South Africa', tradeLat: -30, tradeLng: 25, tradeVolume: 200, lastChange: 1 },
    { country: 'Japan', lat: 36, lng: 138, tariff: 8, topCommodity: 'Wheat', tradePartner: 'Australia', tradeLat: -25, tradeLng: 133, tradeVolume: 100, lastChange: -1 }
  ];
}

interface TariffPoint {
  country: string;
  lat: number;
  lng: number;
  tariff: number;
  topCommodity: string;
  tradePartner: string;
  tradeLat: number;
  tradeLng: number;
  tradeVolume: number;
  lastChange: number;
}

// Add type for arc data
interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  commodity: string;
  volume: number;
  tariff: number;
  lastChange: number;
  progress: number; // 0-1, for animation
}

export default function GlobalTariffMap() {
  const globeEl = useRef<any>();
  const [tariffData, setTariffData] = useState<TariffPoint[]>([]);
  const [hoverArc, setHoverArc] = useState<ArcData | null>(null);
  const [arcs, setArcs] = useState<ArcData[]>([]);
  const [screenLabels, setScreenLabels] = useState<any[]>([]);
  const [hoverPort, setHoverPort] = useState<TariffPoint | null>(null);
  const [selectedPort, setSelectedPort] = useState<TariffPoint | null>(null);
  const [selectedArc, setSelectedArc] = useState<ArcData | null>(null);
  const [commodityPercents, setCommodityPercents] = useState<{ [key: string]: number[] }>({});
  const [initialPercents, setInitialPercents] = useState<{ [key: string]: number[] }>({});

  // Fetch and update data every 5 seconds
  useEffect(() => {
    let mounted = true;
    async function updateData() {
      const data = await fetchTariffData();
      if (mounted) setTariffData(data);
      if (mounted) setArcs(data.map(d => ({
        startLat: d.lat,
        startLng: d.lng,
        endLat: d.tradeLat,
        endLng: d.tradeLng,
        color: d.lastChange > 0 ? '#22c55e' : '#ef4444',
        commodity: d.topCommodity,
        volume: d.tradeVolume,
        tariff: d.tariff,
        lastChange: d.lastChange,
        progress: Math.random() // randomize initial position
      })));
    }
    updateData();
    const interval = setInterval(() => {
      updateData();
      setTariffData(prev => prev.map(d => ({ ...d, tariff: Math.max(0, d.tariff + (Math.random() - 0.5) * 2), lastChange: Math.random() > 0.5 ? 1 : -1 })));
      setArcs(prev => prev.map(a => ({ ...a, volume: Math.max(50, a.volume + (Math.random() - 0.5) * 50), tariff: Math.max(0, a.tariff + (Math.random() - 0.5) * 2), lastChange: Math.random() > 0.5 ? 1 : -1 })));
    }, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Animate arc progress for moving labels
  useEffect(() => {
    const anim = setInterval(() => {
      setArcs(prev => prev.map(a => ({ ...a, progress: (a.progress + 0.01) % 1 })));
    }, 50);
    return () => clearInterval(anim);
  }, []);

  // Project arc label positions to screen
  useEffect(() => {
    if (!globeEl.current || !globeEl.current.getScreenCoords) return;
    const globe = globeEl.current;
    const labels = arcs.map(arc => {
      // Interpolate position along arc
      const t = arc.progress;
      const lat = arc.startLat + (arc.endLat - arc.startLat) * t;
      const lng = arc.startLng + (arc.endLng - arc.startLng) * t;
      const r = 100; // globe radius
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      // Project to screen
      let coords = { x: 0, y: 0 };
      if (globe && globeEl.current.camera && globeEl.current.renderer) {
        const vec = new THREE.Vector3(x, y, z);
        vec.project(globeEl.current.camera());
        const width = globeEl.current.renderer().domElement.width;
        const height = globeEl.current.renderer().domElement.height;
        coords.x = (vec.x * 0.5 + 0.5) * width;
        coords.y = (1 - (vec.y * 0.5 + 0.5)) * height;
      }
      return { ...arc, screen: coords };
    });
    setScreenLabels(labels);
  }, [arcs]);

  useEffect(() => {
    if (globeEl.current && globeEl.current.controls) {
      globeEl.current.controls().enableZoom = false;
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.2;
    }
    if (globeEl.current && globeEl.current.camera) {
      globeEl.current.camera().position.z = 250;
    }
  }, []);

  // Color scale for tariffs
  function getTariffColor(tariff: number) {
    if (tariff > 15) return '#ef4444'; // red
    if (tariff > 10) return '#f59e42'; // orange
    if (tariff > 7) return '#fbbf24'; // yellow
    return '#22c55e'; // green
  }

  // Neon glow effect for points
  function getGlowShadow(color: string) {
    return `0 0 12px 2px ${color}99, 0 0 32px 8px ${color}33`;
  }

  // Helper to get or set initial percent for a port
  function ensureInitialPercents(port: TariffPoint | null) {
    if (!port) return;
    setInitialPercents(prev => {
      if (prev[port.country]) return prev;
      // Use a random value between -2 and 2 for each commodity
      return {
        ...prev,
        [port.country]: [
          (Math.random() * 4 - 2),
          (Math.random() * 4 - 2),
          (Math.random() * 4 - 2)
        ]
      };
    });
  }

  useEffect(() => {
    ensureInitialPercents(hoverPort);
    ensureInitialPercents(selectedPort);
  }, [hoverPort, selectedPort]);

  // Update commodity percentages every 1.2 seconds, within ±0.025% of initial value
  useEffect(() => {
    const updatePercents = () => {
      const updateFor = (port: TariffPoint | null) => {
        if (!port) return;
        setCommodityPercents(prev => {
          const base = initialPercents[port.country] || [0, 0, 0];
          return {
            ...prev,
            [port.country]: base.map(init => {
              // Fluctuate within ±0.025% of initial value
              const delta = (Math.random() - 0.5) * 0.05;
              let newVal = init + delta;
              // Clamp to ±0.025% of initial
              if (newVal > init + 0.025) newVal = init + 0.025;
              if (newVal < init - 0.025) newVal = init - 0.025;
              return newVal;
            })
          };
        });
      };
      updateFor(hoverPort);
      updateFor(selectedPort);
    };
    updatePercents();
    const interval = setInterval(updatePercents, 1200);
    return () => clearInterval(interval);
  }, [hoverPort, selectedPort, initialPercents]);

  return (
    <div
      style={{
        width: '100%',
        height: 780,
        minHeight: 780,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: '#0a192f',
        borderRadius: 20,
        boxShadow: '0 4px 32px #0008',
        position: 'relative',
        marginTop: 40
      }}
      onClick={e => {
        // Only clear if the click is on the background, not on a panel or Globe overlay
        if ((e.target as HTMLElement).closest('.panel-persistent') || (e.target as HTMLElement).closest('.globe-interactive')) return;
        setSelectedPort(null);
        setSelectedArc(null);
      }}
    >
      <Globe
        ref={globeEl}
        globeImageUrl={EARTH_TEXTURE}
        backgroundColor="#0a192f"
        showAtmosphere={true}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.18}
        animateIn={true}
        width={775}
        height={775}
        arcsData={arcs as object[]}
        arcStartLat={(a: object) => (a as ArcData).startLat}
        arcStartLng={(a: object) => (a as ArcData).startLng}
        arcEndLat={(a: object) => (a as ArcData).endLat}
        arcEndLng={(a: object) => (a as ArcData).endLng}
        arcColor={(a: object) => {
          const arc = a as ArcData;
          if (selectedArc &&
              arc.startLat === selectedArc.startLat &&
              arc.startLng === selectedArc.startLng &&
              arc.endLat === selectedArc.endLat &&
              arc.endLng === selectedArc.endLng &&
              arc.commodity === selectedArc.commodity) {
            // Neon highlight for selected arc
            return [arc.color === '#22c55e' ? '#00ff99' : '#ff2d55', arc.color === '#22c55e' ? '#00ff99' : '#ff2d55'];
          }
          return [arc.color, arc.color];
        }}
        arcDashLength={() => 0.4}
        arcDashGap={() => 0.15}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={() => 4000}
        arcStroke={(a: object) => {
          const arc = a as ArcData;
          if (selectedArc &&
              arc.startLat === selectedArc.startLat &&
              arc.startLng === selectedArc.startLng &&
              arc.endLat === selectedArc.endLat &&
              arc.endLng === selectedArc.endLng &&
              arc.commodity === selectedArc.commodity) {
            return 6;
          }
          return 2.5 + arc.volume / 500;
        }}
        arcLabel={(a: object) => {
          const arc = a as ArcData;
          return `<div style='font-size:13px;'><b>${arc.commodity}</b> <span style='color:${arc.lastChange > 0 ? '#22c55e' : '#ef4444'};font-weight:700;'>${arc.lastChange > 0 ? '▲' : '▼'}${Math.abs(arc.tariff).toFixed(1)}%</span></div>`;
        }}
        arcAltitude={0.18}
        onArcHover={(arc: object | null) => setHoverArc(arc as ArcData)}
        onArcClick={(arc: object) => {
          setSelectedArc(arc as ArcData);
          setSelectedPort(null);
        }}
        pointsData={tariffData as object[]}
        pointLat={(d: object) => (d as TariffPoint).lat}
        pointLng={(d: object) => (d as TariffPoint).lng}
        pointColor={(d: object) => {
          const t = d as TariffPoint;
          if (selectedPort && selectedPort.country === t.country) return '#38bdf8'; // neon blue for selected
          return '#3b82f6';
        }}
        pointAltitude={() => 0.09}
        pointRadius={(d: object) => {
          const t = d as TariffPoint;
          return selectedPort && selectedPort.country === t.country ? 3.2 : 1.7;
        }}
        pointLabel={(d: object) => {
          const t = d as TariffPoint;
          return `<div style='font-size:15px;font-weight:700;color:#fff;'>${t.country}</div>`;
        }}
        onPointHover={(point: object | null) => setHoverPort(point as TariffPoint)}
        onPointClick={(point: object) => setSelectedPort(point as TariffPoint)}
      />
      {/* Port hover tooltip with live commodities (only if not selected) */}
      {hoverPort && !selectedPort && !selectedArc && (
        <div style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: '#181f2aee', color: '#fff', borderRadius: 12, padding: '18px 28px', boxShadow: getGlowShadow('#3b82f6'), fontSize: 18, zIndex: 10, border: '1.5px solid #3b82f6', minWidth: 320 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{hoverPort.country} Trade Port</div>
          <div style={{ fontSize: 15, opacity: 0.8, marginBottom: 8 }}>Top Commodities:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[hoverPort.topCommodity, 'Steel', 'Electronics'].map((c, i) => {
              const pct = commodityPercents[hoverPort.country]?.[i] ?? 0;
              const up = pct > 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 700, color: up ? '#22c55e' : '#ef4444', textShadow: `0 0 8px ${up ? '#22c55e' : '#ef4444'}99` }}>
                  <span style={{ fontSize: 22, marginRight: 8 }}>{up ? '▲' : '▼'}</span>
                  {c} <span style={{ marginLeft: 10, fontWeight: 900 }}>{up ? '+' : '-'}{Math.abs(pct).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Selected port panel (persistent) */}
      {selectedPort && !selectedArc && (
        <div className="panel-persistent" style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)', background: '#0a223aee', color: '#fff', borderRadius: 14, padding: '22px 32px', boxShadow: getGlowShadow('#38bdf8'), fontSize: 20, zIndex: 20, border: '2px solid #38bdf8', minWidth: 340 }}>
          <div style={{ fontWeight: 800, fontSize: 25, marginBottom: 10, color: '#38bdf8', textShadow: '0 0 16px #38bdf8cc' }}>{selectedPort.country} Trade Port</div>
          <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 10 }}>Top Commodities:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[selectedPort.topCommodity, 'Steel', 'Electronics'].map((c, i) => {
              const pct = commodityPercents[selectedPort.country]?.[i] ?? 0;
              const up = pct > 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: 19, fontWeight: 800, color: up ? '#22c55e' : '#ef4444', textShadow: `0 0 12px ${up ? '#22c55e' : '#ef4444'}99` }}>
                  <span style={{ fontSize: 24, marginRight: 10 }}>{up ? '▲' : '▼'}</span>
                  {c} <span style={{ marginLeft: 12, fontWeight: 900 }}>{up ? '+' : '-'}{Math.abs(pct).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Arc hover tooltip (trade route) */}
      {hoverArc && !selectedArc && !selectedPort && (
        <div style={{ position: 'absolute', top: '50%', right: 32, transform: 'translateY(-50%)', background: '#181f2aee', color: '#fff', borderRadius: 12, padding: '18px 28px', boxShadow: getGlowShadow(hoverArc.color), fontSize: 18, zIndex: 10, border: `1.5px solid ${hoverArc.color}` }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{hoverArc.commodity} Trade Route</div>
          <div style={{ margin: '6px 0' }}>
            {hoverArc.startLat.toFixed(1)}, {hoverArc.startLng.toFixed(1)} → {hoverArc.endLat.toFixed(1)}, {hoverArc.endLng.toFixed(1)}
          </div>
          <div>Tariff: <span style={{ color: hoverArc.color, fontWeight: 700 }}>{hoverArc.tariff.toFixed(1)}%</span></div>
          <div>Volume: <b>{hoverArc.volume}</b></div>
          <div style={{ marginTop: 4, fontSize: 15, color: hoverArc.lastChange > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
            {hoverArc.lastChange > 0 ? '▲' : '▼'} {hoverArc.lastChange > 0 ? '+' : '-'}{Math.abs(hoverArc.tariff).toFixed(1)}% (live)
          </div>
        </div>
      )}
      {/* Selected arc panel (persistent) */}
      {selectedArc && !selectedPort && (
        <div className="panel-persistent" style={{ position: 'absolute', top: '50%', right: 32, transform: 'translateY(-50%)', background: '#181f2aee', color: '#fff', borderRadius: 12, padding: '18px 28px', boxShadow: getGlowShadow(selectedArc.color), fontSize: 18, zIndex: 20, border: `2px solid ${selectedArc.color}` }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{selectedArc.commodity} Trade Route</div>
          <div style={{ margin: '6px 0' }}>
            {selectedArc.startLat.toFixed(1)}, {selectedArc.startLng.toFixed(1)} → {selectedArc.endLat.toFixed(1)}, {selectedArc.endLng.toFixed(1)}
          </div>
          <div>Tariff: <span style={{ color: selectedArc.color, fontWeight: 700 }}>{selectedArc.tariff.toFixed(1)}%</span></div>
          <div>Volume: <b>{selectedArc.volume}</b></div>
          <div style={{ marginTop: 4, fontSize: 15, color: selectedArc.lastChange > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
            {selectedArc.lastChange > 0 ? '▲' : '▼'} {selectedArc.lastChange > 0 ? '+' : '-'}{Math.abs(selectedArc.tariff).toFixed(1)}% (live)
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 24, left: 32, color: '#fff', fontWeight: 700, fontSize: 24, textShadow: '0 2px 8px #0008', letterSpacing: 1 }}>Global Tariff Impact Map</div>
      <div style={{ position: 'absolute', top: 60, left: 32, color: '#fff', fontSize: 15, opacity: 0.8 }}>Live, real-time tariffs, trade flows, and commodity risk. Hover for details.</div>
    </div>
  );
} 