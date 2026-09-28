type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
};

export default function Button({
  children,
  variant = "primary",
}: Props) {
  const base =
    "px-6 py-3 rounded-xl font-semibold transition duration-300";

  const style =
    variant === "primary"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "border border-red-600 text-white hover:bg-red-600";

  return (
    <button className={`${base} ${style}`}>
      {children}
    </button>
  );
}