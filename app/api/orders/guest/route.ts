import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signToken } from "@lib/auth";
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  defaultAvatarUrl,
  findServiceById,
  findPackageById,
  createOrder,
} from "@lib/firestore";

const guestOrderSchema = z.object({
  identifier: z.string().min(1),
  identifierType: z.enum(["email", "phone"]),
  guestName: z.string().min(1).max(100),
  serviceId: z.string().min(1),
  packageId: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = guestOrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });
  }

  const { identifier, identifierType, guestName, serviceId, packageId, notes, paymentMethod } = result.data;

  try {
    const svc = await findServiceById(serviceId);
    if (!svc) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const pkg = await findPackageById(packageId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    if (pkg.serviceId !== serviceId) {
      return NextResponse.json({ error: "Package does not belong to the specified service" }, { status: 400 });
    }

    let user = identifierType === "phone"
      ? await findUserByPhone(identifier)
      : await findUserByEmail(identifier);

    let isNewAccount = false;

    if (!user) {
      isNewAccount = true;

      const email =
        identifierType === "email"
          ? identifier
          : `phone_${identifier.replace(/\D/g, "")}@codecraftbd.info`;
      const phone = identifierType === "phone" ? identifier : null;

      user = await createUser({
        name: guestName,
        email,
        passwordHash: null,
        phone,
        avatarUrl: defaultAvatarUrl(guestName),
        googleId: null,
        role: "user",
      });
    }

    const order = await createOrder({
      userId: user.id,
      serviceId,
      packageId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: identifierType === "phone" ? identifier : (user.phone ?? ""),
      serviceName: svc.title,
      packageName: pkg.name,
      price: pkg.price,
      notes: notes || "",
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: paymentMethod || null,
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const res = NextResponse.json({
      order,
      isNewAccount,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        phone: user.phone ?? null,
      },
    }, { status: 201 });

    res.cookies.set("rc_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Guest order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
