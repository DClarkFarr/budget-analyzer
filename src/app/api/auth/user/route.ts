import { loginUser, registerUser } from "@/server/prisma/user.methods";
import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUser,
  initializeSession,
} from "@/server/actions/sessionActions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const user = await registerUser(name, email, password);

    await initializeSession(user);

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 402 });
    } else {
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await loginUser(email, password);

    await initializeSession(user);

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 402 });
    } else {
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser();

    if (!user) {
      return NextResponse.json({ message: "No session" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 402 });
    } else {
      return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
  }
}
