// client/src/pages/qr-details.tsx
import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Factory, Leaf, Package, Truck, Activity } from "lucide-react";

type TraceabilityData = {
  batch: any;
  product: any;
  farm: any;
  collectionEvents: any[];
  processingEvents: any[];
  sensorData: any[];
};

export default function QRDetailsPage() {
  const [, params] = useRoute("/qr/:code");
  const [, setLocation] = useLocation();
  const code = params?.code ?? "";
  const [data, setData] = useState<TraceabilityData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/qr-provenance/${encodeURIComponent(code)}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `HTTP ${res.status}`);
        }
        const j = await res.json();
        setData(j);
      } catch (e: any) {
        setErr(e?.message || "Failed to fetch provenance");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const timeline = useMemo(() => {
    if (!data) return [];

    const items: {
      ts: string;
      title: string;
      icon: "leaf" | "factory" | "truck" | "package" | "activity";
      meta?: string;
      body?: string;
    }[] = [];

    // Harvest (batch.harvestDate)
    if (data.batch?.harvestDate) {
      items.push({
        ts: data.batch.harvestDate,
        title: "Harvested",
        icon: "leaf",
        meta: data.farm ? `${data.farm.name} – ${data.farm.location}` : undefined,
      });
    }

    // Collection events
    for (const ev of data.collectionEvents ?? []) {
      items.push({
        ts: ev.collectionDate || ev.createdAt || "",
        title: "Collected",
        icon: "truck",
        meta: ev.moistureLevel ? `Moisture: ${ev.moistureLevel}%` : undefined,
        body: ev.qualityNotes || undefined,
      });
    }

    // Processing events
    for (const ev of data.processingEvents ?? []) {
      const t = (ev.processType || "").toString();
      items.push({
        ts: ev.processDate || ev.createdAt || "",
        title: `Processing – ${t}`,
        icon: t === "packaging" ? "package" : "factory",
        meta: ev.facilityName || undefined,
        body: ev.notes || undefined,
      });
    }

    // “Ready/Shipped” from batch status
    if (data.batch?.status) {
      items.push({
        ts: data.batch.updatedAt || data.batch.createdAt || "",
        title: `Status – ${data.batch.status}`,
        icon: data.batch.status === "shipped" ? "truck" : "activity",
      });
    }

    // Sort by time asc
    return items
      .filter((i) => !!i.ts)
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }, [data]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => history.length > 1 ? history.back() : setLocation("/qr")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Badge variant="secondary">QR: {code}</Badge>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-2">
            <h1 className="text-2xl font-bold">Product Provenance</h1>
            {loading && <p className="text-muted-foreground">Loading…</p>}
            {err && <p className="text-destructive">{err}</p>}

            {data && !loading && !err && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Product</div>
                    <div className="font-medium">{data.product?.name || "-"}</div>
                    <div className="text-xs text-muted-foreground">{data.product?.scientificName || ""}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Batch</div>
                    <div className="font-medium">{data.batch?.batchNumber || "-"}</div>
                    <div className="text-xs text-muted-foreground">Status: {data.batch?.status || "-"}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Farm</div>
                    <div className="font-medium">{data.farm?.name || "-"}</div>
                    <div className="text-xs text-muted-foreground">{data.farm?.location || ""}</div>
                  </div>
                </div>

                {/* “Blockchain-like” timeline */}
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-3 top-1.5 w-3 h-3 rounded-full bg-primary" />
                        <div className="flex items-start gap-3">
                          <Icon name={item.icon} />
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.ts).toLocaleString()}
                            </div>
                            {item.meta && (
                              <div className="text-sm mt-1">{item.meta}</div>
                            )}
                            {item.body && (
                              <div className="text-sm text-muted-foreground mt-1">{item.body}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {timeline.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No events recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest sensor snapshot */}
                {!!data.sensorData?.length && (
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground mb-2">Recent Sensor Readings</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {data.sensorData.slice(-4).map((s: any) => (
                        <div key={s.id} className="text-sm">
                          <div className="font-medium capitalize">{s.sensorType}</div>
                          <div className="text-muted-foreground">
                            {s.value}{s.unit ? ` ${s.unit}` : ""} · {new Date(s.timestamp || s.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Icon({ name }: { name: "leaf" | "factory" | "truck" | "package" | "activity" }) {
  const cls = "w-5 h-5 text-primary mt-0.5";
  switch (name) {
    case "leaf": return <Leaf className={cls} />;
    case "factory": return <Factory className={cls} />;
    case "truck": return <Truck className={cls} />;
    case "package": return <Package className={cls} />;
    default: return <Activity className={cls} />;
  }
}
