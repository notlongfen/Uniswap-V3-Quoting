import { NextRequest, NextResponse } from "next/server";
import { quote } from "../libs/quote";

export async function POST(request: NextRequest) {
  try {
    const { amountIn, env } = await request.json();
    const amountInNumber = Number(amountIn);

    if (isNaN(amountInNumber)) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const amountOut = await quote(amountInNumber, env);

    // Chuyển đổi BigInt thành chuỗi trước khi trả về
    return NextResponse.json({ amountOut: amountOut.toString() }, { status: 200 });

  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
