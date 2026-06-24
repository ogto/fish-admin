"use client";

import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const adminPassword = "1234";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== adminPassword) {
      setError("패스워드를 확인해주세요.");
      return;
    }

    window.localStorage.setItem("fish-admin-auth", "true");
    document.cookie = "fish-admin-auth=true; path=/; max-age=2592000; SameSite=Lax";
    router.replace("/admin/dashboard");
  }

  return (
    <main className="grid min-h-dvh place-items-center overflow-x-hidden bg-[var(--background)] text-[var(--ink)]">
      <section className="mx-auto w-[calc(100%-32px)] max-w-sm rounded-[8px] border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/fish-brothers-logo.png"
            alt="어시장브라더스"
            width={320}
            height={200}
            className="h-auto w-64 max-w-full"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm font-black text-slate-600">패스워드</span>
            <div className="mt-2 flex items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[#f8fbfc] px-3 py-3 focus-within:border-[var(--sea)]">
              <LockKeyhole className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="min-w-0 flex-1 border-0 bg-transparent text-base font-bold outline-none"
                placeholder="관리자 패스워드"
                autoFocus
              />
            </div>
          </label>

          {error ? (
            <p className="rounded-[8px] bg-[#fff3df] px-3 py-2 text-sm font-bold text-[#9a650a]">
              {error}
            </p>
          ) : null}

          <button className="w-full rounded-[8px] bg-[var(--sea)] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#126aa1]/18">
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
