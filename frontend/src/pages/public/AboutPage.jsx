import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="mt-14">
          <div className="flex items-center gap-3 text-blue-500">
            <ShieldCheck size={30} />
            <span className="font-semibold">SICSI III</span>
          </div>

          <h1 className="mt-6 text-4xl font-black sm:text-5xl">
            Segurança começa com consciência.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            O SICSI III é uma plataforma de conscientização em cibersegurança
            criada para ajudar estudantes a compreender ameaças digitais e
            desenvolver comportamentos mais seguros.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-bold">Aprender</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Cursos e conteúdos orientados para conhecimentos práticos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-bold">Praticar</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Simulações interativas para transformar conhecimento em
                decisões seguras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
