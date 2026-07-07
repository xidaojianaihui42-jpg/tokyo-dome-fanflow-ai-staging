import React, { useMemo } from "react";
import mapSvgRaw from "../../imports/map-full.svg?raw";

export type PrefectureModalData = {
  artist: string;
  color: string;
  prefectureCount: number;
  kanto: number;
  outsideKanto: number;
  top10: { pref: string; val: number }[];
};

const PREFECTURE_NAME_TO_CODE: Record<string, string> = {
  北海道: "1",
  青森県: "2",
  岩手県: "3",
  宮城県: "4",
  秋田県: "5",
  山形県: "6",
  福島県: "7",
  茨城県: "8",
  栃木県: "9",
  群馬県: "10",
  埼玉県: "11",
  千葉県: "12",
  東京都: "13",
  神奈川県: "14",
  新潟県: "15",
  富山県: "16",
  石川県: "17",
  福井県: "18",
  山梨県: "19",
  長野県: "20",
  岐阜県: "21",
  静岡県: "22",
  愛知県: "23",
  三重県: "24",
  滋賀県: "25",
  京都府: "26",
  大阪府: "27",
  兵庫県: "28",
  奈良県: "29",
  和歌山県: "30",
  鳥取県: "31",
  島根県: "32",
  岡山県: "33",
  広島県: "34",
  山口県: "35",
  徳島県: "36",
  香川県: "37",
  愛媛県: "38",
  高知県: "39",
  福岡県: "40",
  佐賀県: "41",
  長崎県: "42",
  熊本県: "43",
  大分県: "44",
  宮崎県: "45",
  鹿児島県: "46",
  沖縄県: "47",
};

const DEFAULT_FILL = "rgba(255,255,255,0.12)";
const DEFAULT_STROKE = "rgba(255,255,255,0.22)";

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function colorizeMapSvg(
  svg: string,
  top10: { pref: string; val: number }[],
  color: string
) {
  const highlightByCode = new Map<string, number>();
  top10.forEach((item, index) => {
    const code = PREFECTURE_NAME_TO_CODE[item.pref];
    if (code) highlightByCode.set(code, index);
  });

  let result = svg;
  for (let code = 1; code <= 47; code += 1) {
    const codeStr = String(code);
    const rank = highlightByCode.get(codeStr);
    const fill =
      rank === undefined
        ? DEFAULT_FILL
        : hexToRgba(color, rank < 3 ? 0.95 : 0.72);
    const stroke = DEFAULT_STROKE;

    result = result
      .replace(
        new RegExp(`(data-code="${codeStr}"[^>]*?)fill="[^"]*"`, "i"),
        `$1fill="${fill}"`
      )
      .replace(
        new RegExp(`(data-code="${codeStr}"[^>]*?)stroke="[^"]*"`, "i"),
        `$1stroke="${stroke}"`
      );
  }

  return result;
}

function PrefectureModalMap({
  top10,
  color,
}: {
  top10: { pref: string; val: number }[];
  color: string;
}) {
  const coloredSvg = useMemo(
    () => colorizeMapSvg(mapSvgRaw, top10, color),
    [top10, color]
  );

  return (
    <div
      className="prefecture-modal-map relative w-full rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/10 p-2"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div
        className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_polygon]:transition-colors [&_g.prefecture]:transition-colors"
        dangerouslySetInnerHTML={{ __html: coloredSvg }}
      />
    </div>
  );
}

function PrefectureRanking({
  top10,
  color,
}: {
  top10: { pref: string; val: number }[];
  color: string;
}) {
  const maxVal = top10[0]?.val ?? 1;

  return (
    <div className="prefecture-ranking space-y-2">
      <h4 className="text-xs text-white/55 font-mono tracking-wider mb-3">
        来場者居住地 TOP10
      </h4>
      {top10.map((item, index) => (
        <div key={item.pref} className="flex items-center gap-2 text-xs">
          <span className="w-4 text-right font-mono text-white/45">{index + 1}</span>
          <span className="w-[4.5rem] shrink-0 text-white/85 truncate">{item.pref}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.val / maxVal) * 100}%`,
                backgroundColor: color,
                boxShadow: index < 3 ? `0 0 8px ${color}80` : undefined,
                opacity: index < 3 ? 1 : 0.82,
              }}
            />
          </div>
          <span className="w-10 text-right font-mono text-white/75 tabular-nums">
            {item.val}%
          </span>
        </div>
      ))}
    </div>
  );
}

function MetroRatioBar({
  kanto,
  outsideKanto,
  color,
}: {
  kanto: number;
  outsideKanto: number;
  color: string;
}) {
  return (
    <div className="metro-ratio-bar mt-6 space-y-3">
      <h4 className="text-xs text-white/55 font-mono tracking-wider">首都圏比率</h4>
      <div className="h-3 rounded-full overflow-hidden flex bg-white/10">
        <div
          className="h-full"
          style={{ width: `${kanto}%`, backgroundColor: color }}
        />
        <div className="h-full flex-1 bg-white/20" />
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span style={{ color }}>首都圏 {kanto}%</span>
        <span className="text-white/65">首都圏外 {outsideKanto}%</span>
      </div>
    </div>
  );
}

export function PrefectureDetailModal({
  data,
  onClose,
}: {
  data: PrefectureModalData;
  onClose: () => void;
}) {
  return (
    <div
      className="prefecture-detail-modal fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[920px] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0d0d12]/95 shadow-2xl p-5 md:p-7"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefecture-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/55 hover:text-white text-sm font-mono px-2 py-1 rounded border border-white/15 hover:border-white/30 transition-colors"
        >
          閉じる
        </button>

        <header className="mb-5 pr-16">
          <h3
            id="prefecture-modal-title"
            className="text-xl md:text-2xl font-bold tracking-wider mb-1"
            style={{ color: data.color }}
          >
            {data.artist}
          </h3>
          <p className="text-sm text-white/70 font-mono">
            来訪都道府県 {data.prefectureCount} / 47都道府県
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="md:w-[52%] shrink-0">
            <PrefectureModalMap top10={data.top10} color={data.color} />
            <p className="mt-2 text-[10px] md:text-[11px] text-white/45 leading-relaxed">
              ※地図上では来場者居住地TOP10をハイライトしています
            </p>
          </div>

          <div className="md:flex-1 min-w-0">
            <PrefectureRanking top10={data.top10} color={data.color} />
            <MetroRatioBar
              kanto={data.kanto}
              outsideKanto={data.outsideKanto}
              color={data.color}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PREFECTURE_MODAL_DATA = {
  FZ: {
    artist: "FRUITS ZIPPER",
    color: "#00D1FF",
    prefectureCount: 27,
    kanto: 64.2,
    outsideKanto: 35.8,
    top10: [
      { pref: "東京都", val: 27.9 },
      { pref: "埼玉県", val: 12.0 },
      { pref: "千葉県", val: 11.1 },
      { pref: "神奈川県", val: 11.0 },
      { pref: "愛知県", val: 5.7 },
      { pref: "兵庫県", val: 3.7 },
      { pref: "大阪府", val: 3.2 },
      { pref: "静岡県", val: 2.3 },
      { pref: "茨城県", val: 2.2 },
      { pref: "三重県", val: 2.1 },
    ],
  },
  RZ: {
    artist: "RIIZE",
    color: "#FF4EDB",
    prefectureCount: 25,
    kanto: 68.1,
    outsideKanto: 31.9,
    top10: [
      { pref: "東京都", val: 42.2 },
      { pref: "神奈川県", val: 14.7 },
      { pref: "兵庫県", val: 6.6 },
      { pref: "埼玉県", val: 5.3 },
      { pref: "千葉県", val: 5.9 },
      { pref: "大阪府", val: 4.4 },
      { pref: "宮城県", val: 2.6 },
      { pref: "福岡県", val: 2.0 },
      { pref: "茨城県", val: 2.0 },
      { pref: "愛知県", val: 1.5 },
    ],
  },
  VD: {
    artist: "Vaundy",
    color: "#A6FF4D",
    prefectureCount: 31,
    kanto: 84.6,
    outsideKanto: 15.4,
    top10: [
      { pref: "東京都", val: 41.0 },
      { pref: "神奈川県", val: 17.0 },
      { pref: "埼玉県", val: 11.1 },
      { pref: "千葉県", val: 9.9 },
      { pref: "茨城県", val: 6.0 },
      { pref: "愛知県", val: 3.0 },
      { pref: "静岡県", val: 2.6 },
      { pref: "栃木県", val: 1.8 },
      { pref: "群馬県", val: 1.4 },
      { pref: "新潟県", val: 1.4 },
    ],
  },
} as const satisfies Record<string, PrefectureModalData>;

export type PrefectureModalArtistKey = keyof typeof PREFECTURE_MODAL_DATA;
