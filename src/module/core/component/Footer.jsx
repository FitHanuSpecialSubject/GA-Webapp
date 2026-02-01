import React from "react";

const ADMIN_EMAIL = "ngoctb@hanu.vn";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white/90">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" className="h-9 w-9" alt="MOEAs Platform" />
              <span className="text-base sm:text-lg font-semibold text-white leading-tight">
                MOEAs Platform
              </span>
            </div>
            <div className="text-sm text-white/75 sm:text-right leading-tight">
              <p className="text-white/90 font-semibold">Contact</p>
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="block text-white hover:text-white/90"
              >
                {ADMIN_EMAIL}
              </a>
              <p>Hanoi University, Km9 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam</p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="text-center text-xs sm:text-sm text-white/70 leading-tight">
            &copy; {new Date().getFullYear()} MOEAs Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
