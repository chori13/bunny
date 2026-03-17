"use client";

import Link from "next/link";
import { Rabbit, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-t from-violet-950/5 to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold gradient-text">
              <Rabbit className="h-5 w-5 text-violet-400" />
              Bunny Shop
            </Link>
            <p className="mt-3 text-sm text-white/30 leading-relaxed">
              건강하고 행복한 반려토끼를 위한
              <br />
              프리미엄 용품 전문 쇼핑몰
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-xs text-white/25">
                <Mail className="h-3.5 w-3.5" />
                bunnyshop@example.com
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-white/25">
                <Phone className="h-3.5 w-3.5" />
                02-1234-5678
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-white/25">
                <MapPin className="h-3.5 w-3.5" />
                서울특별시 강남구
              </div>
            </div>
          </div>

          {/* 고객서비스 */}
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-4">고객서비스</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/qna" className="text-sm text-white/30 transition hover:text-violet-400">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  배송 안내
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  교환/반품
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  1:1 문의
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-4">정보</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  사업자 정보
                </Link>
              </li>
            </ul>
          </div>

          {/* 커뮤니티 */}
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-4">커뮤니티</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/community" className="text-sm text-white/30 transition hover:text-violet-400">
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-white/30 transition hover:text-violet-400">
                  이벤트
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/30 transition hover:text-violet-400">
                  건강 가이드
                </Link>
              </li>
              <li>
                <Link href="/adoption" className="text-sm text-white/30 transition hover:text-violet-400">
                  입양 정보
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-10 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-white/20">
            &copy; 2026 Bunny Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
