import { NextResponse } from "next/server";

const apiBaseUrl = "https://pos.1472.ai/api/admin/stores/cheongju/sales";
const orderApiUrl = "https://pos.1472.ai/api/admin/stores/cheongju/orders";
const roomSplitStateApiUrl = "https://pos.1472.ai/api/admin/stores/cheongju/room-split-state";

type PosDailyEntry = {
  id?: number | string;
  at?: string;
  orderNo?: string;
  tableNo?: string;
  kind?: string;
  method?: string;
  amount?: number | string;
};

type PosMonthlyDay = {
  date?: string;
  netAmount?: number | string;
  card?: number | string;
  cash?: number | string;
};

type PosOrder = {
  id?: number | string;
  tableNo?: string;
  status?: string;
  amount?: number | string;
  dueAmount?: number | string;
  elapsedMinutes?: number | string;
};

type PosRoomSplitState = {
  splitRoomIds?: string[];
};

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replaceAll(",", "")) || 0;
  return 0;
}

function signedEntryAmount(entry: PosDailyEntry) {
  const amount = numberValue(entry.amount);
  return `${entry.kind ?? ""}`.includes("CANCEL") ? -amount : amount;
}

function parsePosDateTime(value?: string) {
  if (!value) return null;
  const normalized = value.replaceAll(".", "-").replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function chartBuckets(entries: PosDailyEntry[], startHour: number, endHour: number) {
  const buckets = Array.from({ length: endHour - startHour }, (_, index) => {
    const hour = startHour + index;
    return {
      time: `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`,
      rawAmount: 0,
      card: 0,
      cash: 0,
      amount: 0,
    };
  });

  for (const entry of entries) {
    const time = parsePosDateTime(entry.at);
    if (!time) continue;
    const hour = time.getHours();
    if (hour < startHour || hour >= endHour) continue;
    const bucket = buckets[hour - startHour];
    const amount = signedEntryAmount(entry);
    bucket.rawAmount += amount;
    if (`${entry.method ?? ""}`.toUpperCase() === "CASH") {
      bucket.cash += amount;
    } else {
      bucket.card += amount;
    }
  }

  const max = Math.max(...buckets.map((bucket) => bucket.rawAmount), 1);

  return buckets.map((bucket) => ({
    time: bucket.time,
    rawAmount: Math.max(0, bucket.rawAmount),
    card: Math.max(0, bucket.card),
    cash: Math.max(0, bucket.cash),
    amount: Math.round((Math.max(0, bucket.rawAmount) / max) * 100),
  }));
}

function splitEntries(entries: PosDailyEntry[]) {
  return entries.reduce(
    (sum, entry) => {
      const amount = signedEntryAmount(entry);
      const method = `${entry.method ?? ""}`.toUpperCase();
      if (method === "CASH") {
        sum.cash += amount;
      } else {
        sum.card += amount;
      }
      return sum;
    },
    { card: 0, cash: 0 },
  );
}

function dayNumber(date?: string) {
  if (!date) return 0;
  return Number(date.slice(-2)) || 0;
}

function dailySalesItems(entries: PosDailyEntry[]) {
  return entries.map((entry, index) => ({
    id: [
      entry.id ?? "payment",
      entry.kind ?? "kind",
      entry.at ?? "time",
      entry.orderNo ?? "order",
      index,
    ].join("-"),
    paidAt: entry.at ?? "",
    paymentMethod: `${entry.method ?? ""}`.toUpperCase() === "CASH" ? "현금" : "카드",
    amount: Math.max(0, signedEntryAmount(entry)),
  }));
}

function tableStatuses(orders: PosOrder[]) {
  const byTable = new Map<
    string,
    { tableNo: string; amount: number; orderCount: number; elapsedMinutes: number }
  >();

  for (const order of orders) {
    const tableNo = `${order.tableNo ?? ""}`;
    if (!tableNo) continue;
    const current = byTable.get(tableNo) ?? {
      tableNo,
      amount: 0,
      orderCount: 0,
      elapsedMinutes: 0,
    };
    current.amount += numberValue(order.dueAmount) || numberValue(order.amount);
    current.orderCount += 1;
    current.elapsedMinutes = Math.max(
      current.elapsedMinutes,
      numberValue(order.elapsedMinutes),
    );
    byTable.set(tableNo, current);
  }

  const tables = [...byTable.values()].map((table) => ({
    ...table,
    amount: Math.max(0, table.amount),
  }));

  return {
    totalDue: tables.reduce((sum, table) => sum + table.amount, 0),
    activeTableCount: tables.filter((table) => table.amount > 0).length,
    tables,
  };
}

function monthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateValue(date: Date) {
  return `${monthValue(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`POS sales API failed: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const now = new Date();
  const date = url.searchParams.get("date") ?? dateValue(now);
  const month = url.searchParams.get("month") ?? date.slice(0, 7) ?? monthValue(now);

  const [daily, monthly, orders, roomSplitState] = await Promise.all([
    fetchJson(`${apiBaseUrl}/daily?date=${date}`),
    fetchJson(`${apiBaseUrl}/monthly?month=${month}`),
    fetchJson(orderApiUrl),
    fetchJson(roomSplitStateApiUrl),
  ]);

  const entries = Array.isArray(daily?.entries) ? daily.entries as PosDailyEntry[] : [];
  const days = Array.isArray(monthly?.days) ? monthly.days as PosMonthlyDay[] : [];
  const orderRows = Array.isArray(orders) ? orders as PosOrder[] : [];
  const splitRoomIds = Array.isArray((roomSplitState as PosRoomSplitState)?.splitRoomIds)
    ? (roomSplitState as PosRoomSplitState).splitRoomIds ?? []
    : [];
  const split = splitEntries(entries);
  const lunchChart = chartBuckets(entries, 11, 15);
  const dinnerChart = chartBuckets(entries, 17, 23);
  const lunchTotal = lunchChart.reduce((sum, item) => sum + item.rawAmount, 0);
  const dinnerTotal = dinnerChart.reduce((sum, item) => sum + item.rawAmount, 0);
  const monthlyDays = days.map((day) => ({
    day: dayNumber(day.date),
    total: numberValue(day.netAmount),
    lunch: 0,
    dinner: 0,
    card: numberValue(day.card),
    cash: numberValue(day.cash),
  }));
  const monthTotal = monthlyDays.reduce((sum, day) => sum + day.total, 0);
  const monthCardTotal = monthlyDays.reduce((sum, day) => sum + day.card, 0);
  const monthCashTotal = monthlyDays.reduce((sum, day) => sum + day.cash, 0);

  return NextResponse.json({
    store: "어시장브라더스 청주점",
    branch: daily?.branch ?? monthly?.branch ?? "청주봉명점",
    date,
    month,
    daily: {
      total: Math.max(0, split.card + split.cash),
      card: Math.max(0, split.card),
      cash: Math.max(0, split.cash),
      paymentCount: numberValue(daily?.summary?.paymentCount),
      lunchTotal,
      dinnerTotal,
      lunchChart,
      dinnerChart,
      items: dailySalesItems(entries),
    },
    monthly: {
      total: monthTotal,
      card: monthCardTotal,
      cash: monthCashTotal,
      days: monthlyDays,
    },
    realtime: {
      ...tableStatuses(orderRows),
      splitRoomIds,
    },
  });
}
