import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black border-b border-red-600">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

        <h1 className="text-3xl font-bold text-red-500">
          NEXTCORE
        </h1>

        <nav className="hidden md:flex items-center space-x-8 text-white">
          <Link href="/">Home</Link>
          <Link href="/pc-set">PC Set</Link>
          <Link href="/build-pc">Build PC</Link>
          <Link href="/monitor">Monitor</Link>
          <Link href="/enterprise">Enterprise</Link>
          <Link href="/login">Login</Link>
        </nav>

      </div>
    </header>
  );
}