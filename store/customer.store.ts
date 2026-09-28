import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  paymentMethod: string;

  setCustomer: (data: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    postalCode: string;
    paymentMethod: string;
  }) => void;

  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      postalCode: "",
      paymentMethod: "PromptPay",

      setCustomer: (data) =>
        set({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          postalCode: data.postalCode,
          paymentMethod: data.paymentMethod,
        }),

      clearCustomer: () =>
        set({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          postalCode: "",
          paymentMethod: "PromptPay",
        }),
    }),
    {
      name: "nextcore-customer",
    }
  )
);