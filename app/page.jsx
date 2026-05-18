
"use client";

import React, { useMemo, useState } from "react";
import {
  Search, RotateCcw, Star, ChevronDown, ChevronUp, BookOpen, ExternalLink,
  Save, Plus, Trash2, Edit3, CheckSquare, Settings, Download, Upload, Copy
} from "lucide-react";
import db from "../data/matchups.json";

const DEFAULT_MAIN_POOL = ["오른", "요릭", "말파이트", "문도 박사", "피오라", "잭스", "요네"];
const STORAGE_KEY = "lol_top_matchup_user_data_v3";
const OLD_KEYS = ["lol_top_matchup_user_data_v2", "lol_top_matchup_user_data_v1"];
const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

const allChampions = db.champions || [];
const matchupMap = new Map((db.matchups || []).map((m) => [`${m.myChampion}__${m.enemyChampion}`, m]));

function cx(...classes) { return classes.filter(Boolean).join(" "); }
function matchupKey(my, enemy) { return `${my}__${enemy}`; }
function getMatchup(my, enemy) { return matchupMap.get(matchupKey(my, enemy)); }
function clampScore(n) { const num = Number(n) || 0; return Math.max(-50, Math.min(50, num)); }
function safeParse(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }

function defaultUserData() {
  return {
    matchupNotes: {},
    matchupEdits: {},
    scoreAdjustments: {},
    checklists: {},
    overrides: {},
    manualRecommendations: {},
    settings: {
      mainPool: DEFAULT_MAIN_POOL,
      customChampions: []
    }
  };
}

function mergeUserData(raw) {
  const base = defaultUserData();
  const merged = { ...base, ...(raw || {}) };
  merged.settings = { ...base.settings, ...(raw?.settings || {}) };
  if (!Array.isArray(merged.settings.mainPool)) merged.settings.mainPool = DEFAULT_MAIN_POOL;
  if (!Array.isArray(merged.settings.customChampions)) merged.settings.customChampions = [];
  if (!merged.manualRecommendations || typeof merged.manualRecommendations !== "object") merged.manualRecommendations = {};
  if (!merged.overrides || typeof merged.overrides !== "object") merged.overrides = {};
  return merged;
}

function useLocalUserData() {
  const [data, setData] = React.useState(defaultUserData);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const k of OLD_KEYS) {
        raw = window.localStorage.getItem(k);
        if (raw) break;
      }
    }
    setData(mergeUserData(safeParse(raw, defaultUserData())));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (fn) => setData((prev) => mergeUserData(typeof fn === "function" ? fn(prev) : fn));
  return [data, update];
}

function getInitials(text = "") {
  return text.split("").map((ch) => {
    const code = ch.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return ch.toLowerCase();
    return CHO_LIST[Math.floor(code / 588)];
  }).join("");
}

function normalize(text = "") { return text.toLowerCase().replace(/\s/g, ""); }
function matches(champ, query) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(champ).includes(q) || getInitials(champ).includes(q);
}

function getAllChampions(userData) {
  const custom = userData?.settings?.customChampions || [];
  return Array.from(new Set([...allChampions, ...custom])).sort((a, b) => a.localeCompare(b, "ko"));
}

function matchupScore(m) {
  if (!m) return 50;
  if (typeof m.recommendScoreBase === "number") return m.recommendScoreBase;
  const tier = m.matchupTier || m.matchup || "";
  const table = {
    "극카운터": 94, "카운터": 84, "유리": 72, "초반 유리": 64,
    "반반": 55, "미러전": 50, "초반 불리": 45, "불리": 38,
    "카운터 당함": 28, "극카운터 당함": 16
  };
  return table[tier] ?? 50;
}

function labelTone(label = "") {
  if (label.includes("극카운터 당함")) return "border-red-500/60 bg-red-600/25 text-red-100";
  if (label.includes("카운터 당함")) return "border-red-500/50 bg-red-500/20 text-red-100";
  if (label.includes("극카운터")) return "border-purple-400/60 bg-purple-500/25 text-purple-100";
  if (label.includes("카운터")) return "border-emerald-400/60 bg-emerald-500/25 text-emerald-100";
  if (label.includes("유리")) return "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  if (label.includes("불리")) return "border-red-500/40 bg-red-500/15 text-red-100";
  if (label.includes("반반")) return "border-slate-500/40 bg-slate-500/15 text-slate-100";
  return "border-indigo-500/40 bg-indigo-500/15 text-indigo-100";
}

function shortTiming(text = "") {
  if (!text) return "정보 없음";
  return String(text).replaceAll("이후", "후").split(".")[0].slice(0, 78);
}

function opggUrl(champ) {
  return `https://www.op.gg/champions/${encodeURIComponent(champ)}/counters/top?hl=ko_KR`;
}

function downloadUserData(userData) {
  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lol-top-matchup-my-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function copyUserData(userData) {
  const text = JSON.stringify(userData);
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    alert("내 데이터가 복사됐어. 다른 기기에서 '붙여넣은 데이터 가져오기'에 붙여넣으면 됨.");
  } else {
    alert("이 브라우저는 클립보드 복사가 제한돼. 내보내기 파일을 사용해줘.");
  }
}

function importUserDataText(text, setUserData) {
  try {
    const parsed = JSON.parse(text);
    setUserData((prev) => mergeUserData({
      ...prev,
      ...parsed,
      settings: { ...(prev.settings || {}), ...(parsed.settings || {}) }
    }));
    alert("가져오기 완료");
  } catch {
    alert("가져오기 실패: JSON 형식이 아님");
  }
}

function getOverride(userData, key, field) {
  return userData?.overrides?.[key]?.[field] || "";
}

function setOverrideInData(prev, key, field, value) {
  const next = { ...prev, overrides: { ...(prev.overrides || {}) } };
  const current = { ...(next.overrides[key] || {}) };
  if (!value || !value.trim()) delete current[field];
  else current[field] = value;
  if (Object.keys(current).length === 0) delete next.overrides[key];
  else next.overrides[key] = current;
  return next;
}

function originalToText(value) {
  if (Array.isArray(value)) return value.join("\n");
  if (value && typeof value === "object") return Object.entries(value).map(([k, v]) => `${k}: ${String(v)}`).join("\n");
  return String(value || "");
}

function displayLines(value, overrideText) {
  const txt = overrideText || originalToText(value);
  return String(txt).split("\n").filter((x) => x.trim().length > 0);
}

function recommendAllCounters(enemy, userData) {
  if (!enemy) return [];
  return getAllChampions(userData)
    .filter((champ) => champ !== enemy)
    .map((champ) => {
      const m = getMatchup(champ, enemy);
      const adj = clampScore(userData?.scoreAdjustments?.[matchupKey(champ, enemy)] || 0);
      return {
        champ,
        matchup: m?.matchupTier || m?.matchup || "정보 없음",
        timing: getOverride(userData, matchupKey(champ, enemy), "myStrongTiming") || m?.myStrongTiming || "",
        score: Math.max(0, Math.min(100, matchupScore(m) + adj)),
        baseScore: matchupScore(m),
        adjustment: adj,
        data: m,
        isMainPool: (userData?.settings?.mainPool || DEFAULT_MAIN_POOL).includes(champ),
        isManual: (userData?.manualRecommendations?.[enemy] || []).includes(champ)
      };
    })
    .filter((x) => x.data && !x.matchup.includes("당함") && (x.matchup.includes("카운터") || x.matchup.includes("유리") || x.score >= 70 || x.adjustment > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function recommendMainPool(enemy, userData) {
  if (!enemy) return [];
  const mainPool = userData?.settings?.mainPool || DEFAULT_MAIN_POOL;
  const pickSet = new Set(mainPool);

  (userData?.manualRecommendations?.[enemy] || []).forEach((champ) => pickSet.add(champ));
  recommendAllCounters(enemy, userData).slice(0, 12).forEach((x) => pickSet.add(x.champ));

  Object.entries(userData?.scoreAdjustments || {}).forEach(([key, val]) => {
    const [champ, e] = key.split("__");
    if (e === enemy && Number(val) > 0) pickSet.add(champ);
  });

  return Array.from(pickSet)
    .filter((champ) => champ !== enemy)
    .map((champ) => {
      const m = getMatchup(champ, enemy);
      const adj = clampScore(userData?.scoreAdjustments?.[matchupKey(champ, enemy)] || 0);
      const isManual = (userData?.manualRecommendations?.[enemy] || []).includes(champ);
      return {
        champ,
        matchup: m?.matchupTier || m?.matchup || (isManual ? "직접추가" : "정보 없음"),
        timing: getOverride(userData, matchupKey(champ, enemy), "myStrongTiming") || m?.myStrongTiming || "",
        score: Math.max(0, Math.min(100, matchupScore(m) + adj + (isManual && !m ? 15 : 0))),
        baseScore: matchupScore(m),
        adjustment: adj,
        oneLine: getOverride(userData, matchupKey(champ, enemy), "oneLine") || m?.oneLine || "",
        data: m,
        isMainPool: mainPool.includes(champ),
        isManual
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 16);
}

function ChampionPicker({ title, value, onChange, accent = "indigo", champions = allChampions }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => champions.filter((c) => matches(c, query)), [query, champions]);
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
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색: ㄷㄹㅇㅅ, ㄱㄹ, 세트" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
      </div>
      {value ? (
        <button onClick={() => setQuery(value)} className="mb-2 w-full rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-2 text-left text-sm font-bold text-white">선택됨: {value}</button>
      ) : (
        <p className="mb-2 text-[11px] text-slate-400">초성/이름으로 검색 후 선택</p>
      )}
      <div className="grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
        {filtered.map((champ) => (
          <button key={champ} onClick={() => { onChange(champ); setQuery(""); }} className={cx("rounded-xl border px-1.5 py-2 text-[11px] font-bold leading-tight active:scale-95", value === champ ? "border-indigo-300 bg-indigo-500 text-white" : "border-slate-700 bg-slate-900 text-slate-200")}>
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm">{champ[0]}</div>
            <div className="truncate">{champ}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MainPoolSettings({ userData, setUserData }) {
  const [query, setQuery] = useState("");
  const [newChamp, setNewChamp] = useState("");
  const [importText, setImportText] = useState("");
  const mainPool = userData.settings?.mainPool || DEFAULT_MAIN_POOL;
  const customChampions = userData.settings?.customChampions || [];
  const champions = getAllChampions(userData);
  const filtered = champions.filter((c) => matches(c, query));

  const toggle = (champ) => {
    setUserData((prev) => {
      const pool = prev.settings?.mainPool || DEFAULT_MAIN_POOL;
      const nextPool = pool.includes(champ) ? pool.filter((x) => x !== champ) : [...pool, champ];
      return { ...prev, settings: { ...(prev.settings || {}), mainPool: nextPool } };
    });
  };

  const addCustomChampion = () => {
    const champ = newChamp.trim();
    if (!champ) return;
    setUserData((prev) => {
      const oldCustom = prev.settings?.customChampions || [];
      const oldPool = prev.settings?.mainPool || DEFAULT_MAIN_POOL;
      return {
        ...prev,
        settings: {
          ...(prev.settings || {}),
          customChampions: Array.from(new Set([...oldCustom, champ])),
          mainPool: Array.from(new Set([...oldPool, champ]))
        }
      };
    });
    setNewChamp("");
  };

  const removeCustomChampion = (champ) => {
    setUserData((prev) => {
      const oldCustom = prev.settings?.customChampions || [];
      const oldPool = prev.settings?.mainPool || DEFAULT_MAIN_POOL;
      return {
        ...prev,
        settings: {
          ...(prev.settings || {}),
          customChampions: oldCustom.filter((x) => x !== champ),
          mainPool: oldPool.filter((x) => x !== champ)
        }
      };
    });
  };

  const reset = () => setUserData((prev) => ({ ...prev, settings: { ...(prev.settings || {}), mainPool: DEFAULT_MAIN_POOL, customChampions: prev.settings?.customChampions || [] } }));

  return (
    <section className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-indigo-200" />
          <h2 className="text-sm font-black text-white">주요픽 설정 / 데이터 공유</h2>
        </div>
        <button onClick={reset} className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200">주요픽 기본값</button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <div className="mb-2 text-sm font-black text-white">새 챔피언 추가</div>
        <p className="mb-2 text-xs text-slate-400">신규 챔프가 생기면 이름을 추가할 수 있음. 기본 데이터는 없지만 주요픽/추천 리스트/노트로 관리 가능.</p>
        <div className="flex gap-2">
          <input value={newChamp} onChange={(e) => setNewChamp(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCustomChampion(); }} placeholder="예: 신규챔프명" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
          <button onClick={addCustomChampion} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">추가</button>
        </div>
        {customChampions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {customChampions.map((c) => (
              <button key={c} onClick={() => removeCustomChampion(c)} className="rounded-full bg-yellow-500/20 px-2 py-1 text-[11px] font-bold text-yellow-100">{c} 삭제</button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <div className="mb-2 text-sm font-black text-white">내 데이터 공유/백업</div>
        <p className="mb-2 text-xs text-slate-400">파일/복사로 폰·컴퓨터 간 옮길 수 있음. 자동 동기화는 아님.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadUserData(userData)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100"><Download className="h-4 w-4" /> 내보내기 파일</button>
          <button onClick={() => copyUserData(userData)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100"><Copy className="h-4 w-4" /> 복사</button>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100">
            <Upload className="h-4 w-4" /> 파일 가져오기
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => importUserDataText(String(reader.result || ""), setUserData);
              reader.readAsText(file);
              e.target.value = "";
            }} />
          </label>
        </div>
        <div className="mt-2">
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="다른 기기에서 복사한 데이터를 붙여넣기" className="min-h-20 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white outline-none placeholder:text-slate-500" />
          <button onClick={() => { importUserDataText(importText, setUserData); setImportText(""); }} className="mt-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">붙여넣은 데이터 가져오기</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <p className="mb-2 text-xs text-slate-400">체크된 챔프가 추천픽 통합 리스트에 기본 표시됨. 현재 {mainPool.length}개.</p>
        <div className="mb-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="주요픽 추가/삭제 검색" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          {mainPool.map((c) => (
            <button key={c} onClick={() => toggle(c)} className="rounded-full bg-indigo-500/20 px-2 py-1 text-[11px] font-bold text-indigo-100">{c} ×</button>
          ))}
        </div>
        <div className="grid max-h-44 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
          {filtered.map((champ) => {
            const checked = mainPool.includes(champ);
            return (
              <button key={champ} onClick={() => toggle(champ)} className={cx("rounded-xl border px-1.5 py-2 text-[11px] font-bold leading-tight", checked ? "border-indigo-300 bg-indigo-600 text-white" : "border-slate-700 bg-slate-900 text-slate-200")}>
                <div className="truncate">{checked ? "✓ " : ""}{champ}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ManualRecommendationEditor({ enemyChamp, userData, setUserData }) {
  const [query, setQuery] = useState("");
  if (!enemyChamp) return null;

  const manualList = userData?.manualRecommendations?.[enemyChamp] || [];
  const champions = getAllChampions(userData).filter((c) => c !== enemyChamp);
  const filtered = champions.filter((c) => matches(c, query)).slice(0, 40);

  const addManual = (champ) => {
    setUserData((prev) => {
      const old = prev.manualRecommendations?.[enemyChamp] || [];
      return {
        ...prev,
        manualRecommendations: {
          ...(prev.manualRecommendations || {}),
          [enemyChamp]: Array.from(new Set([...old, champ]))
        }
      };
    });
    setQuery("");
  };

  const removeManual = (champ) => {
    setUserData((prev) => {
      const old = prev.manualRecommendations?.[enemyChamp] || [];
      const next = old.filter((x) => x !== champ);
      const all = { ...(prev.manualRecommendations || {}) };
      if (next.length === 0) delete all[enemyChamp];
      else all[enemyChamp] = next;
      return { ...prev, manualRecommendations: all };
    });
  };

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/10 p-3">
      <div className="mb-2 text-sm font-black text-yellow-100">추천픽 직접 추가</div>
      <p className="mb-2 text-xs text-slate-400">현재 상대({enemyChamp}) 추천 리스트에 강제로 올릴 챔피언을 추가.</p>
      {manualList.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {manualList.map((champ) => (
            <button key={champ} onClick={() => removeManual(champ)} className="rounded-full bg-yellow-500/20 px-2 py-1 text-[11px] font-bold text-yellow-100">{champ} 삭제</button>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예: ㅅㅇㄹㅅ, 사일러스" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
      </div>
      {query && (
        <div className="mt-2 grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-6">
          {filtered.map((champ) => (
            <button key={champ} onClick={() => addManual(champ)} className="rounded-xl border border-slate-700 bg-slate-900 px-1.5 py-2 text-[11px] font-bold text-slate-200">{champ}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecCard({ item, onPick, selected, onAdjust }) {
  return (
    <div className={cx("w-full rounded-2xl border p-3 text-left", selected ? "border-indigo-300 bg-indigo-500/20" : "border-slate-800 bg-slate-900")}>
      <button onClick={() => onPick(item.champ)} className="w-full text-left active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-white">{item.champ}</span>
              {item.isMainPool && <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-200">주픽</span>}
              {item.isManual && <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-100">직접추가</span>}
            </div>
            <div className={cx("mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold", labelTone(item.matchup))}>{item.matchup}</div>
          </div>
          <div className="text-right">
            <div className="rounded-full bg-slate-800 px-2 py-1 text-xs font-black text-indigo-200">{item.score}점</div>
            {item.adjustment !== 0 && <div className="mt-1 text-[10px] font-bold text-yellow-200">개인 {item.adjustment > 0 ? "+" : ""}{item.adjustment}</div>}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(item.data?.recommendTags || []).map((t) => <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">{t}</span>)}
        </div>
        <div className="mt-2 text-xs leading-relaxed text-slate-300">유리 구간: {shortTiming(item.timing)}</div>
      </button>
      <div className="mt-2 flex items-center gap-1.5 border-t border-slate-800 pt-2">
        <button onClick={() => onAdjust(item.champ, -5)} className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-slate-200">-5</button>
        <button onClick={() => onAdjust(item.champ, 5)} className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-slate-200">+5</button>
        <button onClick={() => onAdjust(item.champ, 10)} className="rounded-lg bg-emerald-900/70 px-2 py-1 text-xs font-bold text-emerald-100">+10</button>
        <button onClick={() => onAdjust(item.champ, "reset")} className="ml-auto rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300">초기화</button>
      </div>
    </div>
  );
}

/* Existing editable match-up section components */
function EditableTextBlock({ label, value, onSave, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  React.useEffect(() => setDraft(value || ""), [value]);
  if (!editing) {
    return (
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-950/10 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm font-black text-yellow-100">{label}</div>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-slate-200"><Edit3 className="h-3.5 w-3.5" /> 수정</button>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{value || "아직 작성한 내용 없음"}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-yellow-500/40 bg-yellow-950/20 p-3">
      <div className="mb-2 text-sm font-black text-yellow-100">{label}</div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500" />
      <div className="mt-2 flex gap-2">
        <button onClick={() => { onSave(draft); setEditing(false); }} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Save className="h-4 w-4" /> 저장</button>
        <button onClick={() => { setDraft(value || ""); setEditing(false); }} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">취소</button>
        <button onClick={() => { onSave(""); setEditing(false); }} className="ml-auto rounded-xl bg-red-900/70 px-3 py-2 text-xs font-bold text-red-100">삭제</button>
      </div>
    </div>
  );
}

function EditableSection({ title, original, overrideText, onSave, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(overrideText || originalToText(original));
  React.useEffect(() => setDraft(overrideText || originalToText(original)), [overrideText, original]);
  const hasOverride = !!overrideText;
  return (
    <div className={cx("rounded-2xl border bg-slate-950", hasOverride ? "border-yellow-500/40" : "border-slate-800")}>
      <div className="flex w-full items-center justify-between gap-2 px-3 py-3">
        <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="text-sm font-black text-white">{title}</span>
          {hasOverride && <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-100">수정됨</span>}
        </button>
        <button onClick={() => setEditing(!editing)} className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200">수정</button>
        <button onClick={() => setOpen(!open)}>{open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}</button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-slate-800 p-3">
          {editing ? (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-36 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm leading-relaxed text-white outline-none" />
              <div className="flex gap-2">
                <button onClick={() => { onSave(draft); setEditing(false); }} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">저장</button>
                <button onClick={() => { setDraft(overrideText || originalToText(original)); setEditing(false); }} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">취소</button>
                <button onClick={() => { onSave(""); setEditing(false); }} className="ml-auto rounded-xl bg-red-900/70 px-3 py-2 text-xs font-bold text-red-100">원본으로</button>
              </div>
            </>
          ) : (
            displayLines(original, overrideText).map((x, i) => <p key={i} className="rounded-xl bg-slate-900 p-3 text-sm leading-relaxed text-slate-200">{x}</p>)
          )}
        </div>
      )}
    </div>
  );
}

function ChecklistEditor({ items = [], onChange }) {
  const [text, setText] = useState("");
  const addItem = () => {
    const v = text.trim();
    if (!v) return;
    onChange([...items, { id: Date.now().toString(), text: v, done: false }]);
    setText("");
  };
  const updateItem = (id, patch) => onChange(items.map((it) => it.id === id ? { ...it, ...patch } : it));
  const removeItem = (id) => onChange(items.filter((it) => it.id !== id));
  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-3">
      <div className="mb-2 flex items-center gap-2"><CheckSquare className="h-4 w-4 text-emerald-200" /><div className="text-sm font-black text-emerald-100">개인 체크리스트</div></div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-slate-400">아직 체크리스트가 없음. 게임 전 확인할 내용을 추가해봐.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 rounded-xl bg-slate-900 p-2">
            <input type="checkbox" checked={!!it.done} onChange={(e) => updateItem(it.id, { done: e.target.checked })} className="h-4 w-4" />
            <input value={it.text} onChange={(e) => updateItem(it.id, { text: e.target.value })} className={cx("min-w-0 flex-1 bg-transparent text-sm outline-none", it.done ? "text-slate-500 line-through" : "text-slate-100")} />
            <button onClick={() => removeItem(it.id)} className="rounded-lg bg-slate-800 p-1.5 text-red-200"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addItem(); }} placeholder="예: 세트 E 빠진 뒤 들어가기" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
        <button onClick={addItem} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" /> 추가</button>
      </div>
    </div>
  );
}

function PersonalPanel({ data, userData, setUserData }) {
  if (!data) return null;
  const key = matchupKey(data.myChampion, data.enemyChampion);
  const note = userData.matchupNotes?.[key] || "";
  const edit = userData.matchupEdits?.[key] || "";
  const checklist = userData.checklists?.[key] || [];
  const saveNote = (value) => setUserData((prev) => ({ ...prev, matchupNotes: { ...prev.matchupNotes, [key]: value } }));
  const saveEdit = (value) => setUserData((prev) => ({ ...prev, matchupEdits: { ...prev.matchupEdits, [key]: value } }));
  const saveChecklist = (value) => setUserData((prev) => ({ ...prev, checklists: { ...prev.checklists, [key]: value } }));
  return (
    <section className="space-y-3">
      <EditableTextBlock label="내가 수정한 상대법" value={edit} onSave={saveEdit} placeholder="기본 설명이랑 다르게 내가 느낀 상대법을 적어두기" />
      <EditableTextBlock label="추가 노트" value={note} onSave={saveNote} placeholder="예: 이 매치업은 라인 당기고 6렙 이후 정글 부르기" />
      <ChecklistEditor items={checklist} onChange={saveChecklist} />
    </section>
  );
}

function MatchupDetail({ data, userData, setUserData }) {
  if (!data) return <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">내 챔피언과 상대 챔피언을 둘 다 선택하면 상세 상대법이 표시됨.</section>;
  const key = matchupKey(data.myChampion, data.enemyChampion);
  const ov = (field) => getOverride(userData, key, field);
  const saveOv = (field, value) => setUserData((prev) => setOverrideInData(prev, key, field, value));
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-white">{data.myChampion} vs {data.enemyChampion}</h2>
          <span className={cx("rounded-full border px-2 py-1 text-xs font-bold", labelTone(data.matchupTier || data.matchup))}>{data.matchupTier || data.matchup}</span>
        </div>
        <EditableSection title="핵심 요약" original={data.coreSummary} overrideText={ov("coreSummary")} onSave={(v) => saveOv("coreSummary", v)} defaultOpen />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <EditableSection title="내가 강한 타이밍" original={data.myStrongTiming} overrideText={ov("myStrongTiming")} onSave={(v) => saveOv("myStrongTiming", v)} defaultOpen />
        <EditableSection title="상대 강한 타이밍" original={data.enemyStrongTiming} overrideText={ov("enemyStrongTiming")} onSave={(v) => saveOv("enemyStrongTiming", v)} defaultOpen />
      </div>
      <PersonalPanel data={data} userData={userData} setUserData={setUserData} />
      <EditableSection title="내 챔프 핵심" original={data.myChampionCore} overrideText={ov("myChampionCore")} onSave={(v) => saveOv("myChampionCore", v)} defaultOpen />
      <EditableSection title="상대 핵심 위협/스킬" original={data.enemyCore} overrideText={ov("enemyCore")} onSave={(v) => saveOv("enemyCore", v)} defaultOpen />
      <EditableSection title="1~3렙 운영" original={data.levels1to3} overrideText={ov("levels1to3")} onSave={(v) => saveOv("levels1to3", v)} defaultOpen />
      <EditableSection title="4~5렙 운영" original={data.levels4to5} overrideText={ov("levels4to5")} onSave={(v) => saveOv("levels4to5", v)} />
      <EditableSection title="6렙 이후 / 킬각" original={data.level6AndAfter} overrideText={ov("level6AndAfter")} onSave={(v) => saveOv("level6AndAfter", v)} defaultOpen />
      <EditableSection title="스킬 대응" original={data.skillInteraction} overrideText={ov("skillInteraction")} onSave={(v) => saveOv("skillInteraction", v)} defaultOpen />
      <EditableSection title="웨이브 관리" original={data.waveManagement} overrideText={ov("waveManagement")} onSave={(v) => saveOv("waveManagement", v)} />
      <EditableSection title="아이템 우선순위" original={data.itemPriority} overrideText={ov("itemPriority")} onSave={(v) => saveOv("itemPriority", v)} />
      <EditableSection title="정글 개입" original={data.jungleInteraction} overrideText={ov("jungleInteraction")} onSave={(v) => saveOv("jungleInteraction", v)} />
      <EditableSection title="사이드 운영" original={data.sideLane} overrideText={ov("sideLane")} onSave={(v) => saveOv("sideLane", v)} />
      <EditableSection title="한타 운영" original={data.teamfight} overrideText={ov("teamfight")} onSave={(v) => saveOv("teamfight", v)} />
      <EditableSection title="내가 유리할 때" original={data.whenAhead} overrideText={ov("whenAhead")} onSave={(v) => saveOv("whenAhead", v)} />
      <EditableSection title="내가 불리할 때" original={data.whenBehind} overrideText={ov("whenBehind")} onSave={(v) => saveOv("whenBehind", v)} defaultOpen />
      <EditableSection title="핵심 실수" original={data.commonMistakes} overrideText={ov("commonMistakes")} onSave={(v) => saveOv("commonMistakes", v)} defaultOpen />
      <EditableSection title="한줄 요약" original={data.oneLine} overrideText={ov("oneLine")} onSave={(v) => saveOv("oneLine", v)} />
    </section>
  );
}

export default function App() {
  const [myChamp, setMyChamp] = useState("");
  const [enemyChamp, setEnemyChamp] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userData, setUserData] = useLocalUserData();
  const champions = useMemo(() => getAllChampions(userData), [userData]);
  const mainRecs = useMemo(() => recommendMainPool(enemyChamp, userData), [enemyChamp, userData]);
  const detail = useMemo(() => {
    if (!myChamp || !enemyChamp) return null;
    const existing = getMatchup(myChamp, enemyChamp);
    if (existing) return existing;
    return {
      myChampion: myChamp, enemyChampion: enemyChamp, matchup: "개인 데이터", matchupTier: "개인 데이터",
      coreSummary: "기본 매치업 데이터가 없음. 원본 설명 수정 영역에 직접 상대법을 작성해서 개인 데이터로 관리 가능.",
      myStrongTiming: "", enemyStrongTiming: "", myChampionCore: "", enemyCore: "",
      levels1to3: [], levels4to5: [], level6AndAfter: [], skillInteraction: [], waveManagement: [],
      itemPriority: [], jungleInteraction: [], sideLane: [], teamfight: [], whenAhead: [], whenBehind: [],
      commonMistakes: [], oneLine: ""
    };
  }, [myChamp, enemyChamp]);

  const adjustScore = (champ, delta) => {
    if (!enemyChamp) return;
    const key = matchupKey(champ, enemyChamp);
    setUserData((prev) => {
      const current = clampScore(prev.scoreAdjustments?.[key] || 0);
      const nextAdjustments = { ...prev.scoreAdjustments };
      if (delta === "reset") delete nextAdjustments[key];
      else nextAdjustments[key] = clampScore(current + Number(delta));
      return { ...prev, scoreAdjustments: nextAdjustments };
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 p-2 text-slate-100 sm:p-4">
      <div className="mx-auto max-w-5xl space-y-3">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500"><BookOpen className="h-5 w-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-black text-white sm:text-2xl">탑 매치업 백과사전</h1>
              <p className="text-xs text-slate-400 sm:text-sm">주요픽 설정 · 추천픽 직접 추가 · 데이터 공유 · 원본 설명 수정</p>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-20 -mx-2 border-y border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2"><div className="text-[11px] text-slate-400">내 챔피언</div><div className="truncate text-sm font-black text-white">{myChamp || "미선택"}</div></div>
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2"><div className="text-[11px] text-slate-400">상대 탑</div><div className="truncate text-sm font-black text-white">{enemyChamp || "미선택"}</div></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-3 py-2 text-xs font-bold text-white"><Settings className="h-4 w-4" /> 설정/공유</button>
          <button onClick={() => { setMyChamp(""); setEnemyChamp(""); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200"><RotateCcw className="h-4 w-4" /> 선택 초기화</button>
          {enemyChamp && <a href={opggUrl(enemyChamp)} target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">OP.GG 보기 <ExternalLink className="h-4 w-4" /></a>}
          <button onClick={() => { if (confirm("개인 수정/노트/점수/체크리스트/주요픽 설정을 전부 삭제할까?")) setUserData(defaultUserData()); }} className="rounded-xl bg-red-950 px-3 py-2 text-xs font-bold text-red-100">개인데이터 초기화</button>
        </div>

        {settingsOpen && <MainPoolSettings userData={userData} setUserData={setUserData} />}

        <div className="grid gap-3 lg:grid-cols-2">
          <ChampionPicker title="상대 탑 선택" value={enemyChamp} onChange={setEnemyChamp} accent="red" champions={champions} />
          <ChampionPicker title="내 챔피언 선택" value={myChamp} onChange={setMyChamp} accent="indigo" champions={champions} />
        </div>

        {enemyChamp && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-300" /><h2 className="text-base font-black text-white">추천픽 통합 리스트</h2></div>
            <p className="text-xs text-slate-400">내 주요픽 + 명확한 카운터 후보 + 직접 추가한 챔프 + 내가 점수 올린 챔프가 표시됨. 카드를 누르면 내 챔피언으로 선택됨.</p>
            <ManualRecommendationEditor enemyChamp={enemyChamp} userData={userData} setUserData={setUserData} />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{mainRecs.map((r) => <RecCard key={r.champ} item={r} onPick={setMyChamp} selected={myChamp === r.champ} onAdjust={adjustScore} />)}</div>
          </section>
        )}

        <MatchupDetail data={detail} userData={userData} setUserData={setUserData} />
      </div>
    </main>
  );
}
