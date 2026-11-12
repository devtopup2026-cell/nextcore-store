import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { getCustomerSession } from "@/lib/customer-session";
import { deferredSlipOrder } from "@/lib/payment-slip";
import { prisma } from "@/lib/prisma";

const maxBytes = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Sign in to attach a slip." }, { status: 401 });
    }

    const { id } = await params;
    const order = { id, customerId: customer.id, ...deferredSlipOrder };
    const eligible = await prisma.order.findFirst({ where: order, select: { id: true } });

    if (!eligible) {
      return NextResponse.json({ error: "This order cannot accept a slip." }, { status: 409 });
    }

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");

    if (!(file instanceof File) || !file.size || file.size > maxBytes) {
      return NextResponse.json({ error: "Choose an image up to 5 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "nextcore/slips",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error ?? new Error("Missing upload result"));
        },
      ).end(bytes);
    });

    const updated = await prisma.order.updateMany({
      where: order,
      data: { paymentSlip: upload.secure_url },
    });

    if (!updated.count) {
      await cloudinary.uploader.destroy(upload.public_id).catch(() => {});
      return NextResponse.json({ error: "This order cannot accept a slip." }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not attach the slip. Please try again." }, { status: 500 });
  }
}
