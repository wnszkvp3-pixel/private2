"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Search, TimerReset, RotateCcw, Users, ShieldBan, Sparkles, Swords, Info } from "lucide-react";

const roleLabels = ["탑", "정글", "미드", "원딜", "서폿"];

const fallbackChampions = [
  { id:"Aatrox", name:"아트록스", tags:["Fighter","Tank"] },
  { id:"Ahri", name:"아리", tags:["Mage","Assassin"] },
  { id:"Akali", name:"아칼리", tags:["Assassin"] },
  { id:"Akshan", name:"아크샨", tags:["Marksman","Assassin"] },
  { id:"Alistar", name:"알리스타", tags:["Tank","Support"] },
  { id:"Amumu", name:"아무무", tags:["Tank","Mage"] },
  { id:"Anivia", name:"애니비아", tags:["Mage","Support"] },
  { id:"Annie", name:"애니", tags:["Mage"] },
  { id:"Aphelios", name:"아펠리오스", tags:["Marksman"] },
  { id:"Ashe", name:"애쉬", tags:["Marksman","Support"] },
  { id:"AurelionSol", name:"아우렐리온 솔", tags:["Mage"] },
  { id:"Aurora", name:"오로라", tags:["Mage","Assassin"] },
  { id:"Azir", name:"아지르", tags:["Mage","Marksman"] },
  { id:"Bard", name:"바드", tags:["Support","Mage"] },
  { id:"Belveth", name:"벨베스", tags:["Fighter"] },
  { id:"Blitzcrank", name:"블리츠크랭크", tags:["Tank","Fighter"] },
  { id:"Brand", name:"브랜드", tags:["Mage"] },
  { id:"Braum", name:"브라움", tags:["Support","Tank"] },
  { id:"Briar", name:"브라이어", tags:["Fighter","Assassin"] },
  { id:"Caitlyn", name:"케이틀린", tags:["Marksman"] },
  { id:"Camille", name:"카밀", tags:["Fighter","Tank"] },
  { id:"Cassiopeia", name:"카시오페아", tags:["Mage"] },
  { id:"Chogath", name:"초가스", tags:["Tank","Mage"] },
  { id:"Corki", name:"코르키", tags:["Marksman"] },
  { id:"Darius", name:"다리우스", tags:["Fighter","Tank"] },
  { id:"Diana", name:"다이애나", tags:["Fighter","Mage"] },
  { id:"Draven", name:"드레이븐", tags:["Marksman"] },
  { id:"DrMundo", name:"문도 박사", tags:["Fighter","Tank"] },
  { id:"Ekko", name:"에코", tags:["Assassin","Fighter"] },
  { id:"Elise", name:"엘리스", tags:["Mage","Fighter"] },
  { id:"Evelynn", name:"이블린", tags:["Assassin","Mage"] },
  { id:"Ezreal", name:"이즈리얼", tags:["Marksman","Mage"] },
  { id:"Fiddlesticks", name:"피들스틱", tags:["Mage","Support"] },
  { id:"Fiora", name:"피오라", tags:["Fighter","Assassin"] },
  { id:"Fizz", name:"피즈", tags:["Assassin","Fighter"] },
  { id:"Galio", name:"갈리오", tags:["Tank","Mage"] },
  { id:"Gangplank", name:"갱플랭크", tags:["Fighter"] },
  { id:"Garen", name:"가렌", tags:["Fighter","Tank"] },
  { id:"Gnar", name:"나르", tags:["Fighter","Tank"] },
  { id:"Gragas", name:"그라가스", tags:["Fighter","Mage"] },
  { id:"Graves", name:"그레이브즈", tags:["Marksman"] },
  { id:"Gwen", name:"그웬", tags:["Fighter","Assassin"] },
  { id:"Hecarim", name:"헤카림", tags:["Fighter","Tank"] },
  { id:"Heimerdinger", name:"하이머딩거", tags:["Mage","Support"] },
  { id:"Hwei", name:"흐웨이", tags:["Mage"] },
  { id:"Illaoi", name:"일라오이", tags:["Fighter","Tank"] },
  { id:"Irelia", name:"이렐리아", tags:["Fighter","Assassin"] },
  { id:"Ivern", name:"아이번", tags:["Support","Mage"] },
  { id:"Janna", name:"잔나", tags:["Support","Mage"] },
  { id:"JarvanIV", name:"자르반 4세", tags:["Tank","Fighter"] },
  { id:"Jax", name:"잭스", tags:["Fighter","Assassin"] },
  { id:"Jayce", name:"제이스", tags:["Fighter","Marksman"] },
  { id:"Jhin", name:"진", tags:["Marksman","Mage"] },
  { id:"Jinx", name:"징크스", tags:["Marksman"] },
  { id:"Kaisa", name:"카이사", tags:["Marksman"] },
  { id:"Kalista", name:"칼리스타", tags:["Marksman"] },
  { id:"Karma", name:"카르마", tags:["Mage","Support"] },
  { id:"Karthus", name:"카서스", tags:["Mage"] },
  { id:"Kassadin", name:"카사딘", tags:["Assassin","Mage"] },
  { id:"Katarina", name:"카타리나", tags:["Assassin","Mage"] },
  { id:"Kayle", name:"케일", tags:["Fighter","Support"] },
  { id:"Kayn", name:"케인", tags:["Fighter","Assassin"] },
  { id:"Kennen", name:"케넨", tags:["Mage","Marksman"] },
  { id:"Khazix", name:"카직스", tags:["Assassin"] },
  { id:"Kindred", name:"킨드레드", tags:["Marksman"] },
  { id:"Kled", name:"클레드", tags:["Fighter","Tank"] },
  { id:"KogMaw", name:"코그모", tags:["Marksman","Mage"] },
  { id:"KSante", name:"크산테", tags:["Tank","Fighter"] },
  { id:"Leblanc", name:"르블랑", tags:["Assassin","Mage"] },
  { id:"LeeSin", name:"리 신", tags:["Fighter","Assassin"] },
  { id:"Leona", name:"레오나", tags:["Tank","Support"] },
  { id:"Lillia", name:"릴리아", tags:["Fighter","Mage"] },
  { id:"Lissandra", name:"리산드라", tags:["Mage"] },
  { id:"Lucian", name:"루시안", tags:["Marksman"] },
  { id:"Lulu", name:"룰루", tags:["Support","Mage"] },
  { id:"Lux", name:"럭스", tags:["Mage","Support"] },
  { id:"Malphite", name:"말파이트", tags:["Tank","Fighter"] },
  { id:"Malzahar", name:"말자하", tags:["Mage","Assassin"] },
  { id:"Maokai", name:"마오카이", tags:["Tank","Mage"] },
  { id:"MasterYi", name:"마스터 이", tags:["Assassin","Fighter"] },
  { id:"Mel", name:"멜", tags:["Mage"] },
  { id:"Milio", name:"밀리오", tags:["Support"] },
  { id:"MissFortune", name:"미스 포츈", tags:["Marksman"] },
  { id:"MonkeyKing", name:"오공", tags:["Fighter","Tank"] },
  { id:"Mordekaiser", name:"모데카이저", tags:["Fighter"] },
  { id:"Morgana", name:"모르가나", tags:["Mage","Support"] },
  { id:"Naafiri", name:"나피리", tags:["Assassin"] },
  { id:"Nami", name:"나미", tags:["Support","Mage"] },
  { id:"Nasus", name:"나서스", tags:["Fighter","Tank"] },
  { id:"Nautilus", name:"노틸러스", tags:["Tank","Support"] },
  { id:"Neeko", name:"니코", tags:["Mage","Support"] },
  { id:"Nidalee", name:"니달리", tags:["Assassin","Mage"] },
  { id:"Nilah", name:"닐라", tags:["Fighter","Assassin"] },
  { id:"Nocturne", name:"녹턴", tags:["Assassin","Fighter"] },
  { id:"Nunu", name:"누누와 윌럼프", tags:["Tank","Fighter"] },
  { id:"Olaf", name:"올라프", tags:["Fighter","Tank"] },
  { id:"Orianna", name:"오리아나", tags:["Mage","Support"] },
  { id:"Ornn", name:"오른", tags:["Tank","Fighter"] },
  { id:"Pantheon", name:"판테온", tags:["Fighter","Assassin"] },
  { id:"Poppy", name:"뽀삐", tags:["Tank","Fighter"] },
  { id:"Pyke", name:"파이크", tags:["Support","Assassin"] },
  { id:"Qiyana", name:"키아나", tags:["Assassin","Fighter"] },
  { id:"Quinn", name:"퀸", tags:["Marksman","Assassin"] },
  { id:"Rakan", name:"라칸", tags:["Support"] },
  { id:"Rammus", name:"람머스", tags:["Tank","Fighter"] },
  { id:"RekSai", name:"렉사이", tags:["Fighter"] },
  { id:"Rell", name:"렐", tags:["Tank","Support"] },
  { id:"Renata", name:"레나타 글라스크", tags:["Support","Mage"] },
  { id:"Renekton", name:"레넥톤", tags:["Fighter","Tank"] },
  { id:"Rengar", name:"렝가", tags:["Assassin","Fighter"] },
  { id:"Riven", name:"리븐", tags:["Fighter","Assassin"] },
  { id:"Rumble", name:"럼블", tags:["Fighter","Mage"] },
  { id:"Ryze", name:"라이즈", tags:["Mage","Fighter"] },
  { id:"Samira", name:"사미라", tags:["Marksman"] },
  { id:"Sejuani", name:"세주아니", tags:["Tank","Fighter"] },
  { id:"Senna", name:"세나", tags:["Marksman","Support"] },
  { id:"Seraphine", name:"세라핀", tags:["Mage","Support"] },
  { id:"Sett", name:"세트", tags:["Fighter","Tank"] },
  { id:"Shaco", name:"샤코", tags:["Assassin"] },
  { id:"Shen", name:"쉔", tags:["Tank"] },
  { id:"Shyvana", name:"쉬바나", tags:["Fighter","Tank"] },
  { id:"Singed", name:"신지드", tags:["Tank","Fighter"] },
  { id:"Sion", name:"사이온", tags:["Tank","Fighter"] },
  { id:"Sivir", name:"시비르", tags:["Marksman"] },
  { id:"Skarner", name:"스카너", tags:["Fighter","Tank"] },
  { id:"Smolder", name:"스몰더", tags:["Marksman","Mage"] },
  { id:"Sona", name:"소나", tags:["Support","Mage"] },
  { id:"Soraka", name:"소라카", tags:["Support","Mage"] },
  { id:"Swain", name:"스웨인", tags:["Mage","Fighter"] },
  { id:"Sylas", name:"사일러스", tags:["Mage","Assassin"] },
  { id:"Syndra", name:"신드라", tags:["Mage","Support"] },
  { id:"TahmKench", name:"탐 켄치", tags:["Support","Tank"] },
  { id:"Taliyah", name:"탈리야", tags:["Mage","Support"] },
  { id:"Talon", name:"탈론", tags:["Assassin"] },
  { id:"Taric", name:"타릭", tags:["Support","Fighter"] },
  { id:"Teemo", name:"티모", tags:["Marksman","Assassin"] },
  { id:"Thresh", name:"쓰레쉬", tags:["Support","Fighter"] },
  { id:"Tristana", name:"트리스타나", tags:["Marksman","Assassin"] },
  { id:"Trundle", name:"트런들", tags:["Fighter","Tank"] },
  { id:"Tryndamere", name:"트린다미어", tags:["Fighter","Assassin"] },
  { id:"TwistedFate", name:"트위스티드 페이트", tags:["Mage"] },
  { id:"Twitch", name:"트위치", tags:["Marksman","Assassin"] },
  { id:"Udyr", name:"우디르", tags:["Fighter","Tank"] },
  { id:"Urgot", name:"우르곳", tags:["Fighter","Tank"] },
  { id:"Varus", name:"바루스", tags:["Marksman","Mage"] },
  { id:"Vayne", name:"베인", tags:["Marksman","Assassin"] },
  { id:"Veigar", name:"베이가", tags:["Mage"] },
  { id:"Velkoz", name:"벨코즈", tags:["Mage"] },
  { id:"Vex", name:"벡스", tags:["Mage"] },
  { id:"Vi", name:"바이", tags:["Fighter","Assassin"] },
  { id:"Viego", name:"비에고", tags:["Assassin","Fighter"] },
  { id:"Viktor", name:"빅토르", tags:["Mage"] },
  { id:"Vladimir", name:"블라디미르", tags:["Mage"] },
  { id:"Volibear", name:"볼리베어", tags:["Fighter","Tank"] },
  { id:"Warwick", name:"워윅", tags:["Fighter","Tank"] },
  { id:"Xayah", name:"자야", tags:["Marksman"] },
  { id:"Xerath", name:"제라스", tags:["Mage"] },
  { id:"XinZhao", name:"신 짜오", tags:["Fighter","Assassin"] },
  { id:"Yasuo", name:"야스오", tags:["Fighter","Assassin"] },
  { id:"Yone", name:"요네", tags:["Assassin","Fighter"] },
  { id:"Yorick", name:"요릭", tags:["Fighter","Tank"] },
  { id:"Yuumi", name:"유미", tags:["Support","Mage"] },
  { id:"Zac", name:"자크", tags:["Tank","Fighter"] },
  { id:"Zed", name:"제드", tags:["Assassin"] },
  { id:"Zeri", name:"제리", tags:["Marksman"] },
  { id:"Ziggs", name:"직스", tags:["Mage"] },
  { id:"Zilean", name:"질리언", tags:["Support","Mage"] },
  { id:"Zoe", name:"조이", tags:["Mage","Support"] },
  { id:"Zyra", name:"자이라", tags:["Mage","Support"] }
];

const topMeta = {
  "가렌": { type:"bruiser", damage:"AD", tank:2, engage:1, peel:1, difficulty:1, tags:["AD","브루저"], topWeight:1 },
  "갱플랭크": { type:"carry", damage:"AD", tank:0, engage:0, peel:0, difficulty:3, tags:["AD","후반","포킹"], topWeight:1 },
  "그라가스": { type:"utility", damage:"AP", tank:2, engage:3, peel:3, difficulty:2, tags:["AP","이니시","받아치기"], topWeight:.7 },
  "그웬": { type:"carry", damage:"AP", tank:1, engage:0, peel:0, difficulty:2, tags:["AP","탱커처리"], topWeight:1 },
  "나르": { type:"utility", damage:"AD", tank:1, engage:2, peel:1, difficulty:3, tags:["AD","한타"], topWeight:1 },
  "나서스": { type:"scaler", damage:"AD", tank:2, engage:0, peel:1, difficulty:1, tags:["AD","왕귀"], topWeight:1 },
  "다리우스": { type:"bruiser", damage:"AD", tank:2, engage:0, peel:0, difficulty:2, tags:["AD","초반강함"], topWeight:1 },
  "레넥톤": { type:"bruiser", damage:"AD", tank:2, engage:1, peel:1, difficulty:2, tags:["AD","초반강함"], topWeight:1 },
  "리븐": { type:"carry", damage:"AD", tank:0, engage:2, peel:0, difficulty:3, tags:["AD","스노우볼"], topWeight:1 },
  "말파이트": { type:"tank", damage:"AP", tank:3, engage:3, peel:1, difficulty:1, tags:["탱커","AP","이니시"], topWeight:1 },
  "모데카이저": { type:"bruiser", damage:"AP", tank:2, engage:0, peel:0, difficulty:1, tags:["AP","격리"], topWeight:1 },
  "볼리베어": { type:"bruiser", damage:"mixed", tank:2, engage:2, peel:1, difficulty:1, tags:["브루저","다이브"], topWeight:.7 },
  "사이온": { type:"tank", damage:"AD", tank:3, engage:2, peel:2, difficulty:1, tags:["탱커","이니시"], topWeight:1 },
  "세트": { type:"bruiser", damage:"AD", tank:2, engage:1, peel:1, difficulty:1, tags:["AD","한타"], topWeight:1 },
  "쉔": { type:"tank", damage:"mixed", tank:3, engage:2, peel:3, difficulty:2, tags:["탱커","지원"], topWeight:1 },
  "아트록스": { type:"bruiser", damage:"AD", tank:1, engage:1, peel:0, difficulty:2, tags:["AD","흡혈"], topWeight:1 },
  "오른": { type:"tank", damage:"mixed", tank:3, engage:3, peel:2, difficulty:2, tags:["탱커","이니시","한타"], topWeight:1 },
  "올라프": { type:"bruiser", damage:"AD", tank:1, engage:1, peel:0, difficulty:1, tags:["AD","CC무시"], topWeight:.7 },
  "요네": { type:"carry", damage:"mixed", tank:0, engage:2, peel:0, difficulty:2, tags:["캐리","혼합딜"], topWeight:.6 },
  "요릭": { type:"split", damage:"AD", tank:1, engage:0, peel:0, difficulty:1, tags:["AD","스플릿"], topWeight:1 },
  "워윅": { type:"bruiser", damage:"mixed", tank:2, engage:2, peel:1, difficulty:1, tags:["유지력"], topWeight:.5 },
  "우르곳": { type:"bruiser", damage:"AD", tank:2, engage:1, peel:1, difficulty:2, tags:["AD","중거리"], topWeight:1 },
  "일라오이": { type:"bruiser", damage:"AD", tank:2, engage:0, peel:0, difficulty:2, tags:["AD","촉수"], topWeight:1 },
  "잭스": { type:"carry", damage:"mixed", tank:1, engage:1, peel:1, difficulty:2, tags:["스플릿","혼합딜"], topWeight:1 },
  "제이스": { type:"poke", damage:"AD", tank:0, engage:0, peel:1, difficulty:3, tags:["AD","포킹"], topWeight:.8 },
  "카밀": { type:"carry", damage:"AD", tank:1, engage:2, peel:0, difficulty:3, tags:["스플릿","진입"], topWeight:1 },
  "케넨": { type:"utility", damage:"AP", tank:0, engage:3, peel:1, difficulty:2, tags:["AP","한타","이니시"], topWeight:1 },
  "퀸": { type:"ranged", damage:"AD", tank:0, engage:0, peel:1, difficulty:2, tags:["AD","원거리","로밍"], topWeight:1 },
  "티모": { type:"ranged", damage:"AP", tank:0, engage:0, peel:1, difficulty:1, tags:["AP","실명"], topWeight:1 },
  "트린다미어": { type:"split", damage:"AD", tank:0, engage:1, peel:0, difficulty:1, tags:["AD","스플릿"], topWeight:1 },
  "판테온": { type:"bruiser", damage:"AD", tank:1, engage:2, peel:1, difficulty:1, tags:["AD","초반강함"], topWeight:.6 },
  "피오라": { type:"duelist", damage:"AD", tank:0, engage:0, peel:0, difficulty:3, tags:["AD","스플릿","탱커처리"], topWeight:1 },
  "베인": { type:"ranged", damage:"AD", tank:0, engage:0, peel:1, difficulty:2, tags:["AD","원거리","탱커처리"], topWeight:.7 },
  "럼블": { type:"utility", damage:"AP", tank:1, engage:2, peel:0, difficulty:2, tags:["AP","한타"], topWeight:.8 },
  "크산테": { type:"tank", damage:"AD", tank:3, engage:2, peel:2, difficulty:3, tags:["탱커","한타"], topWeight:1 },
  "뽀삐": { type:"tank", damage:"AD", tank:3, engage:2, peel:3, difficulty:2, tags:["탱커","돌진차단"], topWeight:.8 },
  "문도 박사": { type:"tank", damage:"AD", tank:3, engage:0, peel:0, difficulty:1, tags:["탱커","유지력"], topWeight:1 },
  "마오카이": { type:"tank", damage:"AP", tank:3, engage:2, peel:3, difficulty:1, tags:["탱커","이니시"], topWeight:.6 },
  "신지드": { type:"tank", damage:"AP", tank:2, engage:1, peel:1, difficulty:2, tags:["AP","운영"], topWeight:1 },
  "블라디미르": { type:"carry", damage:"AP", tank:0, engage:0, peel:0, difficulty:2, tags:["AP","후반"], topWeight:.7 },
  "라이즈": { type:"carry", damage:"AP", tank:0, engage:0, peel:0, difficulty:3, tags:["AP","스케일링"], topWeight:.5 },
  "렝가": { type:"assassin", damage:"AD", tank:0, engage:1, peel:0, difficulty:3, tags:["AD","암살"], topWeight:.6 },
  "클레드": { type:"bruiser", damage:"AD", tank:2, engage:2, peel:0, difficulty:2, tags:["AD","초반강함"], topWeight:1 }
};

const counterGuides = {
  "가렌": {
    "퀸": ["가렌 Q는 퀸 E로 바로 밀어낸다.", "1레벨에는 가까이 붙지 말고 평타 견제로 패시브를 끊는다.", "가렌 W가 빠진 뒤 짧게 강딜교한다.", "6레벨 이후 체력 40% 이하면 점멸-Q-궁 킬각을 조심한다."],
    "케넨": ["가렌 Q 진입은 케넨 E 또는 스턴으로 끊는다.", "평타-Q로 패시브 회복을 계속 끊는다.", "가렌 W가 빠졌을 때 Q-W-평타로 딜교한다.", "6레벨 이후 궁으로 역이니시 가능하다."],
    "베인": ["가렌 Q 진입은 Q 구르기 또는 E 선고로 끊는다.", "3타만 터뜨리고 빠지는 짧은 딜교를 반복한다.", "판금장화 전까지 CS 차이를 벌린다.", "6레벨 이후 점멸-Q-궁 킬각을 조심한다."],
    "티모": ["가렌 Q로 달려오면 실명으로 대응한다.", "평타로 패시브 회복을 계속 끊는다.", "6레벨 이후 버섯을 라인 옆과 강가에 깔아 진입을 막는다."]
  },
  "다리우스": {
    "퀸": ["다리우스 E 사거리 안에 오래 머물지 않는다.", "Q 바깥날을 맞지 않게 안쪽으로 들어가거나 완전히 빠진다.", "E가 빠진 뒤 강하게 압박한다.", "유체화 켜면 맞딜하지 말고 거리 벌린다."],
    "베인": ["E 끌기 사거리 밖에서 3타만 터뜨린다.", "벽 근처에서는 선고각을 잡는다.", "출혈 4스택 이상이면 바로 빠진다.", "다리우스 유체화 있을 땐 라인을 길게 밀지 않는다."],
    "케넨": ["평타-Q 견제 반복.", "다리우스 E가 빠진 뒤 압박.", "유체화가 켜지면 E로 후퇴.", "6레벨 이후 궁 역킬각 가능."]
  },
  "피오라": {
    "말파이트": ["궁을 먼저 쓰면 응수에 막힐 수 있으므로 응수를 먼저 빼고 궁을 쓴다.", "Q 짤짤이와 방어력 아이템으로 버틴다.", "피오라 궁이 켜지면 벽에 붙어 약점 한 방향을 막는다.", "1코어 이후 사이드는 피오라가 강하므로 한타 유도."],
    "판테온": ["판테온 W를 무작정 쓰면 응수에 역기절당한다.", "응수 빠진 뒤 W-Q-평타로 짧게 폭딜.", "1~3레벨 주도권을 잡는다.", "6레벨 이후 궁 약점 다 터지지 않게 거리 관리."],
    "퀸": ["Q 찌르기 사거리를 계속 체크한다.", "응수 빠진 뒤 E로 밀고 압박한다.", "초반 1~3레벨 원거리 주도권을 활용한다."]
  }
};


const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function getInitials(text = "") {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code < 0 || code > 11171) return char.toLowerCase();
      return CHO_LIST[Math.floor(code / 588)];
    })
    .join("");
}

function normalizeSearch(text = "") {
  return text.toLowerCase().replace(/\s/g, "");
}

function championMatchesQuery(champ, query) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const name = normalizeSearch(champ.name);
  const id = normalizeSearch(champ.id);
  const initials = getInitials(champ.name);
  return name.includes(q) || id.includes(q) || initials.includes(q);
}



const laneMatchupRules = {
  "그웬": {
    good: ["퀸", "케넨", "제이스", "피오라", "카밀", "아트록스", "판테온"],
    bad: ["말파이트", "오른", "사이온", "쉔", "마오카이", "문도 박사", "초가스", "나서스"],
    notes: {
      good: "그웬 상대로 라인전/사이드 대응 가능",
      bad: "그웬은 탱커를 잘 녹여서 순수 탱커 후픽 위험"
    }
  },
  "가렌": {
    good: ["퀸", "케넨", "베인", "티모", "카밀", "피오라"],
    bad: ["나서스", "사이온", "마오카이"],
    notes: { good: "가렌 상대로 거리 유지/카이팅 가능", bad: "가렌에게 라인 주도권을 주기 쉬움" }
  },
  "다리우스": {
    good: ["퀸", "베인", "케넨", "요릭", "올라프", "제이스"],
    bad: ["사이온", "마오카이", "나서스", "말파이트"],
    notes: { good: "다리우스의 짧은 사거리와 E 의존도를 공략 가능", bad: "다리우스에게 긴 교전/출혈 스택을 허용하기 쉬움" }
  },
  "피오라": {
    good: ["말파이트", "판테온", "퀸", "케넨", "워윅"],
    bad: ["사이온", "오른", "쉔", "나서스"],
    notes: { good: "피오라 응수와 약점 관리를 압박 가능", bad: "피오라에게 사이드 주도권을 주기 쉬움" }
  },
  "잭스": {
    good: ["말파이트", "그라가스", "가렌", "케넨", "퀸"],
    bad: ["이렐리아", "요네", "트린다미어"],
    notes: { good: "잭스 E 이후 빈틈을 공략하거나 평타 의존도를 낮출 수 있음", bad: "잭스와 후반 사이드 구도에서 불리할 수 있음" }
  },
  "말파이트": {
    good: ["사일러스", "그웬", "모데카이저", "블라디미르", "럼블"],
    bad: ["퀸", "베인", "제이스"],
    notes: { good: "말파이트의 방어력 기반 운영을 AP/지속딜로 공략", bad: "말파이트 방어력/궁 한타에 막히기 쉬움" }
  },
  "오른": {
    good: ["피오라", "그웬", "카밀", "베인", "모데카이저"],
    bad: ["말파이트", "사이온", "쉔"],
    notes: { good: "오른의 탱킹을 체력비례딜/고정딜로 압박", bad: "오른에게 무난한 성장을 허용하기 쉬움" }
  },
  "사이온": {
    good: ["피오라", "그웬", "베인", "다리우스", "카밀"],
    bad: ["말파이트", "쉔"],
    notes: { good: "사이온의 체력/탱킹을 녹이거나 Q 차징을 응징 가능", bad: "사이온 성장과 사이드 운영을 막기 어려움" }
  },
  "베인": {
    good: ["말파이트", "잭스", "티모", "판테온", "케넨"],
    bad: ["오른", "사이온", "쉔", "문도 박사"],
    notes: { good: "베인 탑의 짧은 생존력/평타 의존도를 공략", bad: "베인에게 탱커가 녹기 쉬움" }
  },
  "퀸": {
    good: ["말파이트", "이렐리아", "나서스", "오른", "말자하"],
    bad: ["가렌", "다리우스", "세트"],
    notes: { good: "퀸의 원거리 압박을 버티거나 확정 진입 가능", bad: "퀸에게 일방적인 견제를 허용하기 쉬움" }
  }
};

function getLaneMatchup(candidate, enemyName) {
  const rule = laneMatchupRules[enemyName];
  if (!rule) return { score: 0, reason: null, guideType: null };
  if (rule.good.includes(candidate)) {
    return { score: 38, reason: `${enemyName} 상대로 라인전 상성 우수: ${rule.notes.good}`, guideType: "good" };
  }
  if (rule.bad.includes(candidate)) {
    return { score: -34, reason: `${enemyName} 상대로 라인전 상성 위험: ${rule.notes.bad}`, guideType: "bad" };
  }
  return { score: 0, reason: null, guideType: null };
}


function cx(...a){return a.filter(Boolean).join(" ")}
function formatTime(s){return `${Math.floor(s/60)}:${String(Math.max(0,s%60)).padStart(2,"0")}`}

function inferBasicMeta(champion){
  const tags = champion?.tags || [];
  return {
    damage: tags.includes("Mage") ? "AP" : tags.includes("Marksman") ? "AD" : tags.includes("Assassin") ? "AD" : tags.includes("Fighter") ? "AD" : "mixed",
    tank: tags.includes("Tank") ? 3 : tags.includes("Fighter") ? 1 : 0,
    engage: tags.includes("Tank") ? 2 : tags.includes("Assassin") ? 1 : 0,
    peel: tags.includes("Support") || tags.includes("Tank") ? 2 : 0,
    ranged: tags.includes("Marksman") || tags.includes("Mage"),
    support: tags.includes("Support")
  };
}

function analyzeTeam(picks, champMap){
  const ms = picks.filter(Boolean).map(n => {
    const t = topMeta[n];
    const c = champMap[n];
    if(t) return {...t, ranged:t.type==="ranged" || t.type==="poke"};
    return inferBasicMeta(c);
  });
  return {
    hasTank: ms.some(m=>m.tank>=3),
    tankCount: ms.filter(m=>m.tank>=2).length,
    apCount: ms.filter(m=>m.damage==="AP" || m.damage==="mixed").length,
    adCount: ms.filter(m=>m.damage==="AD" || m.damage==="mixed").length,
    engageCount: ms.filter(m=>m.engage>=2).length,
    peelCount: ms.filter(m=>m.peel>=2).length,
    rangedCount: ms.filter(m=>m.ranged).length,
    tankyEnemies: ms.filter(m=>m.tank>=2).length,
    adHeavy: ms.filter(m=>m.damage==="AD").length >= 3,
    apHeavy: ms.filter(m=>m.damage==="AP").length >= 3,
    diveThreat: ms.filter(m=>m.engage>=2).length >= 2
  }
}

function recommend({ally, enemy, bans, pool, champMap}){
  const unavailable = new Set([...ally, ...enemy, ...bans].filter(Boolean));
  const allyA = analyzeTeam(ally, champMap);
  const enemyA = analyzeTeam(enemy, champMap);
  const enemyTopCandidates = enemy.filter(Boolean).map(e=>({ name:e, weight: topMeta[e]?.topWeight ?? 0.2 }));
  const candidateNames = pool.length ? pool : Object.keys(topMeta);
  const results = [];

  for(const c of candidateNames){
    if(unavailable.has(c) || !topMeta[c]) continue;
    const m = topMeta[c];
    let score = 50;
    const reasons = [];
    const guideBlocks = [];

    for(const e of enemyTopCandidates){
      const lane = getLaneMatchup(c, e.name);
      if(lane.score !== 0){
        const weighted = Math.round(lane.score * e.weight);
        score += weighted;
        reasons.push(`${lane.reason}(${weighted > 0 ? "+" : ""}${weighted})`);
      }

      const guide = counterGuides[e.name]?.[c];
      if(guide){
        const plus = Math.round(45 * e.weight);
        score += plus;
        reasons.push(`상대 탑 후보 ${e.name} 상대로 직접 카운터 데이터(+${plus})`);
        guideBlocks.push({ enemy:e.name, guide });
      } else if(topMeta[e.name] && e.weight >= 0.7) {
        if((m.tags.includes("탱커처리") || m.type==="duelist") && topMeta[e.name].tank>=2){ score += 10; reasons.push(`${e.name} 같은 탱커/브루저 처리 가능`); }
        if(m.type==="ranged" && ["bruiser","tank"].includes(topMeta[e.name].type)){ score += 9; reasons.push(`${e.name} 상대로 원거리 주도권 가능`); }
      }
    }

    if(!allyA.hasTank && m.tank>=3){ score += 10; reasons.push("우리 팀 탱커 부족 보완"); }
    else if(allyA.tankCount===0 && m.tank>=2){ score += 6; reasons.push("앞라인 부족 보완"); }

    if(allyA.apCount===0 && (m.damage==="AP" || m.damage==="mixed")){ score += 9; reasons.push("우리 팀 AP 딜 부족 보완"); }
    if(allyA.adCount===0 && (m.damage==="AD" || m.damage==="mixed")){ score += 7; reasons.push("우리 팀 AD 딜 부족 보완"); }
    if(allyA.engageCount===0 && m.engage>=2){ score += 8; reasons.push("우리 팀 이니시 부족 보완"); }
    if(allyA.peelCount===0 && m.peel>=2){ score += 4; reasons.push("아군 보호/받아치기 보완"); }

    if(enemyA.adHeavy && (m.tank>=2 || c==="말파이트")){ score += 7; reasons.push("상대 AD 비중 높음"); }
    if(enemyA.tankyEnemies>=2 && (m.tags.includes("탱커처리") || ["피오라","그웬","베인","카밀"].includes(c))){ score += 9; reasons.push("상대 앞라인/탱커 처리 가능"); }
    if(enemyA.diveThreat && (m.peel>=2 || ["그라가스","뽀삐","케넨","말파이트"].includes(c))){ score += 6; reasons.push("상대 돌진 조합 대응"); }
    if(enemyA.rangedCount>=2 && (m.engage>=2 || ["말파이트","오른","케넨"].includes(c))){ score += 5; reasons.push("상대 원거리 조합에 이니시 가능"); }

    if(m.difficulty>=3){ score -= 3; reasons.push("난이도 높은 픽이라 숙련도 필요"); }
    if(pool.includes(c)){ score += 12; reasons.push("내 챔피언 풀 포함"); }

    if(reasons.length === 0) reasons.push("현재 조합에서 무난한 탑 픽");
    results.push({ pick:c, score:Math.max(0,Math.min(100,score)), reasons, tags:m.tags, guideBlocks });
  }

  return results.sort((a,b)=>b.score-a.score).slice(0,8);
}

function ChampButton({champ, selected, disabled, onClick}){
  const name = champ.name;
  const img = champ.image;
  return <button disabled={disabled} onClick={onClick}
    className={cx("rounded-xl border p-1.5 text-[11px] transition active:scale-95 disabled:cursor-not-allowed sm:rounded-2xl sm:p-2 sm:text-sm",
    disabled ? "border-red-500/40 bg-red-950/30 text-red-200 opacity-60" :
    selected ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-slate-700 bg-slate-900 text-slate-200")}>
    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-800 font-black sm:h-11 sm:w-11">
      {img ? <img src={img} alt={name} className="h-full w-full object-cover"/> : name[0]}
    </div>
    <div className={disabled ? "line-through" : ""}>{name}</div>
  </button>
}

function SelectModal({title, champions, selected, blocked, onSelect, onClose, multi=false, currentPool=[]}){
  const [q,setQ]=useState("");
  const list=champions.filter(c=>championMatchesQuery(c, q));
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2">
    <div className="flex h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-950 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-white">{title}</h2><button onClick={onClose} className="rounded-xl bg-slate-800 px-3 py-1 text-slate-200">닫기</button></div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2"><Search className="h-4 w-4 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="챔피언 검색 (예: ㄱㄹ, ㄹㅇㄴ)" className="w-full bg-transparent text-white outline-none"/></div>
        <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">{multi ? "내 챔피언 풀은 여러 개 선택 가능" : "빨간색은 밴/이미 선택되어 선택 불가"}</p>
      </div>
      <div className="grid flex-1 grid-cols-5 gap-1.5 overflow-y-scroll overscroll-contain p-2 sm:grid-cols-7 sm:gap-2 sm:p-4 md:grid-cols-9">
        {list.map(c=><ChampButton key={c.id} champ={c} selected={selected===c.name || currentPool.includes(c.name)} disabled={!multi && blocked.has(c.name) && selected!==c.name} onClick={()=>onSelect(c.name)}/>)}
      </div>
    </div>
  </div>
}

function Slot({label,value,onClick,tone="blue"}){
  const colors = tone==="red" ? "border-red-500/40 bg-red-950/30" : tone==="ban" ? "border-amber-500/40 bg-amber-950/30" : "border-blue-500/40 bg-blue-950/30";
  return <button onClick={onClick} className={cx("min-h-[52px] rounded-xl border p-2 text-left sm:min-h-20 sm:rounded-2xl sm:p-3",colors)}>
    <div className="text-[11px] text-slate-400 sm:text-xs">{label}</div><div className="mt-1 truncate text-sm font-bold text-white sm:mt-2 sm:text-base">{value||"선택"}</div>
  </button>
}

function Draft({champions, champMap, onStartGame}){
  const [ally,setAlly]=useState(Array(5).fill(""));
  const [enemy,setEnemy]=useState(Array(5).fill(""));
  const [bans,setBans]=useState(Array(10).fill(""));
  const [pool,setPool]=useState(["말파이트","오른","케넨","퀸","피오라","그웬"]);
  const [modal,setModal]=useState(null);
  const [recs,setRecs]=useState([]);
  const [sel,setSel]=useState(null);

  const blocked = useMemo(()=>new Set([...ally,...enemy,...bans].filter(Boolean)),[ally,enemy,bans]);

  function open(type,index){setModal({type,index})}
  function choose(name){
    if(!modal) return;
    if(modal.type!=="pool" && blocked.has(name)) return;
    if(modal.type==="ally") setAlly(p=>p.map((v,i)=>i===modal.index?name:v));
    if(modal.type==="enemy") setEnemy(p=>p.map((v,i)=>i===modal.index?name:v));
    if(modal.type==="ban") setBans(p=>p.map((v,i)=>i===modal.index?name:v));
    if(modal.type==="pool") setPool(p=>p.includes(name)?p.filter(x=>x!==name):topMeta[name]?[...p,name]:p);
    if(modal.type!=="pool") setModal(null);
  }
  function run(){
    const r = recommend({ally,enemy,bans,pool,champMap});
    setRecs(r); setSel(r[0]||null);
  }

  return <div className="space-y-3 sm:space-y-5">
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-white"><ShieldBan className="h-5 w-5 text-amber-300"/><h2 className="text-base font-bold sm:text-lg">밴 선택</h2></div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">{bans.map((v,i)=><Slot key={i} label={`밴 ${i+1}`} value={v} tone="ban" onClick={()=>open("ban",i)}/>)}</div>
    </section>

    <section className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-blue-900/60 bg-slate-950 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2 text-white"><Users className="h-5 w-5 text-blue-300"/><h2 className="text-base font-bold sm:text-lg">우리편 선택</h2></div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">{ally.map((v,i)=><Slot key={i} label={roleLabels[i]} value={v} onClick={()=>open("ally",i)}/>)}</div>
      </div>
      <div className="rounded-2xl border border-red-900/60 bg-slate-950 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2 text-white"><Swords className="h-5 w-5 text-red-300"/><h2 className="text-base font-bold sm:text-lg">상대편 선택</h2></div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">{enemy.map((v,i)=><Slot key={i} label={roleLabels[i]} value={v} tone="red" onClick={()=>open("enemy",i)}/>)}</div>
        <p className="mt-3 text-[11px] text-slate-400 sm:text-xs">상대가 탑인지 확실하지 않아도 전체 조합과 탑 가능성 가중치로 계산함.</p>
      </div>
    </section>

    <section className="rounded-2xl border border-emerald-900/60 bg-slate-950 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2"><h2 className="font-bold text-white">내 탑 챔피언 풀</h2><button onClick={()=>open("pool",0)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">수정</button></div>
      <div className="flex flex-wrap gap-2">{pool.map(c=><span key={c} className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-100">{c}</span>)}</div>
      <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">추천 결과는 이 챔피언 풀 안에서 우선 계산함. 풀에 없는 챔피언은 추천하지 않음.</p>
    </section>

    <div className="flex flex-wrap gap-2">
      <button onClick={run} className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-bold text-white sm:rounded-2xl sm:px-5 sm:py-3 sm:text-base">조합 보고 챔피언 추천</button>
      <button onClick={()=>onStartGame({ally,enemy})} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white sm:rounded-2xl sm:px-5 sm:py-3 sm:text-base">인게임 화면으로</button>
    </div>

    {recs.length>0 && <section className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2 text-white"><Sparkles className="h-5 w-5 text-indigo-300"/><h2 className="text-base font-bold sm:text-lg">추천 결과</h2></div>
        <div className="space-y-2">{recs.map(r=><button key={r.pick} onClick={()=>setSel(r)} className={cx("w-full rounded-xl border p-3 text-left sm:rounded-2xl sm:p-4",sel?.pick===r.pick?"border-indigo-400 bg-indigo-500/15":"border-slate-800 bg-slate-900")}>
          <div className="flex items-center justify-between"><div className="text-base font-black text-white sm:text-xl">{r.pick}</div><div className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-indigo-200 sm:px-3 sm:text-sm">{r.score}점</div></div>
          <div className="mt-2 flex flex-wrap gap-1">{r.tags.map(t=><span key={t} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{t}</span>)}</div>
          <ul className="mt-2 space-y-1 text-xs text-slate-300 sm:text-sm">{r.reasons.slice(0,3).map((x,i)=><li key={i}>- {x}</li>)}</ul>
        </button>)}</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
        <div className="mb-2 flex items-center gap-2 text-white"><Info className="h-5 w-5 text-slate-300"/><h2 className="text-base font-bold sm:text-lg">추천 이유 / 상대법</h2></div>
        {sel ? <div className="space-y-3">
          <div className="rounded-xl bg-slate-900 p-2 sm:rounded-2xl sm:p-3"><div className="font-bold text-white">{sel.pick}</div><ul className="mt-2 space-y-1 text-xs text-slate-300 sm:text-sm">{sel.reasons.map((x,i)=><li key={i}>- {x}</li>)}</ul></div>
          {sel.guideBlocks.length ? sel.guideBlocks.map(g=><div key={g.enemy} className="rounded-xl bg-slate-900 p-2 sm:rounded-2xl sm:p-3"><div className="font-bold text-red-200">{g.enemy} 상대법</div><ol className="mt-2 space-y-1 text-xs text-slate-200 sm:text-sm">{g.guide.map((x,i)=><li key={i}>{i+1}. {x}</li>)}</ol></div>) : <p className="rounded-xl bg-slate-900 p-2 sm:rounded-2xl sm:p-3 text-[11px] text-slate-400 sm:text-xs sm:text-sm">직접 카운터 상대법 데이터는 아직 없지만, 조합 점수 기준으로 추천된 픽임.</p>}
        </div> : <p className="text-slate-400">추천 챔피언을 누르면 이유가 표시됨.</p>}
      </div>
    </section>}

    {modal && <SelectModal title={modal.type==="ally"?"우리편 챔피언 선택":modal.type==="enemy"?"상대편 챔피언 선택":modal.type==="ban"?"밴 챔피언 선택":"내 탑 챔피언 풀 선택"} champions={champions} selected="" blocked={blocked} onSelect={choose} onClose={()=>setModal(null)} multi={modal.type==="pool"} currentPool={pool}/>}
  </div>
}

function InGame({draft,onBack}){
  const [timers,setTimers]=useState({});
  useEffect(()=>{const id=setInterval(()=>setTimers(p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Math.max(0,v-1)]))),1000);return()=>clearInterval(id)},[]);
  const start=(i,s=300)=>setTimers(p=>({...p,[i]:s}));
  const reset=i=>setTimers(p=>({...p,[i]:0}));
  const enemies=draft.enemy.map((v,i)=>v||`상대 ${roleLabels[i]}`);
  return <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">인게임 점멸 타이머</h2><button onClick={onBack} className="rounded-2xl bg-slate-800 px-4 py-2 text-slate-200">픽창으로</button></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">{enemies.map((n,i)=>{const left=timers[i]||0;return <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4"><div className="text-[11px] text-slate-400 sm:text-xs">상대 {roleLabels[i]}</div><div className="mt-1 truncate text-base font-bold text-white sm:text-xl">{n}</div><div className={cx("mt-3 rounded-xl p-3 text-center text-2xl font-black sm:mt-4 sm:rounded-2xl sm:p-4 sm:text-3xl",left?"bg-red-500/20 text-red-200":"bg-emerald-500/15 text-emerald-200")}>{left?formatTime(left):"READY"}</div><button onClick={()=>start(i,300)} className="mt-2 w-full rounded-xl bg-red-500 px-3 py-2 text-sm font-bold text-white sm:mt-3 sm:rounded-2xl sm:py-3 sm:text-base">점멸 사용</button><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>start(i,255)} className="rounded-xl bg-slate-800 px-2 py-2 text-xs text-slate-200">우통 4:15</button><button onClick={()=>reset(i)} className="rounded-xl bg-slate-800 px-2 py-2 text-xs text-slate-200"><RotateCcw className="mx-auto h-4 w-4"/></button></div></div>})}</div>
  </div>
}

export default function App(){
  const [screen,setScreen]=useState("draft");
  const [draft,setDraft]=useState({ally:Array(5).fill(""),enemy:Array(5).fill("")});
  const [champions,setChampions]=useState(fallbackChampions);

  useEffect(()=>{
    async function load(){
      try{
        const versions = await fetch("https://ddragon.leagueoflegends.com/api/versions.json").then(r=>r.json());
        const version = versions[0];
        const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`).then(r=>r.json());
        const list = Object.values(data.data).map(c=>({
          id:c.id,
          name:c.name,
          tags:c.tags || [],
          image:`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`
        })).sort((a,b)=>a.name.localeCompare(b.name,"ko"));
        setChampions(list);
      }catch(e){
        setChampions(fallbackChampions.sort((a,b)=>a.name.localeCompare(b.name,"ko")));
      }
    }
    load();
  },[]);

  const champMap = useMemo(()=>Object.fromEntries(champions.map(c=>[c.name,c])),[champions]);

  return <main className="min-h-screen bg-slate-950 p-2 text-slate-100 sm:p-4"><div className="mx-auto max-w-6xl">
    <header className="mb-3 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 sm:p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white sm:h-12 sm:w-12 sm:rounded-2xl"><TimerReset/></div><div><h1 className="text-lg font-black text-white sm:text-2xl">탑 밴픽 조합 추천 & 점멸 타이머</h1><p className="text-[11px] text-slate-400 sm:text-xs sm:text-sm">전체 챔피언 밴픽 입력 → 조합/카운터/챔피언 풀 기준 탑 추천</p></div></div></header>
    {screen==="draft"?<Draft champions={champions} champMap={champMap} onStartGame={(d)=>{setDraft(d);setScreen("ingame")}}/>:<InGame draft={draft} onBack={()=>setScreen("draft")}/>}
  </div></main>
}
