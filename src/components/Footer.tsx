import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-2 border-[#074482]/30 rounded-t-3xl shadow-2xl px-6 sm:px-10 pt-10 pb-2 sm:pt-12 sm:pb-3">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-12">
              <div className="flex items-start gap-4">
                <img
                  src="/romain-face.jpeg"
                  alt="Romain Bour"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#074482]/20 shadow-md"
                />
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-[#191919]" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Romain Bour
                  </p>
                  <p className="text-sm sm:text-base text-[#374151] mt-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                    J&apos;aide les indépendants à transformer leurs 3 likes en 10 clients
                  </p>
                  <div className="mt-4">
                    <Link
                      href="https://www.linkedin.com/in/romainbour/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#074482] font-medium hover:underline"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      Me contacter sur LinkedIn
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0 md:text-right" style={{ fontFamily: 'var(--font-poppins)' }}>
                <Link
                  href="/conditions-utilisation"
                  className="text-sm sm:text-base text-[#4B5563] hover:text-[#074482] hover:underline"
                >
                  Conditions d&apos;utilisation
                </Link>
              </div>
            </div>

            <div className="text-center" style={{ fontFamily: 'var(--font-poppins)' }}>
              <Link
                href="https://studiogeben.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-[#074482] font-semibold hover:underline"
              >
                <span>Outil développé par Studio Geben</span>
                <img
                  src="/studio-geben-loo.png"
                  alt="Logo Studio Geben"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

