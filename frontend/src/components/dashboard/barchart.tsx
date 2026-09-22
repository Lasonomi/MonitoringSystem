"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const kecamatanData = [
  {
    kecamatan: "Lumajang",
    total: 320,
  },
  {
    kecamatan: "Sukodono",
    total: 245,
  },
  {
    kecamatan: "Senduro",
    total: 210,
  },
  {
    kecamatan: "Pasrujambe",
    total: 180,
  },
  {
    kecamatan: "Tempeh",
    total: 165,
  },
  {
    kecamatan: "Yosowilangun",
    total: 150,
  },
];

export function Barchart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          IndiBiz per Kecamatan
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Kecamatan dengan jumlah pengguna IndiBiz
          terbanyak
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={kecamatanData}
              layout="vertical"
              margin={{
                left: 10,
                right: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="kecamatan"
                width={90}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="total"
                name="Pengguna IndiBiz"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}