export const deferredSlipOrder = {
  status: "Pending Payment",
  paymentMethod: { in: ["PromptPay", "Bank Transfer"] },
  OR: [{ paymentSlip: null }, { paymentSlip: "" }],
};

export function canAttachPaymentSlip(order: {
  status: string;
  paymentMethod: string;
  paymentSlip: string | null;
}) {
  return order.status === deferredSlipOrder.status &&
    deferredSlipOrder.paymentMethod.in.includes(order.paymentMethod) &&
    !order.paymentSlip;
}
