import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">

      <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-red-900/10" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

          {/* LEFT */}

          <div>

            <span className="inline-flex items-center rounded-full border border-red-600 px-4 py-1 text-red-500 text-sm mb-6">
              🔥 Gaming • Office • Enterprise
            </span>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">

              <span className="text-white">
                BUILD YOUR
              </span>

              <br />

              <span className="text-red-500">
                DREAM PC
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:mt-8 sm:text-lg sm:leading-8">

              NEXTCORE จำหน่ายคอมพิวเตอร์ อุปกรณ์ Gaming
              และประกอบคอมตามงบประมาณ
              พร้อมรับประกันและบริการหลังการขาย

            </p>

<div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-5">

  <Link
    href="/products"
    className="inline-flex h-14 items-center justify-center rounded-xl bg-red-600 px-8 text-white font-bold shadow-lg shadow-red-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-red-500 hover:shadow-red-500/50"
  >
    🛒 Shop Now
  </Link>

  <Link
    href="/buildpc"
    className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-red-600 bg-transparent px-8 text-white font-bold shadow-lg shadow-red-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-red-600 hover:text-white hover:shadow-red-600/50"
  >
    🖥️ Build PC
  </Link>

</div>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:mt-12 sm:gap-8 lg:gap-14">

              <div>

                <h3 className="text-2xl font-black text-red-500 sm:text-4xl lg:text-5xl">
                  5K+
                </h3>

                <p className="mt-2 text-sm text-zinc-400 sm:text-base lg:text-lg">
                  Happy Customers
                </p>

              </div>

              <div>

                <h3 className="text-2xl font-black text-red-500 sm:text-4xl lg:text-5xl">
                  1200+
                </h3>

                <p className="mt-2 text-sm text-zinc-400 sm:text-base lg:text-lg">
                  PC Builds
                </p>

              </div>

              <div>

                <h3 className="text-2xl font-black text-red-500 sm:text-4xl lg:text-5xl">
                  100%
                </h3>

                <p className="mt-2 text-sm text-zinc-400 sm:text-base lg:text-lg">
                  Warranty
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative mx-auto w-full max-w-2xl">

            <div className="absolute -inset-6 rounded-full bg-red-600/20 blur-3xl" />

            <Image
              src="/images/hero-pc.png"
              alt="Gaming PC"
              width={900}
              height={700}
              priority
              className=" rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_80px_rgba(239,68,68,.45)]"
            />

          </div>

        </div>

      </div>

    </section>
  );
}