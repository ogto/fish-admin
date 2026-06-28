"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export type MenuKey =
  | "dashboard"
  | "purchase"
  | "sales"
  | "stats"
  | "staff"
  | "reviews"
  | "settings";

const menuItems = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard, href: "/admin/dashboard" },
  { key: "purchase", label: "매입관리", icon: PackageCheck, href: "/admin/purchase" },
  { key: "sales", label: "매출관리", icon: ReceiptText, href: "/admin/sales" },
  { key: "reviews", label: "네이버리뷰[베타]", icon: NaverIcon, href: "/admin/reviews" },
  { key: "staff", label: "직원관리", icon: UsersRound, href: "/admin/staff" },
  { key: "stats", label: "통계", icon: BarChart3, href: "/admin/stats" },
  { key: "settings", label: "설정", icon: Settings, href: "/admin/settings" },
] satisfies Array<{ key: MenuKey; label: string; icon: React.ElementType; href: string }>;

const pageMeta: Record<MenuKey, { title: string }> = {
  dashboard: {
    title: "운영 대시보드",
  },
  purchase: {
    title: "매입관리",
  },
  sales: {
    title: "매출관리",
  },
  stats: {
    title: "통계",
  },
  staff: {
    title: "직원관리",
  },
  reviews: {
    title: "네이버리뷰[베타]",
  },
  settings: {
    title: "설정",
  },
};

const dayOffStaff = [
  { name: "김민준", role: "주방" },
  { name: "박서연", role: "홀" },
];

type StaffStatus = "근무중" | "휴무" | "퇴근" | "대기";

type StaffMember = {
  name: string;
  role: "주방" | "홀";
  status: StaffStatus;
  phone: string;
  salary: number;
};

const staffMembers: StaffMember[] = [
  {
    name: "김민준",
    role: "주방",
    status: "휴무",
    phone: "010-2481-1190",
    salary: 3200000,
  },
  {
    name: "박서연",
    role: "홀",
    status: "휴무",
    phone: "010-3918-7742",
    salary: 2900000,
  },
  {
    name: "최유진",
    role: "홀",
    status: "근무중",
    phone: "010-8042-6133",
    salary: 3100000,
  },
  {
    name: "이하준",
    role: "주방",
    status: "근무중",
    phone: "010-6621-4901",
    salary: 3400000,
  },
  {
    name: "정다은",
    role: "홀",
    status: "대기",
    phone: "010-1844-7320",
    salary: 1800000,
  },
  {
    name: "오지훈",
    role: "주방",
    status: "퇴근",
    phone: "010-5531-0218",
    salary: 3000000,
  },
];

const lunchSales = [
  { time: "11:00-12:00", amount: 42, rawAmount: 420000, card: 360000, cash: 60000 },
  { time: "12:00-13:00", amount: 88, rawAmount: 880000, card: 780000, cash: 100000 },
  { time: "13:00-14:00", amount: 76, rawAmount: 760000, card: 650000, cash: 110000 },
  { time: "14:00-15:00", amount: 51, rawAmount: 510000, card: 394000, cash: 116000 },
];

const dinnerSales = [
  { time: "17:00-18:00", amount: 58, rawAmount: 580000, card: 520000, cash: 60000 },
  { time: "18:00-19:00", amount: 92, rawAmount: 920000, card: 850000, cash: 70000 },
  { time: "19:00-20:00", amount: 100, rawAmount: 1000000, card: 910000, cash: 90000 },
  { time: "20:00-21:00", amount: 73, rawAmount: 730000, card: 690000, cash: 40000 },
  { time: "21:00-22:00", amount: 46, rawAmount: 460000, card: 410000, cash: 50000 },
  { time: "22:00-23:00", amount: 28, rawAmount: 280000, card: 250000, cash: 30000 },
];

type PurchaseItem = {
  id: string;
  purchasedOn: string;
  vendor: string;
  category: string;
  amount: number;
  paymentMethod: string;
  manager: string;
  memo: string;
  receiptNo: string;
  receiptImageUrl?: string | null;
};

type SalesMode = "month" | "daily";

type MonthSalesDay = {
  day: number;
  total: number;
  lunch: number;
  dinner: number;
  card: number;
  cash: number;
  hall: number;
  takeout: number;
};

type SalesCalendarCell = {
  key: string;
  day: number | null;
  weekday: number;
  data: MonthSalesDay | null;
};

type DailySalesItem = {
  id: string;
  paidAt: string;
  paymentMethod: string;
  amount: number;
};

type NaverReviewItem = {
  id: string;
  author: string;
  date: string;
  content: string;
  link?: string;
  imageUrl?: string;
  source: "visitor" | "blog";
};

type NaverReviewSnapshot = {
  place: {
    id: string;
    name: string;
    category: string;
    address: string;
    imageUrl?: string;
    naverMapUrl: string;
  };
  counts: {
    visitor: number;
    blog: number;
  };
  visitorReviews: NaverReviewItem[];
  blogReviews: NaverReviewItem[];
  fetchedAt: string;
  partial: boolean;
  message?: string;
};

type SalesChartPoint = {
  time: string;
  amount: number;
  rawAmount?: number;
  card?: number;
  cash?: number;
};

type SalesSnapshot = {
  store: string;
  branch: string;
  date: string;
  month: string;
  daily: {
    total: number;
    card: number;
    cash: number;
    hallTotal: number;
    takeoutTotal: number;
    paymentCount: number;
    lunchTotal: number;
    dinnerTotal: number;
    lunchChart: SalesChartPoint[];
    dinnerChart: SalesChartPoint[];
    items: DailySalesItem[];
  };
  monthly: {
    total: number;
    card: number;
    cash: number;
    days: MonthSalesDay[];
  };
  realtime: {
    totalDue: number;
    activeTableCount: number;
    splitRoomIds: string[];
    tables: TableRealtimeStatus[];
  };
};

type SalesSnapshotState = {
  snapshot: SalesSnapshot;
  isLive: boolean;
  loadedDate: string | null;
};

type TableRealtimeStatus = {
  tableNo: string;
  amount: number;
  orderCount: number;
  elapsedMinutes: number;
};

const purchaseItems: PurchaseItem[] = [
  {
    id: "P-240624-001",
    purchasedOn: "2026-06-24",
    vendor: "부산 공동어시장",
    category: "원재료",
    amount: 1260000,
    paymentMethod: "계좌이체",
    manager: "김민준",
    memo: "광어 42kg 입고",
    receiptNo: "R-0624-001",
    receiptImageUrl: null,
  },
  {
    id: "P-240624-002",
    purchasedOn: "2026-06-24",
    vendor: "제주 선단 3호",
    category: "원재료",
    amount: 980000,
    paymentMethod: "카드",
    manager: "박서연",
    memo: "갈치 28박스",
    receiptNo: "R-0624-002",
    receiptImageUrl: null,
  },
  {
    id: "P-240623-006",
    purchasedOn: "2026-06-23",
    vendor: "통영 활어센터",
    category: "원재료",
    amount: 720000,
    paymentMethod: "현금",
    manager: "최유진",
    memo: "영수증 금액 재확인 필요",
    receiptNo: "R-0623-006",
    receiptImageUrl: null,
  },
  {
    id: "P-240623-004",
    purchasedOn: "2026-06-23",
    vendor: "남해 포장상사",
    category: "포장재",
    amount: 184000,
    paymentMethod: "카드",
    manager: "이하준",
    memo: "회 포장 용기",
    receiptNo: "R-0623-004",
    receiptImageUrl: null,
  },
];

const monthSalesDays: MonthSalesDay[] = [
  { day: 1, total: 772000, lunch: 286000, dinner: 486000, card: 606000, cash: 166000, hall: 772000, takeout: 0 },
  { day: 2, total: 745000, lunch: 312000, dinner: 433000, card: 637000, cash: 108000, hall: 745000, takeout: 0 },
  { day: 3, total: 1532400, lunch: 524000, dinner: 1008400, card: 1299000, cash: 233400, hall: 1532400, takeout: 0 },
  { day: 4, total: 695200, lunch: 251000, dinner: 444200, card: 518200, cash: 177000, hall: 695200, takeout: 0 },
  { day: 5, total: 1177400, lunch: 407000, dinner: 770400, card: 958600, cash: 218800, hall: 1177400, takeout: 0 },
  { day: 6, total: 1871800, lunch: 642000, dinner: 1229800, card: 1339600, cash: 532200, hall: 1871800, takeout: 0 },
  { day: 7, total: 933400, lunch: 338000, dinner: 595400, card: 724400, cash: 209000, hall: 933400, takeout: 0 },
  { day: 8, total: 478800, lunch: 166000, dinner: 312800, card: 338800, cash: 140000, hall: 478800, takeout: 0 },
  { day: 9, total: 605600, lunch: 224000, dinner: 381600, card: 416800, cash: 188800, hall: 605600, takeout: 0 },
  { day: 10, total: 931700, lunch: 318000, dinner: 613700, card: 728600, cash: 203100, hall: 931700, takeout: 0 },
  { day: 11, total: 1076600, lunch: 394000, dinner: 682600, card: 646000, cash: 430600, hall: 1076600, takeout: 0 },
  { day: 12, total: 926600, lunch: 329000, dinner: 597600, card: 785600, cash: 141000, hall: 926600, takeout: 0 },
  { day: 13, total: 1903800, lunch: 616000, dinner: 1287800, card: 1613400, cash: 290400, hall: 1903800, takeout: 0 },
  { day: 14, total: 943800, lunch: 348000, dinner: 595800, card: 673800, cash: 270000, hall: 943800, takeout: 0 },
];

const dailySalesItems: DailySalesItem[] = [
  {
    id: "S-240624-001",
    paidAt: "2026-06-24 11:42",
    paymentMethod: "카드",
    amount: 68000,
  },
  {
    id: "S-240624-002",
    paidAt: "2026-06-24 12:18",
    paymentMethod: "간편결제",
    amount: 92000,
  },
  {
    id: "S-240624-003",
    paidAt: "2026-06-24 18:36",
    paymentMethod: "카드",
    amount: 128000,
  },
  {
    id: "S-240624-004",
    paidAt: "2026-06-24 20:11",
    paymentMethod: "현금",
    amount: 54000,
  },
];

const fallbackSalesSnapshot: SalesSnapshot = {
  store: "어시장브라더스 청주점",
  branch: "청주봉명점",
  date: "2026-06-24",
  month: "2026-06",
  daily: {
    total: dailySalesItems.reduce((sum, row) => sum + row.amount, 0),
    card: 288000,
    cash: 54000,
    hallTotal: dailySalesItems.reduce((sum, row) => sum + row.amount, 0),
    takeoutTotal: 0,
    paymentCount: dailySalesItems.length,
    lunchTotal: 2184000,
    dinnerTotal: 4736000,
    lunchChart: lunchSales,
    dinnerChart: dinnerSales,
    items: dailySalesItems,
  },
  monthly: {
    total: monthSalesDays.reduce((sum, row) => sum + row.total, 0),
    card: monthSalesDays.reduce((sum, row) => sum + row.card, 0),
    cash: monthSalesDays.reduce((sum, row) => sum + row.cash, 0),
    days: monthSalesDays,
  },
  realtime: {
    totalDue: 830000,
    activeTableCount: 5,
    splitRoomIds: ["r2"],
    tables: [
      { tableNo: "r2-1", amount: 442000, orderCount: 6, elapsedMinutes: 164 },
      { tableNo: "3", amount: 130000, orderCount: 7, elapsedMinutes: 77 },
      { tableNo: "6", amount: 68000, orderCount: 2, elapsedMinutes: 24 },
      { tableNo: "11", amount: 53000, orderCount: 2, elapsedMinutes: 16 },
      { tableNo: "14", amount: 137000, orderCount: 6, elapsedMinutes: 111 },
    ],
  },
};

function buildSalesMonthCells(year: number, month: number, days: MonthSalesDay[]) {
  const dataByDay = new Map(days.map((day) => [day.day, day]));
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const cells: SalesCalendarCell[] = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({
      key: `blank-${index}`,
      day: null,
      weekday: index,
      data: null,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month - 1, day);
    cells.push({
      key: `day-${day}`,
      day,
      weekday: date.getDay(),
      data: dataByDay.get(day) ?? {
        day,
        total: 0,
        lunch: 0,
        dinner: 0,
        card: 0,
        cash: 0,
        hall: 0,
        takeout: 0,
      },
    });
  }

  return cells;
}

function weekdayLabel(weekday: number) {
  return ["일", "월", "화", "수", "목", "금", "토"][weekday] ?? "";
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return {
    year: Number.isFinite(year) ? year : 2026,
    month: Number.isFinite(month) ? month : 6,
  };
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return {
    year,
    month,
    day,
  };
}

function useFishSalesSnapshot(date = getTodayInputValue()) {
  const [salesState, setSalesState] = useState<SalesSnapshotState>({
    snapshot: fallbackSalesSnapshot,
    isLive: false,
    loadedDate: null,
  });

  useEffect(() => {
    let cancelled = false;
    const month = date.slice(0, 7);

    fetch(`/api/sales/cheongju?date=${date}&month=${month}`)
      .then((response) => {
        if (!response.ok) throw new Error("sales api failed");
        return response.json() as Promise<SalesSnapshot>;
      })
      .then((data) => {
        if (cancelled) return;
        setSalesState({
          snapshot: data,
          isLive: true,
          loadedDate: date,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSalesState({
          snapshot: fallbackSalesSnapshot,
          isLive: false,
          loadedDate: date,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return {
    snapshot: salesState.snapshot,
    isLive: salesState.isLive,
    isLoading: salesState.loadedDate !== date,
  };
}

function useNaverReviews() {
  const [snapshot, setSnapshot] = useState<NaverReviewSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/reviews/naver")
      .then((response) => {
        if (!response.ok) throw new Error("review api failed");
        return response.json() as Promise<NaverReviewSnapshot>;
      })
      .then((data) => {
        if (cancelled) return;
        setSnapshot(data);
        setErrorMessage("");
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage("리뷰 데이터를 불러오지 못했습니다.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, isLoading, errorMessage };
}

function staffRoleStyle(role: string) {
  if (role === "주방") {
    return {
      row: "bg-[#fff3df]",
      badge: "bg-[#f59e0b] text-white",
      line: "bg-[#f59e0b]",
    };
  }

  if (role === "홀") {
    return {
      row: "bg-[#eef9df]",
      badge: "bg-[#84cc16] text-[#24420a]",
      line: "bg-[#84cc16]",
    };
  }

  return staffRoleStyle("홀");
}

export function AdminPageContent({ activeMenu }: { activeMenu: MenuKey }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeMeta = pageMeta[activeMenu];

  function handleLogout() {
    window.localStorage.removeItem("fish-admin-auth");
    document.cookie = "fish-admin-auth=; path=/; max-age=0; SameSite=Lax";
    router.replace("/login");
  }

  return (
    <main className="min-h-dvh max-w-full overflow-x-hidden bg-[var(--background)] text-[var(--ink)]">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1680px] grid-cols-1 overflow-x-hidden lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 hidden h-dvh border-r border-[var(--line)] bg-[var(--paper)]/88 p-5 backdrop-blur lg:block">
          <BrandBlock />
          <nav className="mt-8 space-y-1.5">
            {menuItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={activeMenu === item.key}
              />
            ))}
          </nav>
        </aside>

        <section className="min-w-0 max-w-full overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--background)]/88 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--sea)] lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-black tracking-[0.08em] text-[var(--sea)]">
                    어시장브라더스
                  </p>
                  <h1 className="truncate text-xl font-black text-[var(--ink)] md:text-2xl">
                    {activeMeta.title}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-11 w-11 place-items-center rounded-[8px] bg-[var(--sea)] text-white shadow-lg shadow-[#126aa1]/18">
                  <Bell className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[var(--line)] bg-white px-3 text-sm font-black text-slate-600 shadow-sm transition hover:border-[var(--sea)] hover:text-[var(--sea)]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            </div>
          </header>

          <div className="admin-scroll mx-auto w-full max-w-[1280px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
            {activeMenu === "dashboard" && <DashboardContent />}
            {activeMenu === "purchase" && <PurchaseManagement />}
            {activeMenu === "sales" && <SalesManagement />}
            {activeMenu === "reviews" && <ReviewInspection />}
            {activeMenu === "stats" && <StatsManagement />}
            {activeMenu === "staff" && <StaffManagement />}
            {activeMenu !== "dashboard" &&
              activeMenu !== "purchase" &&
              activeMenu !== "sales" &&
              activeMenu !== "reviews" &&
              activeMenu !== "stats" &&
              activeMenu !== "staff" && (
              <EmptySection title={activeMeta.title} />
            )}
          </div>
        </section>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b3555]/35 p-3 backdrop-blur-sm lg:hidden">
          <div className="h-full rounded-[8px] bg-[var(--paper)] p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <BrandBlock compact />
              <button
                className="grid h-11 w-11 place-items-center rounded-[8px] border border-[var(--line)] bg-white text-[var(--sea)]"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-5 space-y-2">
              {menuItems.map((item) => (
                <NavButton
                  key={item.key}
                  item={item}
                  active={activeMenu === item.key}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminPage() {
  return <AdminPageContent activeMenu="dashboard" />;
}

function DashboardContent() {
  const { snapshot, isLive, isLoading } = useFishSalesSnapshot();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-black text-slate-400">{snapshot.branch}</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--ink)]">
            오늘 실시간 매출 {formatMoney(snapshot.daily.total)}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isLive ? "bg-[#e6f4eb] text-[#2f6848]" : "bg-[#fff3df] text-[#9a650a]"
          }`}
        >
          {isLive ? "실시간 연동" : "목업 데이터"}
        </span>
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <TodayOffCard />
        <div className="grid gap-4 lg:grid-cols-2">
          <SalesChart
            title="점심 매출"
            total={formatMoney(snapshot.daily.lunchTotal)}
            data={snapshot.daily.lunchChart}
            tone="lunch"
          />
          <SalesChart
            title="저녁 매출"
            total={formatMoney(snapshot.daily.dinnerTotal)}
            data={snapshot.daily.dinnerChart}
            tone="dinner"
          />
        </div>
      </div>
      <LiveFloorBoard snapshot={snapshot} />
    </section>
  );
}

function SkeletonBlock({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-slate-200/80 ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

function DashboardSkeleton() {
  return (
    <section className="mt-4 space-y-4" aria-label="Loading dashboard">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <SkeletonBlock className="h-8 w-full max-w-[360px]" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <article className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-7 w-14 rounded-full" />
          </div>
          <div className="mt-4 flex gap-3">
            <SkeletonBlock className="h-2 w-16" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </article>

        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((chartIndex) => (
            <article
              key={chartIndex}
              className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-6 w-24" />
                <SkeletonBlock className="h-6 w-32" />
              </div>
              <div className="mt-5 grid h-[230px] grid-cols-6 items-end gap-3 rounded-[8px] bg-[#f8fbfc] p-4">
                {[42, 78, 66, 90, 56, 34].map((height, barIndex) => (
                  <div key={barIndex} className="flex h-full flex-col justify-end gap-2">
                    <SkeletonBlock className="w-full" style={{ height: `${height}%` }} />
                    <SkeletonBlock className="h-3 w-full" />
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-3">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-20" />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <SkeletonBlock className="h-8 w-full" />
                  <SkeletonBlock className="h-8 w-full" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-64 max-w-full" />
            <SkeletonBlock className="h-4 w-80 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SkeletonBlock className="h-10 w-24" />
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-5 w-16" />
                <SkeletonBlock className="h-6 w-14 rounded-full" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[0, 1, 2, 3].map((cardIndex) => (
                  <div
                    key={cardIndex}
                    className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <SkeletonBlock className="h-6 w-20" />
                      <SkeletonBlock className="h-6 w-12 rounded-full" />
                    </div>
                    <SkeletonBlock className="mt-4 h-7 w-32" />
                    <SkeletonBlock className="mt-2 h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function SalesManagementSkeleton({ mode }: { mode: SalesMode }) {
  if (mode === "daily") {
    return (
      <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
        <div className="border-b border-[var(--line)] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-7 w-32" />
            <SkeletonBlock className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-6 md:p-5">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-3 h-8 w-36" />
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <div className="overflow-hidden rounded-[8px] border border-[var(--line)]">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_120px_140px] gap-3 border-b border-[var(--line)] px-4 py-4 last:border-b-0"
              >
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-10 w-44" />
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-10 w-10" />
            <SkeletonBlock className="h-10 w-10" />
          </div>
        </div>
        <SkeletonBlock className="h-7 w-24 rounded-full" />
      </div>

      <div className="mt-5 grid gap-3 border-b border-[var(--line)] pb-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-3 h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 border-b border-[var(--line)] pb-5 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-3 h-7 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <SkeletonBlock key={index} className="mx-auto h-3 w-8" />
        ))}
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-7">
        {Array.from({ length: 35 }, (_, index) => (
          <div key={index} className="min-h-36 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-3">
            <SkeletonBlock className="h-5 w-8" />
            <div className="mt-5 space-y-2">
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-11/12" />
              <SkeletonBlock className="h-3 w-9/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsManagementSkeleton() {
  return (
    <section className="mt-4 space-y-4" aria-label="Loading stats">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <SkeletonBlock className="h-4 w-56" />
            <SkeletonBlock className="mt-3 h-10 w-72 max-w-full" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SkeletonBlock className="h-7 w-28 rounded-full" />
              <SkeletonBlock className="h-7 w-28 rounded-full" />
              <SkeletonBlock className="h-7 w-20 rounded-full" />
            </div>
          </div>
          <div className="rounded-[8px] bg-[#f8fbfc] p-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-3 h-6 w-full" />
            <SkeletonBlock className="mt-2 h-6 w-10/12" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <SkeletonBlock className="h-6 w-36" />
          </div>
          <div className="p-4">
            <div className="overflow-hidden rounded-[8px] border border-[var(--line)]">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_100px_120px_120px] gap-3 border-b border-[var(--line)] px-4 py-4 last:border-b-0"
                >
                  <SkeletonBlock className="h-5 w-28" />
                  <SkeletonBlock className="h-5 w-16" />
                  <SkeletonBlock className="h-5 w-full" />
                  <SkeletonBlock className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="mt-2 h-4 w-40" />
            </div>
            <SkeletonBlock className="h-9 w-16" />
          </div>
          <div className="mt-4 overflow-hidden rounded-[8px] border border-[var(--line)]">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="grid grid-cols-[120px_1fr] gap-3 border-b border-[var(--line)] px-3 py-3 last:border-b-0"
              >
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[8px] bg-[#f8fbfc] p-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-3 h-8 w-36" />
          </div>
        </div>
      </div>
    </section>
  );
}

const roomGroups = [
  { id: "r1", name: "제주도", tableNos: ["r1-1", "r1-2"] },
  { id: "r2", name: "독도", tableNos: ["r2-1", "r2-2"] },
  { id: "r3", name: "울릉도", tableNos: ["r3-1", "r3-2"] },
  { id: "r4", name: "서해", tableNos: ["r4-1", "r4-2"] },
  { id: "r5", name: "남해", tableNos: ["r5-1", "r5-2"] },
  { id: "r6", name: "동해", tableNos: ["r6-1", "r6-2"] },
] as const;

const roomNames = Object.fromEntries(roomGroups.map((room) => [room.id, room.name]));

const hallTables = [
  { no: "1", left: 6, top: 2 },
  { no: "2", left: 6, top: 16 },
  { no: "3", left: 22, top: 2 },
  { no: "4", left: 22, top: 16 },
  { no: "5", left: 38, top: 2 },
  { no: "6", left: 38, top: 16 },
  { no: "7", left: 74, top: 2 },
  { no: "8", left: 74, top: 16 },
  { no: "9", left: 74, top: 30 },
  { no: "10", left: 91, top: 2 },
  { no: "11", left: 91, top: 16 },
  { no: "12", left: 91, top: 30 },
  { no: "13", left: 91, top: 44 },
  { no: "14", left: 91, top: 58 },
  { no: "15", left: 91, top: 72 },
  { no: "16", left: 91, top: 86 },
];

function LiveFloorBoard({ snapshot }: { snapshot: SalesSnapshot }) {
  const tableMap = new Map(snapshot.realtime.tables.map((table) => [table.tableNo, table]));
  const activeRooms = buildActiveRoomTables(
    snapshot.realtime.tables,
    snapshot.realtime.splitRoomIds,
  );
  const activeHallTables = hallTables
    .map((table) => tableMap.get(table.no))
    .filter((table): table is TableRealtimeStatus => Boolean(table && table.amount > 0));
  const activeViewCount = activeRooms.length + activeHallTables.length;

  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-[var(--ink)] md:text-xl">
            청주봉명점 실시간 현황판
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            현재 열린 주문 기준으로 테이블별 미결제 금액을 표시합니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm font-black sm:flex">
          <span className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-2 text-slate-600">
            사용중 {activeViewCount}개
          </span>
          <span className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-2 text-[var(--sea)]">
            미결제 {formatMoney(snapshot.realtime.totalDue)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ActiveTableGroup title="룸" emptyText="이용중인 룸 없음">
          {activeRooms.map((table) => (
            <ActiveTableCard
              key={table.tableNo}
              name={table.displayName}
              amount={table.amount}
              orderCount={table.orderCount}
              elapsedMinutes={table.elapsedMinutes}
            />
          ))}
        </ActiveTableGroup>

        <ActiveTableGroup title="홀" emptyText="이용중인 홀 테이블 없음">
          {activeHallTables.map((table) => (
            <ActiveTableCard
              key={table.tableNo}
              name={`${table.tableNo}번`}
              amount={table.amount}
              orderCount={table.orderCount}
              elapsedMinutes={table.elapsedMinutes}
            />
          ))}
        </ActiveTableGroup>
      </div>
    </section>
  );
}

function buildActiveRoomTables(tables: TableRealtimeStatus[], splitRoomIds: string[]) {
  const tableMap = new Map(tables.map((table) => [table.tableNo, table]));
  const handled = new Set<string>();
  const splitRoomIdSet = new Set(splitRoomIds);
  const rooms = roomGroups.flatMap((room) => {
    const isSplit = splitRoomIdSet.has(room.id);
    const legacyBaseTable = tableMap.get(room.id);
    const sectionTables = room.tableNos.map((tableNo) => tableMap.get(tableNo));

    handled.add(room.id);
    room.tableNos.forEach((tableNo) => handled.add(tableNo));

    if (!isSplit) {
      const targets = [legacyBaseTable, ...sectionTables].filter(
        (table): table is TableRealtimeStatus => Boolean(table && table.amount > 0),
      );
      if (targets.length === 0) return [];
      return [
        {
          tableNo: room.id,
          displayName: room.name,
          amount: targets.reduce((sum, table) => sum + table.amount, 0),
          orderCount: targets.reduce((sum, table) => sum + table.orderCount, 0),
          elapsedMinutes: Math.max(...targets.map((table) => table.elapsedMinutes), 0),
        },
      ];
    }

    const firstSectionTargets = [legacyBaseTable, sectionTables[0]].filter(
      (table): table is TableRealtimeStatus => Boolean(table && table.amount > 0),
    );
    const secondSectionTargets = [sectionTables[1]].filter(
      (table): table is TableRealtimeStatus => Boolean(table && table.amount > 0),
    );

    return [
      buildRoomSectionStatus(room.tableNos[0], `${room.name} 1`, firstSectionTargets),
      buildRoomSectionStatus(room.tableNos[1], `${room.name} 2`, secondSectionTargets),
    ].filter((table): table is TableRealtimeStatus & { displayName: string } => Boolean(table));
  });

  const extraRooms = tables
    .filter((table) => table.tableNo.startsWith("r") && table.amount > 0 && !handled.has(table.tableNo))
    .map((table) => ({
      ...table,
      displayName: roomTableName(table.tableNo),
    }));

  return [...rooms, ...extraRooms].sort((a, b) =>
    a.tableNo.localeCompare(b.tableNo, "ko", { numeric: true }),
  );
}

function buildRoomSectionStatus(
  tableNo: string,
  displayName: string,
  targets: TableRealtimeStatus[],
) {
  if (targets.length === 0) return null;

  return {
    tableNo,
    displayName,
    amount: targets.reduce((sum, table) => sum + table.amount, 0),
    orderCount: targets.reduce((sum, table) => sum + table.orderCount, 0),
    elapsedMinutes: Math.max(...targets.map((table) => table.elapsedMinutes), 0),
  };
}

function roomTableName(tableNo: string) {
  const [roomId, section] = tableNo.split("-");
  const roomName = roomNames[roomId] ?? tableNo;
  return section ? `${roomName}${section}` : roomName;
}

function ActiveTableGroup({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const hasItems = childArray.some(Boolean);

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[var(--ink)]">{title}</h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-400">
          이용중
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {hasItems ? children : (
          <div className="rounded-[8px] border border-dashed border-[var(--line)] bg-white px-4 py-6 text-center text-sm font-bold text-slate-400 sm:col-span-2">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveTableCard({
  name,
  amount,
  orderCount,
  elapsedMinutes,
}: {
  name: string;
  amount: number;
  orderCount: number;
  elapsedMinutes: number;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <strong className="text-xl font-black text-[var(--ink)]">{name}</strong>
        <span className="rounded-full bg-[#e8f7ff] px-2.5 py-1 text-xs font-black text-[var(--sea)]">
          {elapsedMinutes}분
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-[var(--sea)]">
        {formatMoney(amount)}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-400">주문 {orderCount}건</p>
    </article>
  );
}

function EmptySection({ title }: { title: string }) {
  return (
    <section className="mt-4 rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
    </section>
  );
}

function PurchaseManagement() {
  const [receiptTarget, setReceiptTarget] = useState<PurchaseItem | null>(null);
  const [inputOpen, setInputOpen] = useState(false);

  return (
    <section className="mt-4 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setInputOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--sea)] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#126aa1]/18"
        >
          <Plus className="h-4 w-4" />
          매입 입력
        </button>
      </div>

      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(360px,560px)] lg:items-center lg:justify-between">
          <div className="grid gap-2">
            <input
              type="date"
              className="min-w-0 rounded-[8px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-bold text-slate-600"
              defaultValue="2026-06-24"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex min-w-0 items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                placeholder="거래처, 품목, 담당자 검색"
              />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--sea)] px-4 py-2.5 text-sm font-black text-white">
              <Search className="h-4 w-4" />
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-[#f8fbfc]">
              <tr className="text-center text-xs font-black text-slate-500">
                <th className="px-4 py-3">거래일</th>
                <th className="px-4 py-3 text-left">거래처</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3 text-right">총액</th>
                <th className="px-4 py-3">결제</th>
                <th className="px-4 py-3">담당자</th>
                <th className="px-4 py-3">영수증</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {purchaseItems.map((purchase) => (
                <tr key={purchase.id} className="text-sm font-bold">
                  <td className="px-4 py-4 text-center text-slate-500">
                    {purchase.purchasedOn}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-black text-[var(--ink)]">
                      {purchase.vendor}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-400">
                      {purchase.memo}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">
                    {purchase.category}
                  </td>
                  <td className="px-4 py-4 text-right font-black">
                    {formatMoney(purchase.amount)}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">
                    {purchase.paymentMethod}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">
                    {purchase.manager}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {purchase.receiptImageUrl ? (
                      <button
                        onClick={() => setReceiptTarget(purchase)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--sea)]"
                      >
                        <Eye className="h-4 w-4" />
                        확인
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inputOpen && <PurchaseInputModal onClose={() => setInputOpen(false)} />}
      {receiptTarget && (
        <ReceiptModal
          purchase={receiptTarget}
          onClose={() => setReceiptTarget(null)}
        />
      )}
    </section>
  );
}

function SalesManagement() {
  const [mode, setMode] = useState<SalesMode>("month");
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const { snapshot, isLoading } = useFishSalesSnapshot(selectedDate);

  return (
    <section className="mt-4 space-y-4">
      <div className="flex justify-end">
        <div className="inline-grid grid-cols-2 rounded-[8px] border border-[var(--line)] bg-white p-1 shadow-sm">
          <button
            onClick={() => setMode("month")}
            className={`rounded-[7px] px-4 py-2 text-sm font-black ${
              mode === "month" ? "bg-[var(--sea)] text-white" : "text-slate-500"
            }`}
          >
            월별
          </button>
          <button
            onClick={() => setMode("daily")}
            className={`rounded-[7px] px-4 py-2 text-sm font-black ${
              mode === "daily" ? "bg-[var(--sea)] text-white" : "text-slate-500"
            }`}
          >
            일별
          </button>
        </div>
      </div>

      {mode === "daily" ? (
        <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[220px_auto] sm:items-center">
            <input
              type="date"
              className="min-w-0 rounded-[8px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-bold text-slate-600"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--sea)] px-4 py-2.5 text-sm font-black text-white sm:w-fit">
              <Search className="h-4 w-4" />
              조회
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <SalesManagementSkeleton mode={mode} />
      ) : mode === "month" ? (
        <MonthlySalesView
          month={snapshot.month}
          days={snapshot.monthly.days}
          total={snapshot.monthly.total}
          cardTotal={snapshot.monthly.card}
          cashTotal={snapshot.monthly.cash}
        />
      ) : (
        <DailySalesView snapshot={snapshot} />
      )}
    </section>
  );
}

function ReviewInspection() {
  const { snapshot, isLoading, errorMessage } = useNaverReviews();

  if (isLoading) {
    return <ReviewInspectionSkeleton />;
  }

  if (!snapshot) {
    return (
      <section className="mt-4 rounded-[8px] border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[var(--ink)]">네이버리뷰[베타]</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">
          {errorMessage || "리뷰 데이터를 확인할 수 없습니다."}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 space-y-4">
      <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center md:p-5">
          <div className="flex min-w-0 gap-4">
            <div
              className="h-20 w-20 shrink-0 rounded-[8px] bg-[#f1f6f8] bg-cover bg-center"
              style={
                snapshot.place.imageUrl
                  ? { backgroundImage: `url(${snapshot.place.imageUrl})` }
                  : undefined
              }
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--sea)]">
                {snapshot.place.category || "네이버 플레이스"}
              </p>
              <h2 className="mt-1 truncate text-2xl font-black text-[var(--ink)]">
                {snapshot.place.name}
              </h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {snapshot.place.address}
              </p>
              {snapshot.message ? (
                <p className="mt-2 text-xs font-bold text-[#9a650a]">
                  {snapshot.message}
                </p>
              ) : null}
            </div>
          </div>
          <a
            href={snapshot.place.naverMapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--sea)] px-4 text-sm font-black !text-white"
          >
            네이버 원문
          </a>
        </div>

        <div className="grid border-t border-[var(--line)] sm:grid-cols-2">
          <ReviewCountCard label="방문자 리뷰" value={snapshot.counts.visitor} />
          <ReviewCountCard label="블로그 리뷰" value={snapshot.counts.blog} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReviewSection
          title="방문자 리뷰"
          count={snapshot.counts.visitor}
          emptyLink="https://m.place.naver.com/restaurant/2057892767/review/visitor"
          emptyText="네이버에서 방문자 리뷰 본문 수집을 제한했습니다."
          reviews={snapshot.visitorReviews}
        />
        <ReviewSection
          title="블로그 리뷰"
          count={snapshot.counts.blog}
          emptyLink="https://m.place.naver.com/restaurant/2057892767/review/ugc"
          emptyText="네이버에서 블로그 리뷰 본문 수집을 제한했습니다."
          reviews={snapshot.blogReviews}
        />
      </div>
    </section>
  );
}

function ReviewCountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b border-[var(--line)] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 md:p-5">
      <p className="text-sm font-black text-slate-400">{label}</p>
      <strong className="mt-1 block text-2xl font-black text-[var(--ink)]">
        {value.toLocaleString("ko-KR")}개
      </strong>
    </div>
  );
}

function ReviewSection({
  title,
  count,
  reviews,
  emptyText,
  emptyLink,
}: {
  title: string;
  count: number;
  reviews: NaverReviewItem[];
  emptyText: string;
  emptyLink: string;
}) {
  const visibleStep = 5;
  const [visibleCount, setVisibleCount] = useState(visibleStep);
  const visibleReviews = reviews.slice(0, visibleCount);
  const remainingCount = Math.max(0, reviews.length - visibleCount);

  return (
    <section className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[var(--ink)]">
          {title} {count.toLocaleString("ko-KR")}
        </h2>
        <a
          href={emptyLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-2 text-xs font-black text-[var(--sea)]"
        >
          원문 보기
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.length > 0 ? (
          <>
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {remainingCount > 0 ? (
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + visibleStep, reviews.length),
                  )
                }
                className="w-full rounded-[8px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-black text-[var(--sea)] transition hover:border-[var(--sea)] hover:bg-[#f3fbfc]"
              >
                더보기 ({remainingCount.toLocaleString("ko-KR")}개 남음)
              </button>
            ) : null}
          </>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--line)] bg-[#f8fbfc] p-5">
            <p className="text-sm font-bold text-slate-500">{emptyText}</p>
            <a
              href={emptyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-[8px] bg-[var(--sea)] px-3 py-2 text-xs font-black text-white"
            >
              네이버에서 확인
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: NaverReviewItem }) {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm font-black text-[var(--ink)]">
              {review.author}
            </strong>
            {review.date ? (
              <span className="text-xs font-bold text-slate-400">{review.date}</span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-4 text-sm font-bold leading-6 text-slate-700">
            {review.content}
          </p>
          {review.source === "blog" && review.link ? (
            <a
              href={review.link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex break-all text-xs font-black text-blue-600 underline underline-offset-2 hover:text-blue-700"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              {review.link}
            </a>
          ) : null}
        </div>
        {review.imageUrl ? (
          <div
            className="h-20 w-20 shrink-0 rounded-[8px] bg-slate-100 bg-cover bg-center"
            style={{ backgroundImage: `url(${review.imageUrl})` }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </article>
  );
}

function ReviewInspectionSkeleton() {
  return (
    <section className="mt-4 space-y-4" aria-label="Loading reviews">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
        <div className="flex gap-4">
          <SkeletonBlock className="h-20 w-20 shrink-0" />
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-3 h-8 w-56 max-w-full" />
            <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((sectionIndex) => (
          <div
            key={sectionIndex}
            className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <SkeletonBlock className="h-7 w-36" />
              <SkeletonBlock className="h-9 w-20" />
            </div>
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((cardIndex) => (
                <div key={cardIndex} className="rounded-[8px] bg-[#f8fbfc] p-4">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-10/12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StaffManagement() {
  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(360px,520px)_360px] lg:items-center lg:justify-between">
          <label className="flex min-w-0 items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
              placeholder="직원명, 연락처 검색"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select className="min-w-0 rounded-[8px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-bold text-slate-600">
              <option>전체 파트</option>
              <option>주방</option>
              <option>홀</option>
            </select>
            <select className="min-w-0 rounded-[8px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-bold text-slate-600">
              <option>전체 상태</option>
              <option>근무중</option>
              <option>휴무</option>
              <option>대기</option>
              <option>퇴근</option>
            </select>
          </div>
        </div>
      </div>

      <StaffTable />
    </section>
  );
}

function StatsManagement() {
  const [isEditingCosts, setIsEditingCosts] = useState(false);
  const [managementFee, setManagementFee] = useState(730000);
  const { snapshot, isLive, isLoading } = useFishSalesSnapshot();

  if (isLoading) {
    return <StatsManagementSkeleton />;
  }

  const totalSales = snapshot.monthly.total;
  const totalPurchase = purchaseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalSalary = staffMembers.reduce((sum, staff) => sum + staff.salary, 0);
  const rent = 2200000;
  const totalExpense = totalPurchase + totalSalary + rent + managementFee;
  const netProfit = totalSales - totalExpense;
  const profitRate =
    totalSales > 0 ? Math.round((netProfit / totalSales) * 1000) / 10 : 0;
  const rows = [
    { label: "이번달 총 매출", amount: totalSales, type: "plus" },
    { label: "매입", amount: totalPurchase, type: "minus" },
    { label: "직원 월급", amount: totalSalary, type: "minus" },
    { label: "월세", amount: rent, type: "minus" },
    { label: "관리비", amount: managementFee, type: "minus" },
  ];

  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-black text-slate-400">
              {snapshot.month.replace("-", "년 ")}월 손익 ·{" "}
              {isLive ? `${snapshot.branch} 실데이터` : "목업 데이터"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--ink)] md:text-4xl">
              순 수익 {formatMoney(netProfit)}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black">
              <span className="rounded-full bg-[#e8f7ff] px-3 py-1 text-[var(--sea)]">
                매출 {formatMoney(totalSales)}
              </span>
              <span className="rounded-full bg-[#fff3df] px-3 py-1 text-[#9a650a]">
                비용 {formatMoney(totalExpense)}
              </span>
              <span className="rounded-full bg-[#eef9df] px-3 py-1 text-[#2f6848]">
                수익률 {profitRate}%
              </span>
            </div>
          </div>
          <div className="rounded-[8px] bg-[#f8fbfc] p-4">
            <p className="text-sm font-black text-slate-400">계산식</p>
            <p className="mt-2 text-lg font-black leading-8 text-[var(--ink)]">
              총 매출 - 매입 - 직원 월급 - 월세 - 관리비
            </p>
            <p className="mt-2 text-sm font-bold text-slate-500">
              비용 항목을 제외한 이번달 예상 순 수익입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <h2 className="text-lg font-black">순 수익 계산표</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead className="bg-[#f8fbfc]">
                <tr className="text-center text-xs font-black text-slate-500">
                  <th className="px-4 py-3 text-left">항목</th>
                  <th className="px-4 py-3">구분</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-right">누적</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {rows.map((row, index) => {
                  const accumulated =
                    index === 0
                      ? row.amount
                      : totalSales -
                        rows
                          .slice(1, index + 1)
                          .reduce((sum, item) => sum + item.amount, 0);

                  return (
                    <tr key={row.label} className="text-sm font-bold">
                      <td className="px-4 py-4 font-black text-[var(--ink)]">
                        {row.label}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-black ${
                            row.type === "plus"
                              ? "bg-[#e8f7ff] text-[var(--sea)]"
                              : "bg-[#fff3df] text-[#9a650a]"
                          }`}
                        >
                          {row.type === "plus" ? "수입" : "비용"}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-4 text-right font-black ${
                          row.type === "plus"
                            ? "text-[var(--sea)]"
                            : "text-[#9a650a]"
                        }`}
                      >
                        {row.type === "plus" ? "+" : "-"} {formatMoney(row.amount)}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-700">
                        {formatMoney(accumulated)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[#f3fbfc] text-base font-black">
                  <td className="px-4 py-5 text-[var(--ink)]">순 수익</td>
                  <td className="px-4 py-5 text-center">
                    <span className="rounded-full bg-[var(--sea)] px-3 py-1 text-xs font-black text-white">
                      최종
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right text-slate-500">
                    매출 - 비용
                  </td>
                  <td className="px-4 py-5 text-right text-2xl font-black text-[var(--sea)]">
                    {formatMoney(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">고정/변동 비용</h2>
              <p className="mt-1 text-sm font-bold text-slate-400">
                관리비는 매월 직접 입력
              </p>
            </div>
            <button
              onClick={() => setIsEditingCosts((current) => !current)}
              className="rounded-[8px] bg-[var(--sea)] px-4 py-2 text-sm font-black text-white"
            >
              {isEditingCosts ? "저장" : "수정"}
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-[8px] border border-[var(--line)]">
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-[var(--line)] text-sm font-bold">
                <tr>
                  <th className="bg-[#f8fbfc] px-3 py-3 text-left text-slate-500">
                    월세
                  </th>
                  <td className="px-3 py-3 text-right font-black">
                    {formatMoney(rent)}
                  </td>
                </tr>
                <tr>
                  <th className="bg-[#f8fbfc] px-3 py-3 text-left text-slate-500">
                    관리비
                  </th>
                  <td className="px-3 py-3">
                    <input
                      disabled={!isEditingCosts}
                      inputMode="numeric"
                      value={managementFee}
                      onChange={(event) =>
                        setManagementFee(Number(event.target.value.replace(/\D/g, "")))
                      }
                      className="w-full rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-right font-black outline-none disabled:border-transparent disabled:bg-transparent disabled:px-0 focus:border-[var(--sea)]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-[8px] bg-[#f8fbfc] p-4">
            <p className="text-sm font-black text-slate-400">비용 합계</p>
            <strong className="mt-1 block text-2xl font-black text-[#9a650a]">
              {formatMoney(totalExpense)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function StaffTable() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-[#f8fbfc]">
            <tr className="text-center text-xs font-black text-slate-500">
              <th className="px-4 py-3 text-left">직원명</th>
              <th className="px-4 py-3">파트</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3 text-right">월급</th>
              <th className="px-4 py-3">출퇴근</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {staffMembers.map((staff) => {
              const roleStyle = staffRoleStyle(staff.role);

              return (
                <tr key={staff.name} className="text-sm font-bold">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-1.5 rounded-full ${roleStyle.line}`} />
                      <div>
                        <p className="text-base font-black text-[var(--ink)]">
                          {staff.name}
                        </p>
                        <p className="mt-0.5 text-xs font-black text-slate-400">
                          {staff.role} 담당
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex min-w-14 justify-center rounded-full px-2.5 py-1 text-xs font-black ${roleStyle.badge}`}
                    >
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-black ${staffStatusClass(staff.status)}`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">
                    {staff.phone}
                  </td>
                  <td className="px-4 py-4 text-right font-black text-[var(--sea)]">
                    {formatMoney(staff.salary)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="rounded-[8px] border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--sea)] transition hover:border-[var(--sea)] hover:bg-[#f3fbfc]">
                      관리
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function staffStatusClass(status: StaffStatus) {
  if (status === "근무중") return "bg-[#e6f4eb] text-[#2f6848]";
  if (status === "휴무") return "bg-[#fff3df] text-[#9a650a]";
  if (status === "대기") return "bg-[#e8f7ff] text-[var(--sea)]";
  return "bg-slate-100 text-slate-500";
}

function MonthlySalesView({
  month,
  days,
  total,
  cardTotal,
  cashTotal,
}: {
  month: string;
  days: MonthSalesDay[];
  total: number;
  cardTotal: number;
  cashTotal: number;
}) {
  const [selectedCell, setSelectedCell] = useState<SalesCalendarCell | null>(
    null
  );
  const { year, month: monthNumber } = parseMonth(month);
  const today = parseDateInput(getTodayInputValue());
  const calendarCells = buildSalesMonthCells(year, monthNumber, days);
  const monthCells = calendarCells.filter((cell) => cell.day != null);
  const hallTotal = days.reduce((sum, day) => sum + day.hall, 0);
  const takeoutTotal = days.reduce((sum, day) => sum + day.takeout, 0);
  const isTodayCell = (cell: SalesCalendarCell) =>
    cell.day === today.day && monthNumber === today.month && year === today.year;

  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[var(--ink)] md:text-4xl">
            {year}년 {monthNumber}월
          </h2>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#f1f6f8] text-xl font-black text-slate-400">
              ‹
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#f1f6f8] text-xl font-black text-slate-400">
              ›
            </button>
          </div>
        </div>
        <span className="rounded-full bg-[#e8f7ff] px-3 py-1 text-sm font-black text-[var(--sea)]">
          월별 매출
        </span>
      </div>

      <div className="mt-5 grid gap-3 border-b border-[var(--line)] pb-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label={`${monthNumber}월 총매출`} value={formatMoney(total)} />
        <SummaryStat label="카드" value={formatMoney(cardTotal)} />
        <SummaryStat label="현금" value={formatMoney(cashTotal)} />
        <SummaryStat
          label="일평균"
          value={formatMoney(Math.round(total / Math.max(days.length, 1)))}
        />
      </div>
      <div className="mt-5 grid gap-3 border-b border-[var(--line)] pb-5 sm:grid-cols-2">
        <SummaryStat label="홀 매출" value={formatMoney(hallTotal)} />
        <SummaryStat label="포장 매출" value={formatMoney(takeoutTotal)} />
      </div>

      <div className="mt-5 space-y-2 md:hidden">
        {monthCells.map((cell) => (
          <button
            key={cell.key}
            onClick={() => setSelectedCell(cell)}
            className={`flex w-full items-center justify-between rounded-[8px] border px-4 py-3 text-left ${
              isTodayCell(cell)
                ? "border-[#ffb8c7] bg-[#fff8f9]"
                : "border-[var(--line)] bg-[#f8fbfc]"
            }`}
          >
            <div className="flex items-center gap-2">
              <strong
                className={`text-xl font-black ${
                  cell.weekday === 0 || cell.weekday === 6
                    ? "text-[#e65f4f]"
                    : "text-slate-700"
                }`}
              >
                {cell.day}
              </strong>
              <span className="text-xs font-black text-slate-400">
                {weekdayLabel(cell.weekday)}
              </span>
              {isTodayCell(cell) ? (
                <span className="rounded-full bg-[#ffe2e8] px-2 py-0.5 text-xs font-black text-[#ff3f68]">
                  오늘
                </span>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400">총매출</p>
              <p className="text-sm font-black text-[var(--sea)]">
                {formatMoney(cell.data?.total ?? 0)}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-black">
                <span className="text-slate-400">홀</span>
                <span className="text-slate-700">
                  {formatMoney(cell.data?.hall ?? 0)}
                </span>
                <span className="text-slate-400">포장</span>
                <span className="text-[#d89a2b]">
                  {formatMoney(cell.data?.takeout ?? 0)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 hidden md:block">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              key={day}
              className={day === "일" || day === "토" ? "text-[#e65f4f]" : ""}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-7">
          {calendarCells.map((cell) => (
            cell.day == null ? (
              <div key={cell.key} />
            ) : (
              <button
                type="button"
                onClick={() => setSelectedCell(cell)}
                key={cell.key}
                className={`min-h-36 rounded-[8px] border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  isTodayCell(cell)
                    ? "border-[#ffb8c7] bg-[#fff8f9]"
                    : (cell.data?.total ?? 0) > 0
                      ? "border-[var(--line)] bg-[#f8fbfc]"
                      : "border-slate-100 bg-white/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-black ${
                      cell.weekday === 0 || cell.weekday === 6
                        ? "text-[#e65f4f]"
                        : "text-slate-600"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {isTodayCell(cell) ? (
                    <span className="rounded-full bg-[#ffe2e8] px-2 py-0.5 text-xs font-black text-[#ff3f68]">
                      오늘
                    </span>
                  ) : null}
                </div>
                <dl className="mt-4 space-y-1 text-xs font-black">
                  <AmountRow label="총매출" value={cell.data?.total ?? 0} tone="sea" />
                  <AmountRow label="카드" value={cell.data?.card ?? 0} tone="muted" />
                  <AmountRow label="현금" value={cell.data?.cash ?? 0} tone="mustard" />
                  <div className="my-2 border-t border-[var(--line)]" />
                  <AmountRow label="홀" value={cell.data?.hall ?? 0} tone="muted" />
                  <AmountRow label="포장" value={cell.data?.takeout ?? 0} tone="mustard" />
                </dl>
              </button>
            )
          ))}
        </div>
      </div>

      {selectedCell ? (
        <SalesDayDetailModal
          cell={selectedCell}
          year={year}
          monthNumber={monthNumber}
          onClose={() => setSelectedCell(null)}
        />
      ) : null}
    </div>
  );
}

function SalesDayDetailModal({
  cell,
  year,
  monthNumber,
  onClose,
}: {
  cell: SalesCalendarCell;
  year: number;
  monthNumber: number;
  onClose: () => void;
}) {
  const data = cell.data;
  const date = `${year}-${String(monthNumber).padStart(2, "0")}-${String(
    cell.day ?? 1,
  ).padStart(2, "0")}`;
  const { snapshot, isLive } = useFishSalesSnapshot(date);
  const lunchAmount = isLive ? snapshot.daily.lunchTotal : data?.lunch ?? 0;
  const dinnerAmount = isLive ? snapshot.daily.dinnerTotal : data?.dinner ?? 0;

  if (!cell.day || !data) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b3555]/35 p-3 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[8px] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">
              {monthNumber}월 {cell.day}일 매출 상세
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-400">
              {weekdayLabel(cell.weekday)}요일
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-[var(--line)] text-[var(--sea)]"
            aria-label="매출 상세 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailAmount label="총매출" value={data.total} tone="sea" />
            <DetailAmount label="카드" value={data.card} tone="muted" />
            <DetailAmount label="현금" value={data.cash} tone="mustard" />
            <DetailAmount label="홀 매출" value={data.hall} tone="muted" />
            <DetailAmount label="포장 매출" value={data.takeout} tone="mustard" />
          </div>
          <div className="border-t border-[var(--line)] pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailAmount label="점심 매출" value={lunchAmount} tone="green" />
              <DetailAmount label="저녁 매출" value={dinnerAmount} tone="sea" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailySalesView({ snapshot }: { snapshot: SalesSnapshot }) {
  return (
    <div className="space-y-4">
      <SalesSummaryGrid
        items={[
          ["일 매출", formatMoney(snapshot.daily.total)],
          ["결제 건수", `${snapshot.daily.paymentCount.toLocaleString()}건`],
          ["카드", formatMoney(snapshot.daily.card)],
          ["현금", formatMoney(snapshot.daily.cash)],
          ["홀 매출", formatMoney(snapshot.daily.hallTotal)],
          ["포장 매출", formatMoney(snapshot.daily.takeoutTotal)],
        ]}
      />

      <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead className="bg-[#f8fbfc]">
              <tr className="text-center text-xs font-black text-slate-500">
                <th className="px-4 py-3">결제일시</th>
                <th className="px-4 py-3">결제</th>
                <th className="px-4 py-3 text-right">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {snapshot.daily.items.map((sale) => (
                <tr key={sale.id} className="text-sm font-bold">
                  <td className="px-4 py-4 text-center text-slate-500">
                    {sale.paidAt}
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-4 py-4 text-right font-black">
                    {formatMoney(sale.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SalesSummaryGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {items.map(([label, value]) => (
        <article
          key={label}
          className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-black text-slate-400">{label}</p>
          <strong className="mt-2 block text-2xl font-black text-[var(--ink)]">
            {value}
          </strong>
        </article>
      ))}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[var(--line)] sm:border-r sm:pr-4 last:border-r-0">
      <p className="text-sm font-black text-slate-400">{label}</p>
      <strong className="mt-1 block text-2xl font-black text-[var(--ink)]">
        {value}
      </strong>
    </div>
  );
}

function DetailAmount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sea" | "green" | "mustard" | "muted";
}) {
  const toneClass = {
    sea: "text-[var(--sea)]",
    green: "text-[#3e7c59]",
    mustard: "text-[#d89a2b]",
    muted: "text-slate-600",
  }[tone];

  return (
    <div className="rounded-[8px] bg-[#f8fbfc] p-4">
      <p className="text-sm font-black text-slate-400">{label}</p>
      <strong className={`mt-1 block text-2xl font-black ${toneClass}`}>
        {formatMoney(value)}
      </strong>
    </div>
  );
}

function AmountRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sea" | "green" | "mustard" | "muted";
}) {
  const toneClass = {
    sea: "text-[var(--sea)]",
    green: "text-[#3e7c59]",
    mustard: "text-[#d89a2b]",
    muted: "text-slate-400",
  }[tone];

  return (
    <div className={`flex justify-between gap-2 ${toneClass}`}>
      <dt>{label}</dt>
      <dd>{value.toLocaleString("ko-KR")}</dd>
    </div>
  );
}

function PurchaseInputModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#0b3555]/35 p-3 backdrop-blur-sm md:place-items-center">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-[8px] bg-white p-4 shadow-2xl md:max-w-2xl md:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">매입 입력</h2>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-[var(--line)] text-[var(--sea)]"
            aria-label="매입 입력 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="거래일" type="date" defaultValue="2026-06-24" />
          <Field label="거래처" placeholder="거래처명" />
          <Field label="카테고리" placeholder="원재료" />
          <Field label="총액" placeholder="0" inputMode="numeric" />
          <Field label="결제수단" placeholder="카드 / 현금 / 계좌이체" />
          <Field label="담당자" placeholder="담당자명" />
          <label className="md:col-span-2">
            <span className="text-sm font-black text-slate-600">메모</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm font-bold outline-none focus:border-[var(--sea)]"
              placeholder="품목, 수량, 특이사항"
            />
          </label>
          <button className="md:col-span-2 flex min-h-24 items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#9cc8d0] bg-[#f3fbfc] text-sm font-black text-[var(--sea)]">
            <Upload className="h-5 w-5" />
            영수증 이미지 첨부
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-[8px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-black text-slate-600"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="rounded-[8px] bg-[var(--sea)] px-4 py-3 text-sm font-black text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span className="text-sm font-black text-slate-600">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-[8px] border border-[var(--line)] px-3 py-2 text-sm font-bold outline-none focus:border-[var(--sea)]"
      />
    </label>
  );
}

function ReceiptModal({
  purchase,
  onClose,
}: {
  purchase: PurchaseItem;
  onClose: () => void;
}) {
  if (!purchase.receiptImageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b3555]/35 p-3 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[8px] bg-white p-4 shadow-2xl md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">영수증 확인</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {purchase.vendor} · {purchase.receiptNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-[var(--line)] text-[var(--sea)]"
            aria-label="영수증 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 rounded-[8px] bg-slate-100 p-3">
          {purchase.receiptImageUrl ? (
            <div
              className="min-h-[420px] rounded-[8px] bg-white bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${purchase.receiptImageUrl})` }}
              role="img"
              aria-label={`${purchase.vendor} 영수증`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function TodayOffCard() {
  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black">
            <CalendarDays className="h-5 w-5 text-[var(--sea)]" />
            오늘 휴무
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-black text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <i className={`h-1.5 w-7 rounded-full ${staffRoleStyle("주방").line}`} />
              주방
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className={`h-1.5 w-7 rounded-full ${staffRoleStyle("홀").line}`} />
              홀
            </span>
          </div>
        </div>
        <span className="rounded-full bg-[#e8f7ff] px-3 py-1 text-sm font-black text-[#126aa1]">
          {dayOffStaff.length}명
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {dayOffStaff.map((staff) => {
          const roleStyle = staffRoleStyle(staff.role);

          return (
            <div
              key={staff.name}
              className={`flex items-center justify-between rounded-[8px] px-3 py-3 ${roleStyle.row}`}
            >
              <strong className="text-base font-black">{staff.name}</strong>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${roleStyle.badge}`}>
                {staff.role}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SalesChart({
  title,
  total,
  data,
  tone,
}: {
  title: string;
  total: string;
  data: SalesChartPoint[];
  tone: "lunch" | "dinner";
}) {
  const [activePoint, setActivePoint] = useState<SalesChartPoint | null>(null);
  const barClass =
    tone === "lunch"
      ? "from-[var(--sea)] to-[var(--sea-sky)]"
      : "from-[#3e7c59] to-[#8bd4a6]";
  const selectedPoint =
    activePoint && (activePoint.rawAmount ?? 0) > 0
      ? activePoint
      : data.findLast((item) => (item.rawAmount ?? 0) > 0);

  return (
    <article className="rounded-[8px] border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{title}</h2>
        <strong className="text-lg font-black text-[var(--sea)]">{total}</strong>
      </div>
      <div
        className="mt-5 grid h-[230px] items-end gap-2 rounded-[8px] bg-[#f8fbfc] p-3 md:gap-3 md:p-4"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
      >
        {data.map((item) => {
          const hasSales = (item.rawAmount ?? 0) > 0;

          return (
          <div
            key={item.time}
            onMouseEnter={() => hasSales && setActivePoint(item)}
            onClick={() => hasSales && setActivePoint(item)}
            className="flex h-full min-w-0 flex-col justify-end gap-2"
          >
            {hasSales ? (
              <div
                className={`min-h-4 rounded-t-[8px] bg-gradient-to-t transition hover:brightness-95 ${barClass}`}
                style={{ height: `${item.amount}%` }}
              />
            ) : (
              <div className="h-0" />
            )}
            <span className="text-center text-[10px] font-black leading-tight text-slate-400 md:text-xs">
              {item.time}
            </span>
          </div>
          );
        })}
      </div>
      {selectedPoint ? (
        <div className="mt-3 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] p-3">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-sm font-black text-[var(--ink)]">
              {selectedPoint.time}
            </strong>
            <span className="text-sm font-black text-[var(--sea)]">
              {formatMoney(selectedPoint.rawAmount ?? 0)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-black">
            <div className="rounded-[8px] bg-white px-3 py-2 text-slate-500">
              카드
              <span className="ml-2 text-[var(--ink)]">
                {formatMoney(selectedPoint.card ?? 0)}
              </span>
            </div>
            <div className="rounded-[8px] bg-white px-3 py-2 text-slate-500">
              현금
              <span className="ml-2 text-[var(--ink)]">
                {formatMoney(selectedPoint.cash ?? 0)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/admin/dashboard"
      className={`block rounded-[8px] border border-[#9fd3e6] bg-[#f3fbfc] px-4 py-3 shadow-sm transition hover:border-[var(--sea)] ${
        compact ? "w-44" : "w-full"
      }`}
    >
      <div className="relative mx-auto h-16 w-full max-w-[190px] overflow-hidden">
        <Image
          src="/fish-brothers-logo.png"
          alt="어시장브라더스"
          fill
          sizes="190px"
          className="object-contain scale-[1.45]"
          priority
        />
      </div>
    </Link>
  );
}

function NavButton({
  item,
  active,
}: {
  item: (typeof menuItems)[number];
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`flex h-12 w-full items-center justify-between rounded-[8px] px-3 text-left text-base font-black transition ${
        active
          ? "bg-[var(--sea)] text-white shadow-lg shadow-[#126aa1]/16"
          : "text-slate-500 hover:bg-white hover:text-[var(--sea)]"
      }`}
    >
      <span className={`flex items-center gap-3 ${active ? "text-white" : ""}`}>
        <item.icon className={`h-5 w-5 ${active ? "text-white" : ""}`} />
        {item.label}
      </span>
      <ChevronRight className={`h-4 w-4 ${active ? "text-white" : ""}`} />
    </Link>
  );
}

function NaverIcon({ className }: { className?: string }) {
  return (
    <span
      className={`grid h-5 w-5 place-items-center rounded-[4px] bg-[#03c75a] text-xs font-black leading-none text-white ${className ?? ""}`}
      aria-hidden="true"
    >
      N
    </span>
  );
}
