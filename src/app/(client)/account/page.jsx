import Link from "next/link";
import { products } from "@/lib/shop-data";

function Account() {
  const orders = products.slice(0, 4).map((p, i) => ({
    id: `ORD-${1e4 + i}`,
    p,
    date: `Jun 0${i + 1}, 2026`,
    status: ["Delivered", "Shipped", "Processing", "Cancelled"][i],
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { v: "24", l: "Total Orders", c: "from-emerald-500 to-emerald-700" },
          { v: "৳48,200", l: "Total Spent", c: "from-amber-500 to-orange-600" },
          { v: "12", l: "Wishlisted", c: "from-rose-500 to-pink-600" },
          { v: "1,240", l: "Reward Points", c: "from-sky-500 to-blue-600" },
        ].map((s) => (
          <div
            key={s.l}
            className={`rounded-xl bg-gradient-to-br ${s.c} p-4 text-white shadow`}
          >
            <div className="font-display text-2xl font-bold">{s.v}</div>
            <div className="text-xs opacity-90">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4"
            >
              <img
                src={o.p.image}
                className="h-14 w-14 rounded-md object-cover flex-shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-1">{o.p.title}</div>
                <div className="text-xs text-muted-foreground">
                  {o.id} · {o.date} · Sold by {o.p.vendor.name}
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-700">
                ৳{o.p.price.toLocaleString()}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  o.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : o.status === "Shipped"
                    ? "bg-sky-100 text-sky-700"
                    : o.status === "Processing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {o.status}
              </span>
              <button className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50">
                Track
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Info & Address */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold mb-3">Profile Information</h3>
          <div className="space-y-3 text-sm">
            <Row l="Full Name" v="Sarah Khan" />
            <Row l="Email" v="sarah.khan@example.com" />
            <Row l="Phone" v="+880 1700-123456" />
            <Row l="Date of Birth" v="14 May 1995" />
            <Row l="Gender" v="Female" />
          </div>
          <button className="mt-4 w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Edit Profile
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold mb-3">Default Address</h3>
          <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 p-4 text-sm">
            <div className="font-semibold">🏠 Home</div>
            <div className="mt-1 text-muted-foreground">
              House #42, Road #3, Block C
              <br />
              Mirpur, Dhaka 1207
              <br />
              Bangladesh
            </div>
            <div className="mt-2 text-xs text-muted-foreground">+880 1700-123456</div>
          </div>
          <button className="mt-4 w-full rounded-md border border-border py-2 text-sm font-semibold hover:bg-emerald-50">
            Manage Addresses
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

export default Account;