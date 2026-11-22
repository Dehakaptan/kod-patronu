'use strict';
/* =====================================================================
   Bytetown – sayfa illüstrasyonları ve çalışan avatarları
   Kartlardaki emoji yerine elle çizilmiş renkli SVG'ler kullanılır.
   ===================================================================== */
const A = (inner) => `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
const B1 = '#2f54eb', B2 = '#4f74ff', B3 = '#7f9cff', B4 = '#b7c8ff', SKY = '#7cc9ff', SKY2 = '#1e97f6', PALE = '#dcf0ff';
const OR = '#f7735a', YL = '#fbbf24', PK = '#f472b6', GR = '#34d399', DK = '#1b1830', WH = '#ffffff';

const ART = {
  ev: A(`<path d="M7 22 24 9l17 13v18.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill="#ffe2c4"/><path d="M4 23.5 24 7.5l20 16" stroke="${OR}" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="12" y="26" width="24" height="16.5" rx="1.6" fill="${WH}" stroke="#c9d3e6" stroke-width="1.2"/><path d="M12 30.2h24M12 34.4h24M12 38.6h24" stroke="#c9d3e6" stroke-width="1.4"/>
    <rect x="15" y="27.4" width="4.2" height="2" rx=".6" fill="${SKY}"/><rect x="21.9" y="27.4" width="4.2" height="2" rx=".6" fill="${SKY}"/><rect x="28.8" y="27.4" width="4.2" height="2" rx=".6" fill="${SKY}"/>
    <rect x="21" y="14.5" width="6" height="6" rx="1.2" fill="${SKY}" stroke="${WH}" stroke-width="1.2"/>`),
  studyo: A(`<path d="M41 41V15" stroke="#5d5a72" stroke-width="2.2"/><path d="M35.5 15.5h11l-2.6-7h-5.8z" fill="${YL}"/><ellipse cx="41" cy="41.5" rx="4" ry="1.2" fill="#5d5a72"/>
    <rect x="9" y="17" width="24" height="12" rx="4.5" fill="${B4}"/><rect x="6" y="25" width="30" height="11" rx="4" fill="${B3}"/>
    <rect x="3.5" y="22" width="7" height="14" rx="3.5" fill="${B2}"/><rect x="31.5" y="22" width="7" height="14" rx="3.5" fill="${B2}"/>
    <rect x="11" y="21" width="9" height="6" rx="2.5" fill="${PK}" opacity=".85"/><path d="M8.5 36v4.5M33.5 36v4.5" stroke="${B1}" stroke-width="2.6" stroke-linecap="round"/>`),
  ofis: A(`<rect x="9" y="7" width="30" height="35" rx="3.5" fill="${SKY}"/><rect x="9" y="7" width="30" height="6" rx="3" fill="${B1}"/>
    <g fill="${WH}"><rect x="13" y="16" width="5.5" height="4.5" rx="1"/><rect x="21.3" y="16" width="5.5" height="4.5" rx="1"/><rect x="29.5" y="16" width="5.5" height="4.5" rx="1"/>
    <rect x="13" y="23.5" width="5.5" height="4.5" rx="1"/><rect x="21.3" y="23.5" width="5.5" height="4.5" rx="1"/><rect x="29.5" y="23.5" width="5.5" height="4.5" rx="1"/></g>
    <rect x="19.5" y="32" width="9" height="10" rx="1.8" fill="${B1}"/><circle cx="26.3" cy="37.5" r=".9" fill="${YL}"/><rect x="5" y="41" width="38" height="2.5" rx="1.2" fill="#9aa6c4"/>`),
  buyuk: A(`<rect x="4" y="16" width="18" height="26" rx="2.5" fill="${B4}"/><rect x="24" y="6" width="20" height="36" rx="3" fill="${SKY}"/><rect x="24" y="6" width="20" height="5" rx="2.5" fill="${B1}"/>
    <g fill="${WH}"><rect x="7" y="20" width="4.5" height="3.5" rx=".8"/><rect x="14.5" y="20" width="4.5" height="3.5" rx=".8"/><rect x="7" y="26" width="4.5" height="3.5" rx=".8"/><rect x="14.5" y="26" width="4.5" height="3.5" rx=".8"/><rect x="7" y="32" width="4.5" height="3.5" rx=".8"/><rect x="14.5" y="32" width="4.5" height="3.5" rx=".8"/>
    <rect x="27.5" y="14" width="5" height="4" rx=".8"/><rect x="35.5" y="14" width="5" height="4" rx=".8"/><rect x="27.5" y="20.5" width="5" height="4" rx=".8"/><rect x="35.5" y="20.5" width="5" height="4" rx=".8"/><rect x="27.5" y="27" width="5" height="4" rx=".8"/><rect x="35.5" y="27" width="5" height="4" rx=".8"/></g>
    <rect x="30.5" y="34" width="7" height="8" rx="1.5" fill="${B1}"/><rect x="2" y="41" width="44" height="2.5" rx="1.2" fill="#9aa6c4"/>`),
  gokdelen: A(`<circle cx="38" cy="10" r="5" fill="${YL}"/><circle cx="40" cy="8.5" r="4.4" fill="#1d2a5e"/>
    <path d="M24 3v5" stroke="#9aa6c4" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="3" r="1.6" fill="${OR}"/>
    <path d="M16 44V12l8-4 8 4v32z" fill="${B2}"/><path d="M24 8l8 4v32h-8z" fill="${B1}"/>
    <g fill="${YL}" opacity=".95"><rect x="18.5" y="15" width="3" height="2.4" rx=".5"/><rect x="26.5" y="18" width="3" height="2.4" rx=".5"/><rect x="18.5" y="22" width="3" height="2.4" rx=".5"/><rect x="26.5" y="27" width="3" height="2.4" rx=".5"/><rect x="18.5" y="31" width="3" height="2.4" rx=".5"/><rect x="26.5" y="35" width="3" height="2.4" rx=".5"/></g>
    <rect x="6" y="28" width="9" height="16" rx="1.5" fill="${B4}"/><rect x="33" y="24" width="9" height="20" rx="1.5" fill="${B3}"/>`),
  kilit: A(`<path d="M15.5 22v-6a8.5 8.5 0 0 1 17 0v6" stroke="#8d97b5" stroke-width="4.6" fill="none"/><rect x="10" y="21" width="28" height="21" rx="5.5" fill="#ffb75a"/>
    <rect x="10" y="21" width="28" height="5" rx="3" fill="#ffd08f"/><circle cx="24" cy="30" r="3.2" fill="#7d3b00"/><rect x="22.5" y="30.5" width="3" height="6.5" rx="1.5" fill="#7d3b00"/>`),
  web: A(`<rect x="5" y="8" width="38" height="31" rx="4.5" fill="${WH}" stroke="${B1}" stroke-width="2.6"/><path d="M5 15.5h38" stroke="${B1}" stroke-width="2.6"/>
    <circle cx="10" cy="11.8" r="1.4" fill="${OR}"/><circle cx="14.4" cy="11.8" r="1.4" fill="${YL}"/><circle cx="18.8" cy="11.8" r="1.4" fill="${GR}"/>
    <circle cx="24" cy="27.5" r="8.4" fill="${SKY}"/><path d="M15.6 27.5h16.8M24 19.1c-3.4 3.6-3.4 13.2 0 16.8M24 19.1c3.4 3.6 3.4 13.2 0 16.8" stroke="${WH}" stroke-width="1.6" fill="none"/>`),
  mobil: A(`<rect x="13" y="4" width="22" height="40" rx="5.5" fill="${B1}"/><rect x="15.6" y="9" width="16.8" height="28" rx="2.4" fill="${PALE}"/>
    <rect x="18" y="12" width="5" height="5" rx="1.4" fill="${OR}"/><rect x="25" y="12" width="5" height="5" rx="1.4" fill="${SKY2}"/><rect x="18" y="19" width="5" height="5" rx="1.4" fill="${YL}"/><rect x="25" y="19" width="5" height="5" rx="1.4" fill="${PK}"/><rect x="18" y="26" width="12" height="3" rx="1.5" fill="${B3}"/>
    <circle cx="24" cy="40.5" r="1.7" fill="${WH}"/><rect x="21" y="6" width="6" height="1.4" rx=".7" fill="${B4}"/>`),
  oyun: A(`<path d="M13 15h22a9 9 0 0 1 8.7 11.4l-2.2 8a4.8 4.8 0 0 1-8.2 2L29.5 32h-11l-3.8 4.4a4.8 4.8 0 0 1-8.2-2l-2.2-8A9 9 0 0 1 13 15z" fill="${B2}"/>
    <path d="M13 15h22a9 9 0 0 1 6.7 3H6.3A9 9 0 0 1 13 15z" fill="${B3}"/>
    <path d="M14 21.5v7M10.5 25h7" stroke="${WH}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="22.5" r="2.3" fill="${OR}"/><circle cx="36.5" cy="27" r="2.3" fill="${YL}"/><circle cx="27.5" cy="27" r="2.3" fill="${GR}"/><circle cx="32" cy="31.2" r="2.3" fill="${PK}"/>`),
  ai: A(`<path d="M24 5v6" stroke="#9aa6c4" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="5" r="2.6" fill="${OR}"/>
    <rect x="9" y="11" width="30" height="25" rx="8" fill="${B4}"/><rect x="12.5" y="15" width="23" height="15" rx="5.5" fill="${DK}"/>
    <circle cx="19" cy="22.5" r="3" fill="${SKY}"/><circle cx="29" cy="22.5" r="3" fill="${SKY}"/><circle cx="19.8" cy="21.6" r="1" fill="${WH}"/><circle cx="29.8" cy="21.6" r="1" fill="${WH}"/>
    <path d="M20 27q4 2.2 8 0" stroke="${SKY}" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="5.5" y="19" width="3.5" height="9" rx="1.7" fill="${B3}"/><rect x="39" y="19" width="3.5" height="9" rx="1.7" fill="${B3}"/>
    <rect x="16" y="36" width="16" height="7" rx="3" fill="${B3}"/>`),
  klavye: A(`<rect x="3" y="14" width="42" height="22" rx="4.5" fill="${B1}"/><rect x="3" y="14" width="42" height="4" rx="2" fill="${B2}"/>
    <g fill="${WH}"><rect x="7" y="20" width="4.5" height="4" rx="1"/><rect x="13" y="20" width="4.5" height="4" rx="1"/><rect x="19" y="20" width="4.5" height="4" rx="1"/><rect x="25" y="20" width="4.5" height="4" rx="1"/><rect x="31" y="20" width="4.5" height="4" rx="1"/><rect x="37" y="20" width="4.5" height="4" rx="1"/>
    <rect x="9" y="25.5" width="4.5" height="4" rx="1"/><rect x="15" y="25.5" width="4.5" height="4" rx="1"/><rect x="21" y="25.5" width="4.5" height="4" rx="1"/><rect x="27" y="25.5" width="4.5" height="4" rx="1"/><rect x="33" y="25.5" width="4.5" height="4" rx="1"/></g>
    <rect x="14" y="31" width="20" height="3" rx="1.5" fill="${OR}"/>`),
  kitap: A(`<rect x="7" y="33" width="34" height="7" rx="2" fill="${OR}"/><rect x="9" y="25" width="30" height="8" rx="2" fill="${SKY2}"/><rect x="6" y="17" width="33" height="8" rx="2" fill="${YL}"/>
    <path d="M10 36.5h28M12 29h24M9 21h27" stroke="${WH}" stroke-width="1.4" opacity=".8"/>
    <path d="M30 6l8 2.5-4 10-8-2.5z" fill="${B2}"/><path d="M30 6l8 2.5-1 2.4-8-2.5z" fill="${B4}"/>`),
  kahve: A(`<path d="M17 6c-2 3 2 4 0 7M24 5c-2 3 2 4 0 7M31 6c-2 3 2 4 0 7" stroke="#b7c8ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M9 17h28v13a10 10 0 0 1-10 10H19A10 10 0 0 1 9 30z" fill="${WH}" stroke="${B1}" stroke-width="2.4"/>
    <path d="M37 21h2.5a4.5 4.5 0 0 1 0 9H36" stroke="${B1}" stroke-width="2.6" fill="none"/>
    <path d="M11 20h24" stroke="#8a5530" stroke-width="3" stroke-linecap="round"/><rect x="6" y="41" width="34" height="3" rx="1.5" fill="${B4}"/>`),
  sandalye: A(`<rect x="13" y="5" width="22" height="20" rx="7" fill="${B1}"/><rect x="15.5" y="7.5" width="17" height="15" rx="5.5" fill="${B2}"/>
    <rect x="10" y="25" width="28" height="7" rx="3.5" fill="${B1}"/><rect x="22.5" y="32" width="3" height="6" fill="#5d5a72"/>
    <path d="M11 41h26M15 44l9-5 9 5" stroke="#3d3a52" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M8 24v-6M40 24v-6" stroke="#3d3a52" stroke-width="2.6" stroke-linecap="round"/>`),
  tup: A(`<path d="M18 5h12M20 5v13L9.5 37a4 4 0 0 0 3.5 6h22a4 4 0 0 0 3.5-6L28 18V5" stroke="${B1}" stroke-width="2.6" fill="${WH}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M13.5 30h21l4 7a2.6 2.6 0 0 1-2.3 4H11.8a2.6 2.6 0 0 1-2.3-4z" fill="${GR}"/><circle cx="20" cy="35" r="2" fill="${WH}" opacity=".8"/><circle cx="27" cy="33" r="1.4" fill="${WH}" opacity=".8"/><circle cx="24.5" cy="25" r="1.6" fill="${GR}"/>`),
  monitor: A(`<rect x="4" y="7" width="40" height="27" rx="3.5" fill="${DK}"/><rect x="7" y="10" width="34" height="21" rx="2" fill="#1d2a5e"/>
    <path d="M10 14h12M12 18h16M12 22h9M10 26h14" stroke-width="2.2" stroke-linecap="round" stroke="${SKY}"/><path d="M26 22h8" stroke="${PK}" stroke-width="2.2" stroke-linecap="round"/><path d="M30 14h6" stroke="${YL}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M20 34h8l1.5 6h-11z" fill="#5d5a72"/><rect x="14" y="40" width="20" height="3" rx="1.5" fill="#3d3a52"/>`),
  bulut: A(`<path d="M14 30a9 9 0 0 1 1.5-17.9A11 11 0 0 1 36.5 15 8 8 0 0 1 35 30z" fill="${SKY}"/><path d="M14 30a9 9 0 0 1-2-17.8" stroke="${WH}" stroke-width="2" fill="none" opacity=".6"/>
    <rect x="13" y="30" width="22" height="6" rx="2" fill="${B1}"/><rect x="13" y="37" width="22" height="6" rx="2" fill="${B2}"/><circle cx="17" cy="33" r="1.2" fill="${GR}"/><circle cx="17" cy="40" r="1.2" fill="${YL}"/><path d="M21 33h10M21 40h10" stroke="${B4}" stroke-width="1.6"/>`),
  megafon: A(`<path d="M8 19h7l17-10v30L15 29H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" fill="${OR}"/><path d="M15 19v10" stroke="#e05a44" stroke-width="2"/>
    <rect x="10" y="29" width="6" height="11" rx="2.4" fill="${B1}"/><path d="M37 17q4 7 0 14M41 13q7 11 0 22" stroke="${B2}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`),
  mikroskop: A(`<rect x="8" y="40" width="32" height="4" rx="2" fill="${B1}"/><path d="M14 40a12 12 0 0 1 22-7" stroke="${B2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <rect x="19" y="4" width="8" height="20" rx="3" transform="rotate(-25 23 14)" fill="${SKY2}"/><rect x="16" y="22" width="16" height="4" rx="2" fill="#5d5a72"/><circle cx="24" cy="31" r="3" fill="${YL}"/>`),
  dambil: A(`<rect x="13" y="21.5" width="22" height="5" rx="2.5" fill="#9aa6c4"/><rect x="6" y="12" width="7" height="24" rx="3" fill="${B1}"/><rect x="35" y="12" width="7" height="24" rx="3" fill="${B1}"/>
    <rect x="2.5" y="16" width="4.5" height="16" rx="2.2" fill="${B2}"/><rect x="41" y="16" width="4.5" height="16" rx="2.2" fill="${B2}"/>`),
  dondurma: A(`<path d="M15 24h18L24 45z" fill="#e2b26b"/><path d="M17.5 28l11 6M17.5 34l7 4M30.5 28l-11 6" stroke="#b9853f" stroke-width="1.4"/>
    <circle cx="18" cy="20" r="7" fill="${PK}"/><circle cx="30" cy="20" r="7" fill="#fde68a"/><circle cx="24" cy="12" r="7.5" fill="${SKY}"/>
    <circle cx="24" cy="5" r="2.6" fill="${OR}"/><path d="M20 10.5l1.5 1M27 14l1.4-.8M16 18l1 1.6" stroke="${WH}" stroke-width="1.6" stroke-linecap="round"/>`),
  joystick: A(`<rect x="7" y="28" width="34" height="14" rx="4.5" fill="${B1}"/><rect x="7" y="28" width="34" height="4" rx="2" fill="${B2}"/>
    <rect x="17" y="13" width="3.4" height="16" rx="1.7" fill="#5d5a72"/><circle cx="18.7" cy="11" r="6" fill="${OR}"/><circle cx="16.8" cy="9" r="1.6" fill="${WH}" opacity=".7"/>
    <circle cx="30" cy="33.5" r="2.6" fill="${YL}"/><circle cx="36" cy="33.5" r="2.6" fill="${PK}"/>`),
  nota: A(`<path d="M18 33V11l22-5v22" stroke="${B1}" stroke-width="3.4" fill="none" stroke-linejoin="round"/><path d="M18 15l22-5" stroke="${B1}" stroke-width="5"/>
    <ellipse cx="13" cy="34" rx="6" ry="4.6" fill="${PK}"/><ellipse cx="35" cy="29" rx="6" ry="4.6" fill="${SKY2}"/>`),
  palet: A(`<path d="M24 5C12 5 4 13.5 4 24s8.5 19 18 19c3 0 4.5-2 4.5-4 0-3-2.5-3.5-2.5-6 0-2 1.6-3.4 3.6-3.4H34c6 0 10-4.5 10-10C44 12 35 5 24 5z" fill="#ffe2c4"/>
    <circle cx="14" cy="22" r="3.4" fill="${OR}"/><circle cx="19" cy="13" r="3.4" fill="${YL}"/><circle cx="29" cy="12" r="3.4" fill="${GR}"/><circle cx="36" cy="19" r="3.4" fill="${SKY2}"/><circle cx="15" cy="32" r="3.4" fill="${PK}"/>`),
  ay: A(`<rect x="3" y="3" width="42" height="42" rx="10" fill="#1d2a5e"/><path d="M30 10a14 14 0 1 0 8 23A12 12 0 0 1 30 10z" fill="${YL}"/>
    <path d="M12 12l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="${WH}"/><circle cx="17" cy="36" r="1.2" fill="${WH}"/><circle cx="38" cy="12" r="1" fill="${WH}"/>`),
  kalkan: A(`<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" fill="${B1}"/><path d="M24 4l16 6v12c0 10-7 18-16 22z" fill="${B2}"/>
    <path d="M19 23v-3a5 5 0 0 1 10 0v3" stroke="${WH}" stroke-width="2.6" fill="none"/><rect x="16.5" y="22.5" width="15" height="11" rx="3" fill="${YL}"/><circle cx="24" cy="27.5" r="1.8" fill="#7d3b00"/>`),
  dunya: A(`<circle cx="24" cy="24" r="19" fill="${SKY}"/><path d="M13 12c3 2 5 1 7 4s-1 6 2 8 6 0 6 4-3 5-2 9M33 9c-2 3 0 5 3 6s5 4 4 8M7 28c3-1 6 1 7 4" stroke="${GR}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="${B1}" stroke-width="2.4"/><path d="M14 9q5 3 3 8" stroke="${WH}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`),
  kart: A(`<rect x="4" y="11" width="40" height="26" rx="4.5" fill="${B1}"/><rect x="4" y="16" width="40" height="5" fill="${DK}"/>
    <rect x="9" y="25" width="8" height="6" rx="1.5" fill="${YL}"/><path d="M21 28h8M31 28h6" stroke="${B4}" stroke-width="2.2" stroke-linecap="round"/><circle cx="35" cy="33" r="3" fill="${OR}" opacity=".9"/><circle cx="39" cy="33" r="3" fill="${YL}" opacity=".9"/>`),
  beyin: A(`<path d="M24 9c-2-3-7-3-9 0-4 0-6 3-5.5 6.5C6 17 5.5 22 8 24.5 6 28 8 32.5 12 33c1 4 6 6 9 3.5 1 1.4 2 2 3 2V9z" fill="${PK}"/>
    <path d="M24 9c2-3 7-3 9 0 4 0 6 3 5.5 6.5 3.5 1.5 4 6.5 1.5 9 2 3.5 0 8-4 8.5-1 4-6 6-9 3.5-1 1.4-2 2-3 2V9z" fill="#f9a8d4"/>
    <path d="M24 10v29M15 15q4 2 3 6M12 26q4-1 6 2M33 15q-4 2-3 6M36 26q-4-1-6 2" stroke="#be185d" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
  hatch: A(`<path d="M6 30v-5l5-9h17l8 7h5a3 3 0 0 1 3 3v4z" fill="${OR}"/><path d="M13 17.5h6.5v6H9.5zM22 17.5h5.5l6 6H22z" fill="${PALE}"/>
    <rect x="4" y="29" width="40" height="5" rx="2.5" fill="#e05a44"/><circle cx="14" cy="34" r="5" fill="${DK}"/><circle cx="14" cy="34" r="2" fill="#9aa6c4"/><circle cx="35" cy="34" r="5" fill="${DK}"/><circle cx="35" cy="34" r="2" fill="#9aa6c4"/><rect x="41" y="27" width="3" height="2" rx="1" fill="${YL}"/>`),
  sedan: A(`<path d="M3 30v-4l7-2 6-7h15l6 7 6 1.5a3 3 0 0 1 2 3V30z" fill="${DK}"/><path d="M17.5 18.5h6v6h-11zM26 18.5h4.5l5 6H26z" fill="${SKY}"/>
    <rect x="2" y="28.5" width="44" height="5" rx="2.5" fill="#3d3a52"/><circle cx="12" cy="34" r="5" fill="#111"/><circle cx="12" cy="34" r="2" fill="#c9d3e6"/><circle cx="37" cy="34" r="5" fill="#111"/><circle cx="37" cy="34" r="2" fill="#c9d3e6"/><rect x="43" y="26.5" width="3" height="2" rx="1" fill="${YL}"/>`),
  suv: A(`<path d="M4 31V21l4-8h26l6 8h3a2 2 0 0 1 2 2v8z" fill="${WH}" stroke="#c9d3e6" stroke-width="1.2"/><path d="M10 14.5h9v7H7.5zM21.5 14.5h11l5 7h-16z" fill="${SKY}"/>
    <rect x="3" y="29" width="42" height="5" rx="2.5" fill="${B1}"/><circle cx="13" cy="34" r="5.4" fill="${DK}"/><circle cx="13" cy="34" r="2.2" fill="#c9d3e6"/><circle cx="36" cy="34" r="5.4" fill="${DK}"/><circle cx="36" cy="34" r="2.2" fill="#c9d3e6"/><path d="M22 25l3-4-1 3h3l-3 4 1-3z" fill="${GR}"/>`),
  spor: A(`<path d="M2 31v-3l9-3 9-6h11l9 6 6 1v5z" fill="#e11d48"/><path d="M21 20h9l6 5H17z" fill="${DK}"/>
    <path d="M2 28.5h44" stroke="${WH}" stroke-width="1.6" opacity=".6"/><rect x="1.5" y="30" width="45" height="4" rx="2" fill="#9f1239"/>
    <circle cx="12" cy="34" r="5" fill="#111"/><circle cx="12" cy="34" r="2.2" fill="${YL}"/><circle cx="37" cy="34" r="5" fill="#111"/><circle cx="37" cy="34" r="2.2" fill="${YL}"/>`),
  heli: A(`<path d="M6 10h32" stroke="#3d3a52" stroke-width="2.6" stroke-linecap="round"/><rect x="21" y="10" width="2.6" height="6" fill="#3d3a52"/>
    <path d="M10 26a12 10 0 0 1 12-10h6a10 10 0 0 1 0 20H16a6 6 0 0 1-6-6z" fill="${B1}"/><path d="M27 18a8 8 0 0 1 8 8h-8z" fill="${SKY}"/>
    <path d="M34 26h10l2-4" stroke="${B1}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 38h18M17 36v2M29 36v2" stroke="#3d3a52" stroke-width="2.4" stroke-linecap="round"/>`),
  laptop: A(`<rect x="8" y="9" width="32" height="22" rx="3" fill="${DK}"/><rect x="10.5" y="11.5" width="27" height="17" rx="1.5" fill="#1d2a5e"/>
    <path d="M18 16l-3.5 4 3.5 4M30 16l3.5 4-3.5 4M26 14.5l-4 11" stroke="${SKY}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 33h42l-3 5H6z" fill="#9aa6c4"/><rect x="20" y="33" width="8" height="1.6" rx=".8" fill="#5d5a72"/>`),
  kredi: A(`<rect x="6" y="14" width="36" height="22" rx="4" fill="${GR}"/><rect x="9" y="17" width="30" height="16" rx="3" fill="none" stroke="${WH}" stroke-width="1.4" opacity=".7"/>
    <circle cx="24" cy="25" r="5.5" fill="${WH}" opacity=".9"/><path d="M22.6 21.8v6.6c2 0 3.4-.8 3.4-2.6M21 24.5l3.8-1.2M21 26.3l3.8-1.2" stroke="#15803d" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="38" cy="12" r="7" fill="${YL}"/><path d="M38 8.5v7M35.5 10.5l2.5-2.5 2.5 2.5" stroke="#7d3b00" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  bina: A(`<rect x="8" y="10" width="32" height="32" rx="3" fill="${B4}"/><path d="M5 12l19-8 19 8z" fill="${B1}"/><g fill="${WH}"><rect x="12" y="16" width="5" height="5" rx="1"/><rect x="21.5" y="16" width="5" height="5" rx="1"/><rect x="31" y="16" width="5" height="5" rx="1"/><rect x="12" y="25" width="5" height="5" rx="1"/><rect x="31" y="25" width="5" height="5" rx="1"/></g><rect x="20" y="28" width="8" height="14" rx="1.5" fill="${B1}"/>`),
};
// emoji → çizim eşlemesi (sayfa kartlarındaki .big kutuları otomatik dönüşür)
const ART_MAP = {
  '🏠':'ev','🛋️':'studyo','🏢':'ofis','🏙️':'buyuk','🌆':'gokdelen','🔒':'kilit','🏚️':'ev','🏬':'bina',
  '🌐':'web','📱':'mobil','🎮':'oyun','🤖':'ai',
  '⌨️':'klavye','📚':'kitap','☕':'kahve','🪑':'sandalye','🧪':'tup','🖥️':'monitor','☁️':'bulut','📣':'megafon','🔬':'mikroskop',
  '🏋️':'dambil','🍦':'dondurma','🕹️':'joystick','🎵':'nota',
  '🎨':'palet','🌙':'ay','🔐':'kalkan','🌍':'dunya','💳':'kart','🧠':'beyin',
  '🚗':'hatch','🚘':'sedan','🚙':'suv','🏎️':'spor','🚁':'heli','💻':'laptop',
};
/* ---------- ek el çizimi simgeler (emoji yerine) ---------- */
Object.assign(ART, {
  hediye: A(`<rect x="8" y="20" width="32" height="22" rx="3" fill="${OR}"/><rect x="6" y="14" width="36" height="9" rx="3" fill="#ff8f75"/><rect x="21" y="14" width="6" height="28" fill="${YL}"/>
    <path d="M24 14c-3-6-11-8-12-3s9 3 12 3zM24 14c3-6 11-8 12-3s-9 3-12 3z" fill="${YL}" stroke="#d97706" stroke-width="1.2"/>`),
  canta: A(`<rect x="7" y="16" width="34" height="24" rx="4" fill="#8b5e34"/><rect x="7" y="16" width="34" height="9" rx="4" fill="#a46a3c"/><path d="M18 16v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" stroke="#5b3a1e" stroke-width="3" fill="none"/>
    <rect x="21" y="22" width="6" height="6" rx="1.5" fill="${YL}"/>`),
  alarm: A(`<rect x="10" y="38" width="28" height="6" rx="2" fill="#475569"/><path d="M13 38V26a11 11 0 0 1 22 0v12z" fill="#ef4444"/><path d="M18 26a6 6 0 0 1 6-6" stroke="#fecaca" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M5 18l4 3M43 18l-4 3M24 5v5M11 9l3 4M37 9l-3 4" stroke="${YL}" stroke-width="3" stroke-linecap="round"/>`),
  zarf: A(`<rect x="6" y="12" width="36" height="26" rx="4" fill="${WH}" stroke="${B3}" stroke-width="2"/><path d="M7 14l17 13 17-13" stroke="${B1}" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <circle cx="38" cy="12" r="6" fill="${OR}"/><path d="M38 9v4" stroke="${WH}" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="15.5" r="1" fill="${WH}"/>`),
  konfeti: A(`<path d="M8 42l8-24 16 16z" fill="${YL}"/><path d="M8 42l8-24 4 4-6 20z" fill="#f59e0b"/><circle cx="30" cy="10" r="2.5" fill="${PK}"/><circle cx="38" cy="20" r="2.5" fill="${SKY}"/><circle cx="24" cy="6" r="2" fill="${GR}"/>
    <path d="M27 18q4-6 9-5M30 26q6-2 10 2" stroke="${B1}" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="40" y="8" width="4" height="4" rx="1" fill="${OR}" transform="rotate(20 42 10)"/>`),
  roket: A(`<path d="M24 5c8 6 10 16 7 26H17c-3-10-1-20 7-26z" fill="${WH}" stroke="${B3}" stroke-width="1.5"/><circle cx="24" cy="18" r="4.5" fill="${SKY}" stroke="${B1}" stroke-width="2"/>
    <path d="M17 26l-6 8 7-2zM31 26l6 8-7-2z" fill="${OR}"/><path d="M19 31h10l-2 5h-6z" fill="#64748b"/><path d="M21 36q3 9 3 9t3-9z" fill="${YL}"/><path d="M22.5 36q1.5 5 1.5 5t1.5-5z" fill="${OR}"/>`),
  telefon: A(`<path d="M14 7l6 2 2 8-4 3c2 5 5 8 10 10l3-4 8 2 2 6c-1 4-4 6-8 6C18 40 8 30 8 15c0-4 2-7 6-8z" fill="${B1}"/><path d="M14 9l4 1 1.5 6" stroke="${B3}" stroke-width="1.5" fill="none"/>`),
  ates: A(`<path d="M24 4c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 6 5 6-2-6 0-13 2-18z" fill="${OR}"/><path d="M24 22c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-3 0-6 1-9z" fill="${YL}"/>`),
  kupa: A(`<path d="M15 8h18v10a9 9 0 0 1-18 0z" fill="${YL}" stroke="#d97706" stroke-width="1.5"/><path d="M15 11H9a5 5 0 0 0 7 9M33 11h6a5 5 0 0 1-7 9" stroke="#d97706" stroke-width="2.5" fill="none"/>
    <rect x="21" y="26" width="6" height="7" fill="#d97706"/><rect x="14" y="33" width="20" height="7" rx="2" fill="#8b5e34"/><path d="M20 12l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z" fill="${WH}" opacity=".85"/>`),
  simsek: A(`<path d="M27 4L11 27h11l-4 17 18-25H25z" fill="${YL}" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>`),
  kep: A(`<path d="M4 19l20-9 20 9-20 9z" fill="${DK}"/><path d="M12 23v9c0 4 24 4 24 0v-9l-12 5z" fill="#334155"/><path d="M40 20v10" stroke="${YL}" stroke-width="2"/><circle cx="40" cy="31" r="2.5" fill="${YL}"/>`),
  pizza: A(`<path d="M24 42L6 10q18-8 36 0z" fill="#fbbf24"/><path d="M6 10q18-8 36 0l-2 4q-16-7-32 0z" fill="#b45309"/><circle cx="20" cy="18" r="3" fill="#ef4444"/><circle cx="29" cy="20" r="3" fill="#ef4444"/><circle cx="24" cy="29" r="2.6" fill="#ef4444"/><circle cx="17" cy="25" r="1.5" fill="${GR}"/>`),
  pano: A(`<rect x="9" y="8" width="30" height="34" rx="3" fill="#c89a66"/><rect x="12" y="12" width="24" height="27" rx="2" fill="${WH}"/><rect x="17" y="5" width="14" height="7" rx="2" fill="#64748b"/>
    <path d="M16 19h16M16 25h16M16 31h10" stroke="${B3}" stroke-width="2.5" stroke-linecap="round"/><path d="M15 18.5l1.5 1.5 2.5-3" stroke="${GR}" stroke-width="2" fill="none"/>`),
  pusula: A(`<circle cx="24" cy="24" r="18" fill="${WH}" stroke="${B1}" stroke-width="3"/><path d="M24 10l5 14-5 14-5-14z" fill="${B3}"/><path d="M24 10l5 14h-10z" fill="${OR}"/><circle cx="24" cy="24" r="2.5" fill="${DK}"/>`),
  banka: A(`<path d="M5 17L24 6l19 11z" fill="${B1}"/><rect x="7" y="17" width="34" height="3" fill="${B2}"/><g fill="${B4}"><rect x="10" y="21" width="4" height="15"/><rect x="18" y="21" width="4" height="15"/><rect x="26" y="21" width="4" height="15"/><rect x="34" y="21" width="4" height="15"/></g>
    <rect x="6" y="36" width="36" height="5" rx="1" fill="${B1}"/><circle cx="24" cy="12.5" r="2.5" fill="${YL}"/>`),
  para: A(`<rect x="5" y="14" width="34" height="20" rx="3" fill="#22c55e" transform="rotate(-8 22 24)"/><rect x="9" y="16" width="34" height="20" rx="3" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
    <circle cx="26" cy="26" r="6" fill="#bbf7d0"/><path d="M26 22v8M23.5 24.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" stroke="#15803d" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
  el: A(`<path d="M4 22l9-7 8 3 8-3 15 9-6 7-8-2-6 5c-3 2-6 2-8 0z" fill="#fcd9b6" stroke="#c98a55" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 18l6 6M26 26l-4 4M30 28l-4 4" stroke="#c98a55" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="1" y="18" width="7" height="12" rx="2" fill="${B1}" transform="rotate(-38 4 24)"/><rect x="40" y="20" width="7" height="12" rx="2" fill="${OR}" transform="rotate(38 44 26)"/>`),
  vinc: A(`<path d="M12 42V10M12 10h28M12 18l8-8" stroke="${YL}" stroke-width="4" stroke-linecap="square"/><path d="M14 10v32" stroke="#d97706" stroke-width="1" stroke-dasharray="2 3"/><path d="M34 10v12" stroke="#64748b" stroke-width="1.5"/>
    <rect x="29" y="22" width="10" height="8" rx="1.5" fill="${OR}"/><rect x="6" y="40" width="14" height="4" fill="#64748b"/>`),
  isilti: A(`<path d="M20 6l3.5 10L34 20l-10.5 4L20 34l-3.5-10L6 20l10.5-4z" fill="${YL}" stroke="#d97706" stroke-width="1.2"/><path d="M36 26l1.8 5 5 1.8-5 1.8L36 40l-1.8-5.4-5-1.8 5-1.8z" fill="${SKY}"/><circle cx="38" cy="10" r="2.5" fill="${PK}"/>`),
  bocek: A(`<ellipse cx="24" cy="27" rx="12" ry="14" fill="#ef4444"/><path d="M24 13v28" stroke="${DK}" stroke-width="2"/><circle cx="24" cy="12" r="6" fill="${DK}"/><circle cx="18" cy="23" r="2.5" fill="${DK}"/><circle cx="30" cy="25" r="2.5" fill="${DK}"/><circle cx="19" cy="33" r="2.2" fill="${DK}"/><circle cx="29" cy="34" r="2" fill="${DK}"/>
    <path d="M12 22l-5-3M12 30H6M14 37l-5 3M36 22l5-3M36 30h6M34 37l5 3M21 7l-3-3M27 7l3-3" stroke="${DK}" stroke-width="2" stroke-linecap="round"/>`),
  veritabani: A(`<ellipse cx="24" cy="11" rx="14" ry="5" fill="${B3}"/><path d="M10 11v26c0 3 6 5 14 5s14-2 14-5V11c0 3-6 5-14 5s-14-2-14-5z" fill="${B1}"/><path d="M10 20c0 3 6 5 14 5s14-2 14-5M10 29c0 3 6 5 14 5s14-2 14-5" stroke="${B3}" stroke-width="2" fill="none"/><circle cx="33" cy="22" r="1.5" fill="${GR}"/><circle cx="33" cy="31" r="1.5" fill="${GR}"/>`),
  fis: A(`<rect x="15" y="16" width="18" height="14" rx="4" fill="#64748b"/><path d="M19 16V7M29 16V7" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/><path d="M24 30v6q0 6-8 6" stroke="${DK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="23" r="2" fill="${YL}"/>`),
  yapboz: A(`<path d="M8 10h12a4 4 0 1 1 8 0h12v12a4 4 0 1 0 0 8v12H28a4 4 0 1 0-8 0H8V30a4 4 0 1 1 0-8z" fill="${B1}"/><path d="M8 10h12a4 4 0 1 1 8 0h12v12a4 4 0 1 0 0 8H24V10" fill="${OR}"/>`),
  baglanti: A(`<rect x="5" y="17" width="20" height="14" rx="7" stroke="${B1}" stroke-width="4.5" fill="none" transform="rotate(-30 15 24)"/><rect x="23" y="17" width="20" height="14" rx="7" stroke="${SKY}" stroke-width="4.5" fill="none" transform="rotate(-30 33 24)"/>`),
  firca: A(`<path d="M36 6l6 6-17 17-6-6z" fill="#8b5e34"/><path d="M19 23l6 6-4 4-6-6z" fill="#94a3b8"/><path d="M15 27l6 6c-2 6-8 9-15 8 4-3 3-10 9-14z" fill="${PK}"/>`),
  grafik: A(`<rect x="6" y="6" width="36" height="36" rx="5" fill="${WH}" stroke="${B3}" stroke-width="2"/><rect x="12" y="28" width="5" height="9" rx="1" fill="${B3}"/><rect x="21" y="22" width="5" height="15" rx="1" fill="${B2}"/><rect x="30" y="15" width="5" height="22" rx="1" fill="${B1}"/>
    <path d="M11 24l9-7 7 4 11-10" stroke="${GR}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  hedef: A(`<circle cx="22" cy="26" r="17" fill="${WH}" stroke="#ef4444" stroke-width="4"/><circle cx="22" cy="26" r="10" fill="#ef4444"/><circle cx="22" cy="26" r="4.5" fill="${WH}"/><path d="M22 26L40 8" stroke="${DK}" stroke-width="2.5"/><path d="M36 6l6 0-2 6z" fill="${B1}"/>`),
  tac: A(`<path d="M6 36L4 14l11 9 9-14 9 14 11-9-2 22z" fill="${YL}" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round"/><rect x="6" y="36" width="36" height="5" rx="1.5" fill="#f59e0b"/><circle cx="24" cy="27" r="3" fill="#ef4444"/><circle cx="14" cy="29" r="2" fill="${SKY}"/><circle cx="34" cy="29" r="2" fill="${SKY}"/>`),
  yildiz: A(`<path d="M24 5l5.6 11.8 12.9 1.6-9.5 8.9 2.5 12.8L24 33.8l-11.5 6.3 2.5-12.8-9.5-8.9 12.9-1.6z" fill="${YL}" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round"/>`),
  tavsan: A(`<ellipse cx="24" cy="31" rx="11" ry="10" fill="${WH}" stroke="#cbd5e1" stroke-width="1.5"/><ellipse cx="19" cy="12" rx="3.5" ry="10" fill="${WH}" stroke="#cbd5e1" stroke-width="1.5"/><ellipse cx="29" cy="12" rx="3.5" ry="10" fill="${WH}" stroke="#cbd5e1" stroke-width="1.5"/>
    <ellipse cx="19" cy="12" rx="1.5" ry="7" fill="${PK}"/><ellipse cx="29" cy="12" rx="1.5" ry="7" fill="${PK}"/><circle cx="20" cy="29" r="1.6" fill="${DK}"/><circle cx="28" cy="29" r="1.6" fill="${DK}"/><circle cx="24" cy="33" r="1.4" fill="${PK}"/><path d="M38 20l6-3M38 26h7" stroke="${SKY}" stroke-width="2" stroke-linecap="round"/>`),
  terazi: A(`<path d="M24 8v32M14 40h20M10 14h28" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><path d="M10 14l-6 12h12zM38 14l-6 12h12z" fill="none" stroke="#64748b" stroke-width="1.5"/><path d="M4 26a6 4 0 0 0 12 0zM32 26a6 4 0 0 0 12 0z" fill="${B1}"/><circle cx="24" cy="8" r="3" fill="${YL}"/>`),
  kaplumbaga: A(`<ellipse cx="22" cy="28" rx="15" ry="10" fill="#16a34a"/><path d="M8 28a14 9 0 0 1 28 0z" fill="#22c55e"/><path d="M14 24l4-6h8l4 6-4 5h-8z" fill="#15803d"/><ellipse cx="40" cy="27" rx="5" ry="4" fill="#86efac"/><circle cx="41.5" cy="26" r="1.2" fill="${DK}"/>
    <ellipse cx="12" cy="37" rx="3" ry="2.5" fill="#86efac"/><ellipse cx="30" cy="37" rx="3" ry="2.5" fill="#86efac"/>`),
});
Object.assign(ART_MAP, {
  '🎁':'hediye','💼':'canta','🚨':'alarm','📩':'zarf','📧':'zarf','✉️':'zarf','🎉':'konfeti','🥳':'konfeti','🚀':'roket','📞':'telefon','🔥':'ates','🏆':'kupa','🥇':'kupa','⚡':'simsek','🎓':'kep','🍕':'pizza',
  '📋':'pano','🧭':'pusula','🏛️':'banka','🏦':'banka','💸':'para','💰':'para','🤝':'el','🏗️':'vinc','✨':'isilti','🐞':'bocek','🗄️':'veritabani','🔌':'fis','🧩':'yapboz','🔗':'baglanti','🖌️':'firca',
  '📈':'grafik','🎯':'hedef','👑':'tac','⭐':'yildiz','🐇':'tavsan','⚖️':'terazi','🐢':'kaplumbaga',
});

function artIcons(root){
  (root||document).querySelectorAll('.big, .evc, .focuscard .fi, .pacechip > span').forEach(el => {
    if (el.dataset.art) return;
    const k = ART_MAP[el.textContent.trim()];
    if (k){ el.innerHTML = ART[k]; el.dataset.art = '1'; el.classList.add('art'); }
  });
}

/* ---------- çalışan avatarı (önden, yüz portresi) ---------- */
// isimden cinsiyet: kadın isimleri kadın görünür, erkek isimleri erkek
const FEM_FIRST = new Set(['Ayşe','Fatma','Ece','Zeynep','Elif','Selin','Deniz','Merve','İrem','Buse','Derya','Gizem','Esra','Nazlı','Ceren','Damla','Melis','Sude','Zehra','Ebru','Pelin','Aslı','Gamze','Elif','Selin','Ayşe']);
function nameFem(name){ return FEM_FIRST.has(String(name||'').split(' ')[0]); }
function femOf(id, emo){
  if (typeof S !== 'undefined' && S){
    for (const L of [S.emps, S.cands, (S.os && S.os.net)]){ const p = (L||[]).find(x => x.id === id); if (p) return nameFem(p.name); }
  }
  return /👩|♀/.test(emo||'');
}
function avatarSVG(id, role, emo){
  if (role==='me' && typeof S!=='undefined' && S && S.me) return portraitSVG(lookFrom(S.me));
  return portraitSVG(empLook(id, role, femOf(id, emo)));
}
// önden yüz portresi (ofisteki karakterle aynı saç, kıyafet ve aksesuar)
// saç L.hs: 0 kısa, 1 uzun, 2 at kuyruğu, 3 topuz, 4 kıvırcık, 5 kazıtılmış · kıyafet L.kind: tee, hoodie, shirt, sweater, blazer
function portraitSVG(L){
  const {skin, hair, shirt} = L, hs = L.hs||0, kind = L.kind||'tee', fem = !!L.f;
  const hairL = shade(hair, 1.6), hairD = shade(hair, .7), skinD = shade(skin, .86), skinDD = shade(skin, .72);
  const shirtD = shade(shirt, .78), shirtDD = shade(shirt, .6), shirtL = shade(shirt, 1.15);
  const curls = hs===4 ? [[12,12],[16,7.6],[22,5.6],[28,6],[33,8.6],[36.4,13.4],[37.4,19],[10.8,18]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.2" fill="${hair}" stroke="${hairD}" stroke-width=".5"/>`).join('') : '';
  const behind = hs===1 ? `<path d="M11.4 19c-1.6 10 .4 19 3.6 23.4h18c3.2-4.4 5.2-13.4 3.6-23.4z" fill="${hair}" stroke="${hairD}" stroke-width=".6"/><path d="M15 30q-.6 6 1.4 11M33 30q.6 6-1.4 11" stroke="${hairD}" stroke-width=".6" fill="none" opacity=".6"/>`
    : hs===2 ? `<path d="M33 12.6q9.4 3 7.4 17.4q-1.6 4.4-4.4 1.6q2-9.4-4.6-14z" fill="${hair}" stroke="${hairD}" stroke-width=".6"/><rect x="32.2" y="12.4" width="3" height="3" rx="1" fill="${shirt}"/>`
    : hs===3 ? `<circle cx="24" cy="8" r="5.6" fill="${hair}" stroke="${hairD}" stroke-width=".6"/><path d="M20.4 8q3.6-2.4 7.2 0" stroke="${hairL}" stroke-width=".7" fill="none" opacity=".6"/>`
    : hs===4 ? `<ellipse cx="24" cy="17.6" rx="14.6" ry="13.8" fill="${hair}"/>${curls}` : '';
  const capOp = hs===5 ? ' opacity=".42"' : '';
  // gövde ve yaka
  const body = `<path d="${fem ? 'M10 48c0-8.8 6.2-13.8 14-13.8S38 39.2 38 48z' : 'M6.6 48c0-9.8 7.6-14.8 17.4-14.8S41.4 38.2 41.4 48z'}" fill="${shirt}" stroke="${shirtDD}" stroke-width=".7"/>
    <path d="M31 35.6Q39.6 38.8 40.4 48H34q.6-7.6-3-12.4z" fill="${shirtD}" opacity=".5"/>`;
  const neck = kind==='hoodie'
    ? `<path d="M14.6 36.4q9.4 7 18.8 0" stroke="${shirtDD}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M21.6 39.6v6.4M26.4 39.6v6.4" stroke="${WH}" stroke-width="1" stroke-linecap="round"/><circle cx="21.6" cy="46.2" r=".8" fill="${WH}"/><circle cx="26.4" cy="46.2" r=".8" fill="${WH}"/>`
    : kind==='shirt'
    ? `<path d="M18.4 34.4L24 39.8l-3.4 3.6zM29.6 34.4L24 39.8l3.4 3.6z" fill="${shirtL}" stroke="${shirtDD}" stroke-width=".6" stroke-linejoin="round"/><circle cx="24" cy="43" r=".7" fill="${shirtDD}"/><circle cx="24" cy="46.2" r=".7" fill="${shirtDD}"/>`
    : kind==='blazer'
    ? `<path d="M19 34.6l5 10.4 5-10.4z" fill="#f8fafc"/><path d="M24 37.6l-1.3 1.8 1.3 7 1.3-7z" fill="#2f54eb"/><path d="M18.6 34.4L24 45l-7.6-6.4zM29.4 34.4L24 45l7.6-6.4z" fill="${shirtL}" stroke="${shirtDD}" stroke-width=".5" stroke-linejoin="round"/>`
    : kind==='sweater'
    ? `<path d="M18.6 35q5.4 4.6 10.8 0" stroke="${shirtD}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    : `<path d="M19 34.8q5 4.2 10 0" stroke="${shirtDD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return A(`<circle cx="24" cy="24" r="23" fill="${PALE}"/>
    ${behind}
    ${body}
    <path d="M20.4 27h7.2v8.2q-3.6 2.2-7.2 0z" fill="${skinD}" stroke="${skinDD}" stroke-width=".5"/>
    <path d="M20.4 30.6q3.6 2 7.2 0" stroke="${skinDD}" stroke-width=".6" fill="none" opacity=".6"/>
    ${neck}
    <ellipse cx="13.7" cy="22.2" rx="2" ry="2.9" fill="${skin}" stroke="${skinDD}" stroke-width=".5"/><ellipse cx="34.3" cy="22.2" rx="2" ry="2.9" fill="${skin}" stroke="${skinDD}" stroke-width=".5"/>
    <path d="${fem ? 'M14.4 21.2c0-6.8 4.2-11.2 9.6-11.2s9.6 4.4 9.6 11.2c0 6.2-3.8 10.8-9.6 10.8S14.4 27.4 14.4 21.2z' : 'M13.4 21c0-6.8 4.6-11 10.6-11s10.6 4.2 10.6 11c0 5.6-2.4 9.6-6.4 10.8q-4.2 1.3-8.4 0c-4-1.2-6.4-5.2-6.4-10.8z'}" fill="${skin}" stroke="${skinDD}" stroke-width=".6"/>

    <path d="M30.6 13.6q3.8 4.4 3.4 9.8q-.6 5-4.4 7.8q2.6-4.2 2.2-9.6q-.2-4.4-1.2-8z" fill="${skinD}" opacity=".55"/>
    <g${capOp}><path d="M13.4 21C12.6 13.4 17 8.6 24 8.6S35.4 13.4 34.6 21q-1.2-4.8-4.8-6.4q-5.2 2.8-12.8 1.6Q14.4 17.6 13.4 21z" fill="${hair}" stroke="${hairD}" stroke-width=".6"/>
    <path d="M17 12.6q5.6-3.2 12.4-.6q-6-1.4-11 2.2z" fill="${hairL}" opacity=".55"/>
    <path d="M20 10.4q-1.4 3.4-1.6 5.6M25.4 9.6q.6 3 1.8 5.4M30.4 11.6q.8 2 1 4" stroke="${hairD}" stroke-width=".6" fill="none" opacity=".7"/></g>
    <ellipse cx="20" cy="22.8" rx="2.1" ry="1.55" fill="${WH}"/><ellipse cx="28" cy="22.8" rx="2.1" ry="1.55" fill="${WH}"/>
    <circle cx="20.3" cy="22.8" r="1.25" fill="#3b2a1e"/><circle cx="28.3" cy="22.8" r="1.25" fill="#3b2a1e"/>
    <circle cx="20.7" cy="22.4" r=".45" fill="${WH}"/><circle cx="28.7" cy="22.4" r=".45" fill="${WH}"/>
    <path d="M17.9 21.4q2.1-1 4.2 0M25.9 21.4q2.1-1 4.2 0" stroke="${skinDD}" stroke-width=".5" fill="none" opacity=".6"/>
    ${fem ? `<path d="M17.6 19.9q2.4-1.9 4.6-.4M25.8 19.5q2.2-1.5 4.6.4" stroke="${shade(hair,.85)}" stroke-width=".75" fill="none" stroke-linecap="round"/><path d="M18 22q2-1.2 4 0M26 22q2-1.2 4 0" stroke="#3b2a1e" stroke-width=".45" fill="none" stroke-linecap="round" opacity=".8"/>` : `<path d="M17.4 19.5h4.9M25.7 19.5h4.9" stroke="${shade(hair,.8)}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`}
    <path d="M24.4 23.2q1 2.4-.2 3q-.7.3-1.4-.1" stroke="${skinDD}" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <circle cx="17.4" cy="26" r="1.9" fill="rgba(255,110,110,.28)"/><circle cx="30.6" cy="26" r="1.9" fill="rgba(255,110,110,.28)"/>
    ${L.beard ? `<path d="M15.4 24.6q8.6 10 17.2 0q-.6 7.6-8.6 7.6t-8.6-7.6z" fill="${hair}" opacity=".88"/>` : ''}
    ${fem ? `<path d="M21.4 27.6q2.6 2 5.2 0" stroke="#b4536a" stroke-width="1.15" fill="none" stroke-linecap="round"/>` : `<path d="M21.2 27.6q2.8 2.2 5.6 0" stroke="#9a3412" stroke-width="1.25" fill="none" stroke-linecap="round"/>`}
    ${L.glasses ? `<g stroke="#334155" stroke-width="1.1" fill="rgba(255,255,255,.28)"><rect x="16.6" y="20.2" width="6.6" height="5" rx="2.2"/><rect x="24.8" y="20.2" width="6.6" height="5" rx="2.2"/><path d="M23.2 22.4h1.6M16.6 22l-2.4-.6M31.4 22l2.4-.6"/></g>` : ''}
    ${L.phones ? `<path d="M12.2 21a11.8 11.8 0 0 1 23.6 0" stroke="#1f2937" stroke-width="2.6" fill="none" stroke-linecap="round"/><rect x="9.4" y="18.2" width="5.2" height="9" rx="2.4" fill="#1f2937"/><rect x="33.4" y="18.2" width="5.2" height="9" rx="2.4" fill="#1f2937"/><rect x="10.4" y="19.6" width="1.6" height="6" rx=".8" fill="${shirt}" opacity=".8"/>` : ''}`);
}
