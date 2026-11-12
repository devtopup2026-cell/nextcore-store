export const paymentAccounts = {
  PromptPay: {
    label: "SCB bank transfer",
    bank: "Siam Commercial Bank (SCB)",
    number: "842-267038-2",
    holder: "บริษัท วิชญธงชัย จำกัด",
    image: "/payment/scb-pc.webp",
  },
  "Bank Transfer": {
    label: "KBANK bank transfer",
    bank: "Kasikornbank (KBANK)",
    number: "226-1-36172-0",
    holder: "บจก. วิชญธงชัย",
    image: "/payment/kbank-pc.webp",
  },
} as const;
