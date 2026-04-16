import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@lib/auth";
import { countOrders, countUsers, sumOrderRevenue, recentOrders } from "@lib/firestore";
import { getLocalOrders, getLocalUsers } from "@lib/local-data";

export async function GET(req: NextRequest) {
  const { user, error, status } = await requireAdmin(req);
  if (!user) return NextResponse.json({ error }, { status });

  try {
    const [totalOrders, totalUsers, totalRevenue, recent] = await Promise.all([
      countOrders(),
      countUsers(),
      sumOrderRevenue(),
      recentOrders(10),
    ]);

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2),
      recentOrders: recent,
    });
  } catch {
    // Firebase unavailable — calculate stats from local db-export.json
    try {
      const orders = getLocalOrders();
      const users = getLocalUsers();
      const revenue = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + parseFloat(o.price || "0"), 0);
      return NextResponse.json({
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue: revenue.toFixed(2),
        recentOrders: orders.slice(0, 10),
      });
    } catch {
      // Return zeros if everything fails
      return NextResponse.json({ totalOrders: 0, totalUsers: 0, totalRevenue: "0.00", recentOrders: [] });
    }
  }
}

