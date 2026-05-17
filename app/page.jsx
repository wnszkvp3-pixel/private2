
"use client";

import React, { useMemo, useState } from "react";
import { Search, RotateCcw, Star, ChevronDown, ChevronUp, BookOpen, ExternalLink, Save, Plus, Trash2, Edit3, CheckSquare } from "lucide-react";
import db from "../data/matchups.json";

const MAIN_POOL = ["오른", "모데카이저", "요릭", "말파이트", "문도 박사", "피오라", "잭스"];
const STORAGE_KEY = "lol_top_matchup_user_data_v1";
const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const allChampions = db.champions || [];
const matchupMap = new Map((db.matchups || []).map((m) => [`${m.myChampion}__${m.enemyChampion}`, m]));

function cx(...classes) { return classes.filter(Boolean).join(" "); }
function matchupKey(my, enemy) { return `${my}__${enemy}`; }
function getMatchup(my, enemy) { return matchupMap.get(matchupKey(my, enemy)); }
function clampScore(n) { const num = Number(n) || 0; return Math.max(-50, Math.min(50, num)); }
function safeParse(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function defaultUserData() { return { matchupNotes: {}, matchupEdits: {}, scoreAdjustments: {}, checklists: {} }; }

function useLocalUserData() {
  const [data, setData] = React.useState(defaultUserData);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setData({ ...defaultUserData(), ...safeParse(window.localStorage.getItem(STORAGE_KEY), defaultUserData()) });
  }, []);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);
  const update = (fn) => setData((prev) => ({ ...defaultUserData(), ...(typeof fn === "function" ? fn(prev) : fn) }));
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

function matchupScore(m) {
  if (!m) return 50;
  if (typeof m.recommendScoreBase === "number") return m.recommendScoreBase;
  const tier = m.matchupTier || m.matchup || "";
  const table = { "극카운터": 94, "카운터": 84, "유리": 72, "초반 유리": 64, "반반": 55, "미러전": 50, "초반 불리": 45, "불리": 38, "카운터 당함": 28, "극카운터 당함": 16 };
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
  return text.replaceAll("이후", "후").split(".")[0].slice(0, 78);
}
function opggUrl(champ) {
  return `https://www.op.gg/champions/${encodeURIComponent(champ)}/counters/top?hl=ko_KR`;
}

function recommendAllCounters(enemy, userData) {
  if (!enemy) return [];
  return allChampions.filter((champ) => champ !== enemy).map((champ) => {
    const m = getMatchup(champ, enemy);
    const adj = clampScore(userData?.scoreAdjustments?.[matchupKey(champ, enemy)] || 0);
    return {
      champ,
      matchup: m?.matchupTier || m?.matchup || "정보 없음",
      timing: m?.myStrongTiming || "",
      score: Math.max(0, Math.min(100, matchupScore(m) + adj)),
      baseScore: matchupScore(m),
      adjustment: adj,
      data: m,
      isMainPool: MAIN_POOL.includes(champ)
    };
  }).filter((x) => x.data && !x.matchup.includes("당함") && (x.matchup.includes("카운터") || x.matchup.includes("유리") || x.score >= 70 || x.adjustment > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function recommendMainPool(enemy, userData) {
  if (!enemy) return [];
  const pickSet = new Set(MAIN_POOL);
  recommendAllCounters(enemy, userData).slice(0, 12).forEach((x) => pickSet.add(x.champ));
  Object.entries(userData?.scoreAdjustments || {}).forEach(([key, val]) => {
    const [champ, e] = key.split("__");
    if (e === enemy && Number(val) > 0) pickSet.add(champ);
  });
  return Array.from(pickSet).filter((champ) => champ !== enemy).map((champ) => {
    const m = getMatchup(champ, enemy);
    const adj = clampScore(userData?.scoreAdjustments?.[matchupKey(champ, enemy)] || 0);
    return {
      champ,
      matchup: m?.matchupTier || m?.matchup || "정보 없음",
      timing: m?.myStrongTiming || "",
      score: Math.max(0, Math.min(100, matchupScore(m) + adj)),
      baseScore: matchupScore(m),
      adjustment: adj,
      oneLine: m?.oneLine || "",
      data: m,
      isMainPool: MAIN_POOL.includes(champ)
    };
  }).sort((a, b) => b.score - a.score).slice(0, 14);
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
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색: ㄷㄹㅇㅅ, ㄱㄹ, 세트" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
      </div>
      {value ? <button onClick={() => setQuery(value)} className="mb-2 w-full rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-3 py-2 text-left text-sm font-bold text-white">선택됨: {value}</button> : <p className="mb-2 text-[11px] text-slate-400">초성/이름으로 검색 후 선택</p>}
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

function RecCard({ item, onPick, selected, onAdjust }) {
  return (
    <div className={cx("w-full rounded-2xl border p-3 text-left", selected ? "border-indigo-300 bg-indigo-500/20" : "border-slate-800 bg-slate-900")}>
      <button onClick={() => onPick(item.champ)} className="w-full text-left active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-white">{item.champ}</span>
              {item.isMainPool && <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-200">주픽</span>}
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
          {Array.isArray(items) ? items.map((x, i) => <p key={i} className="rounded-xl bg-slate-900 p-3 text-sm leading-relaxed text-slate-200">{x}</p>) : Object.entries(items).map(([k, v]) => (
            <p key={k} className="rounded-xl bg-slate-900 p-3 text-sm leading-relaxed text-slate-200"><span className="font-bold text-indigo-200">{k}: </span>{String(v)}</p>
          ))}
        </div>
      )}
    </div>
  );
}

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
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-white">{data.myChampion} vs {data.enemyChampion}</h2><span className={cx("rounded-full border px-2 py-1 text-xs font-bold", labelTone(data.matchupTier || data.matchup))}>{data.matchupTier || data.matchup}</span></div>
        <p className="text-sm leading-relaxed text-slate-200">{data.coreSummary}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3"><div className="mb-1 text-xs font-bold text-emerald-200">내가 강한 타이밍</div><p className="text-sm leading-relaxed text-slate-100">{data.myStrongTiming}</p></div>
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-3"><div className="mb-1 text-xs font-bold text-red-200">상대 강한 타이밍</div><p className="text-sm leading-relaxed text-slate-100">{data.enemyStrongTiming}</p></div>
      </div>
      <PersonalPanel data={data} userData={userData} setUserData={setUserData} />
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
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3"><div className="text-xs font-bold text-slate-400">한줄 요약</div><p className="mt-1 text-sm leading-relaxed text-white">{data.oneLine}</p></div>
    </section>
  );
}

export default function App() {
  const [myChamp, setMyChamp] = useState("");
  const [enemyChamp, setEnemyChamp] = useState("");
  const [userData, setUserData] = useLocalUserData();
  const mainRecs = useMemo(() => recommendMainPool(enemyChamp, userData), [enemyChamp, userData]);
  const detail = useMemo(() => (myChamp && enemyChamp ? getMatchup(myChamp, enemyChamp) : null), [myChamp, enemyChamp]);

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
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500"><BookOpen className="h-5 w-5 text-white" /></div><div><h1 className="text-lg font-black text-white sm:text-2xl">탑 매치업 백과사전</h1><p className="text-xs text-slate-400 sm:text-sm">추천픽 점수 조정 · 개인 노트 · 체크리스트 저장 가능</p></div></div>
        </header>

        <div className="sticky top-0 z-20 -mx-2 border-y border-slate-800 bg-slate-950/95 px-2 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2"><div className="text-[11px] text-slate-400">내 챔피언</div><div className="truncate text-sm font-black text-white">{myChamp || "미선택"}</div></div><div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2"><div className="text-[11px] text-slate-400">상대 탑</div><div className="truncate text-sm font-black text-white">{enemyChamp || "미선택"}</div></div></div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ChampionPicker title="상대 탑 선택" value={enemyChamp} onChange={setEnemyChamp} accent="red" />
          <ChampionPicker title="내 챔피언 선택" value={myChamp} onChange={setMyChamp} accent="indigo" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setMyChamp(""); setEnemyChamp(""); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200"><RotateCcw className="h-4 w-4" /> 선택 초기화</button>
          {enemyChamp && <a href={opggUrl(enemyChamp)} target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">OP.GG 보기 <ExternalLink className="h-4 w-4" /></a>}
          <button onClick={() => { if (confirm("개인 수정/노트/점수/체크리스트를 전부 삭제할까?")) setUserData(defaultUserData()); }} className="rounded-xl bg-red-950 px-3 py-2 text-xs font-bold text-red-100">개인데이터 초기화</button>
        </div>

        {enemyChamp && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-300" /><h2 className="text-base font-black text-white">추천픽 통합 리스트</h2></div>
            <p className="text-xs text-slate-400">기본 주픽 7개 + 전체 카운터 후보 + 내가 점수 올린 챔프가 함께 표시됨. 카드를 누르면 내 챔피언으로 선택됨.</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{mainRecs.map((r) => <RecCard key={r.champ} item={r} onPick={setMyChamp} selected={myChamp === r.champ} onAdjust={adjustScore} />)}</div>
          </section>
        )}

        {enemyChamp && (
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center gap-2"><Sword className="h-4 w-4 text-red-300" /><h2 className="text-base font-black text-white">전체 챔피언 기준 카운터 후보</h2></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{counterRecs.map((r) => <RecCard key={r.champ} item={r} onPick={setMyChamp} selected={myChamp === r.champ} onAdjust={adjustScore} />)}</div>
          </section>
        )}

        <MatchupDetail data={detail} userData={userData} setUserData={setUserData} />
      </div>
    </main>
  );
}
