
"use client";

import React, { useMemo, useState } from "react";
import { Search, RotateCcw, Sword, Shield, Star, ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import db from "../data/matchups.json";

const MAIN_POOL = ["오른", "모데카이저", "요릭", "말파이트", "문도 박사", "피오라", "잭스"];

const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function getInitials(text = "") {
  return text.split("").map((ch) => {
    const code = ch.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return ch.toLowerCase();
    return CHO_LIST[Math.floor(code / 588)];
  }).join("");
}

function normalize(text = "") {
  return text.toLowerCase().replace(/\s/g, "");
}

function matches(champ, query) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(champ).includes(q) || getInitials(champ).includes(q);
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const allChampions = db.champions || [];
const matchupMap = new Map((db.matchups || []).map((m) => [`${m.myChampion}__${m.enemyChampion}`, m]));

function getMatchup(my, enemy) {
  return matchupMap.get(`${my}__${enemy}`);
}

function matchupScore(m) {
  if (!m) return 50;
  const label = m.matchup || "";
  let score = 50;
  if (label.includes("유리")) score += 22;
  if (label.includes("초반 유리")) score += 4;
  if (label.includes("반반")) score += 0;
  if (label.includes("초반 불리")) score -= 10;
  if (label.includes("불리")) score -= 22;
  if (label.includes("카운터")) score -= 10;
  if (label.includes("미러")) score -= 6;

  const timing = m.myStrongTiming || "";
  if (timing.includes("6렙")) score += 3;
  if (timing.includes("1코어")) score += 2;
  if (timing.includes("한타")) score += 2;

  return Math.max(0, Math.min(100, score));
}

function labelTone(label = "") {
  if (label.includes("유리")) return "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  if (label.includes("불리")) return "border-red-500/40 bg-red-500/15 text-red-100";
  if (label.includes("반반")) return "border-slate-500/40 bg-slate-500/15 text-slate-100";
  return "border-indigo-500/40 bg-indigo-500/15 text-indigo-100";
}

function shortTiming(text = "") {
  if (!text) return "정보 없음";
  return text
    .replaceAll("이후", "후")
    .split(".")[0]
    .slice(0, 70);
}

function recommendMainPool(enemy) {
  if (!enemy) return [];
  return MAIN_POOL
    .map((champ) => {
      const m = getMatchup(champ, enemy);
      return {
        champ,
        matchup: m?.matchup || "정보 없음",
        timing: m?.myStrongTiming || "",
        score: matchupScore(m),
        oneLine: m?.oneLine || "",
        data: m
      };
    })
    .sort((a, b) => b.score - a.score);
}

function recommendAllCounters(enemy) {
  if (!enemy) return [];
  return allChampions
    .filter((champ) => champ !== enemy)
    .map((champ) => {
      const m = getMatchup(champ, enemy);
      return {
        champ,
        matchup: m?.matchup || "정보 없음",
        timing: m?.myStrongTiming || "",
        score: matchupScore(m),
        data: m
      };
    })
    .filter((x) => x.data && (x.matchup.includes("유리") || x.score >= 70))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function opggUrl(champ) {
  return `https://www.op.gg/champions/${encodeURIComponent(champ)}/counters/top?hl=ko_KR`;
}

function ChampionPicker({ title, value, onChange, accent = "indigo" }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => allChampions.filter((c) => matches(c, query)), [query]);

  const tone = accent === "red" ? "border-red-500/40 bg-red-950/30" : "border-indigo-500/40 bg-indigo-950/30";

  return (
    <section className={cx("rounded-2xl border p-3", tone)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-black text-white">{title}</h2>
        {value && <button onClick={() => onChange("")} className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-200">해제</button>}
      </div>
      <div className="mb-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색: ㄷㄹㅇㅅ, ㄱㄹ, 세트"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {value ? (
        <button onClick={() => setQuery(value)} className="mb-2 w-full rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-2 text-left text-sm font-bold text-white">
          선택됨: {value}
        </button>
      ) : (
        <p className="mb-2 text-[11px] text-slate-400">초성/이름으로 검색 후 선택</p>
      )}

      <div className="grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
        {filtered.map((champ) => (
          <button
            key={champ}
            onClick={() => {
              onChange(champ);
              setQuery("");
            }}
            className={cx(
              "rounded-xl border px-1.5 py-2 text-[11px] font-bold leading-tight active:scale-95",
              value === champ ? "border-indigo-300 bg-indigo-500 text-white" : "border-slate-700 bg-slate-900 text-slate-200"
            )}
          >
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm">{champ[0]}</div>
            <div className="truncate">{champ}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function RecCard({ item, onPick, selected }) {
  return (
    <button
      onClick={() => onPick(item.champ)}
      className={cx(
        "w-full rounded-2xl border p-3 text-left active:scale-[0.99]",
        selected ? "border-indigo-300 bg-indigo-500/20" : "border-slate-800 bg-slate-900"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-black text-white">{item.champ}</div>
          <div className={cx("mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold", labelTone(item.matchup))}>{item.matchup}</div>
        </div>
        <div className="rounded-full bg-slate-800 px-2 py-1 text-xs font-black text-indigo-200">{item.score}점</div>
      </div>
      <div className="mt-2 text-xs leading-relaxed text-slate-300">
        유리 구간: {shortTiming(item.timing)}
      </div>
    </button>
  );
}

function Section({ title, items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items || (Array.isArray(items) && items.length === 0)) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left">
        <span className="text-sm font-black text-white">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-800 p-3">
          {Array.isArray(items) ? (
            items.map((x, i) => <p key={i} className="rounded-xl bg-slate-900 p-3 text-sm leading-relaxed text-slate-200">{x}</p>)
          ) : (
            Object.entries(items).map(([k, v]) => (
              <p key={k} className="rounded-xl bg-slate-900 p-3 text-sm leading-relaxed text-slate-200">
                <span className="font-bold text-indigo-200">{k}: </span>{String(v)}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MatchupDetail({ data }) {
  if (!data) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
        내 챔피언과 상대 챔피언을 둘 다 선택하면 상세 상대법이 표시됨.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-white">{data.myChampion} vs {data.enemyChampion}</h2>
          <span className={cx("rounded-full border px-2 py-1 text-xs font-bold", labelTone(data.matchup))}>{data.matchup}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{data.coreSummary}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3">
          <div className="mb-1 text-xs font-bold text-emerald-200">내가 강한 타이밍</div>
          <p className="text-sm leading-relaxed text-slate-100">{data.myStrongTiming}</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-3">
          <div className="mb-1 text-xs font-bold text-red-200">상대 강한 타이밍</div>
          <p className="text-sm leading-relaxed text-slate-100">{data.enemyStrongTiming}</p>
        </div>
      </div>

      <Section title="내 챔프 핵심" items={data.myChampionCore} defaultOpen />
      <Section title="상대 핵심 위협/스킬" items={data.enemyCore} defaultOpen />
      <Section title="1~3렙 운영" items={data.levels1to3} defaultOpen />
      <Section title="4~5렙 운영" items={data.levels4to5} />
      <Section title="6렙 이후 / 킬각" items={data.level6AndAfter} defaultOpen />
      <Section title="스킬 대응" items={data.skillInteraction} defaultOpen />
      <Section title="웨이브 관리" items={data.waveManagement} />
      <Section title="아이템 우선순위" items={data.itemPriority} />
      <Section title="정글 개입" items={data.jungleInteraction} />
      <Section title="사이드 운영" items={data.sideLane} />
      <Section title="한타 운영" items={data.teamfight} />
      <Section title="내가 유리할 때" items={data.whenAhead} />
      <Section title="내가 불리할 때" items={data.whenBehind} defaultOpen />
      <Section title="핵심 실수" items={data.commonMistakes} defaultOpen />

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <div className="text-xs font-bold text-slate-400">한줄 요약</div>
        <p className="mt-1 text-sm leading-relaxed text-white">{data.oneLine}</p>
      </div>
    </section>
  );
}

export default function App() {
  const [myChamp, setMyChamp] = useState("");
  const [enemyChamp, setEnemyChamp] = useState("");

  const mainRecs = useMemo(() => recommendMainPool(enemyChamp), [enemyChamp]);
  const counterRecs = useMemo(() => recommendAllCounters(enemyChamp), [enemyChamp]);
  const detail = useMemo(() => (myChamp && enemyChamp ? getMatchup(myChamp, enemyChamp) : null), [myChamp, enemyChamp]);

  return (
    <main className="min-h-screen bg-slate-950 p-2 text-slate-100 sm:p-4">
      <div className="mx-auto max-w-5xl space-y-3">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white sm:text-2xl">탑 매치업 백과사전</h1>
              <p className="text-xs text-slate-400 sm:text-sm">상대 선픽이면 추천픽 확인 → 추천픽 클릭 → 상세 상대법 확인</p>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-20 -mx-2 border-y border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2">
              <div className="text-[11px] text-slate-400">내 챔피언</div>
              <div className="truncate text-sm font-black text-white">{myChamp || "미선택"}</div>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2">
              <div className="text-[11px] text-slate-400">상대 탑</div>
              <div className="truncate text-sm font-black text-white">{enemyChamp || "미선택"}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ChampionPicker title="상대 탑 선택" value={enemyChamp} onChange={setEnemyChamp} accent="red" />
          <ChampionPicker title="내 챔피언 선택" value={myChamp} onChange={setMyChamp} accent="indigo" />
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setMyChamp(""); setEnemyChamp(""); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">
            <RotateCcw className="h-4 w-4" /> 초기화
          </button>
          {enemyChamp && (
            <a href={opggUrl(enemyChamp)} target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">
              OP.GG 보기 <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {enemyChamp && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <h2 className="text-base font-black text-white">내 주요픽 7개 추천</h2>
            </div>
            <p className="text-xs text-slate-400">카드를 누르면 바로 내 챔피언으로 선택됨.</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mainRecs.map((r) => (
                <RecCard key={r.champ} item={r} onPick={setMyChamp} selected={myChamp === r.champ} />
              ))}
            </div>
          </section>
        )}

        {enemyChamp && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-red-300" />
              <h2 className="text-base font-black text-white">전체 챔피언 기준 카운터 후보</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {counterRecs.map((r) => (
                <RecCard key={r.champ} item={r} onPick={setMyChamp} selected={myChamp === r.champ} />
              ))}
            </div>
          </section>
        )}

        <MatchupDetail data={detail} />
      </div>
    </main>
  );
}
