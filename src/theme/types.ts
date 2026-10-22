import type { PrismTheme } from 'prism-react-renderer';

export type CodeChrome = {
  editor: string;
  titleBar: string;
  tabBar: string;
  border: string;
  lineNumber: string;
  currentLine: string;
  text: string;
};

export type CodeSyntax = {
  keyword: string;
  builtin: string;
  function: string;
  string: string;
  number: string;
  variable: string;
  comment: string;
  operator: string;
};

export type Theme = {
  bg: string;
  bgGlow: string;
  paper: string;
  paperElevated: string;
  text: string;
  muted: string;
  dim: string;
  border: string;
  borderStrong: string;
  ink: string;
  onInk: string;
  tint: string;
  good: string;
  onGood: string;
  goodTint: string;
  goodBorder: string;
  goodShadow: string;
  bad: string;
  onBad: string;
  badTint: string;
  badBorder: string;
  badShadow: string;
  warn: string;
  onWarn: string;
  warnTint: string;
  warnBorder: string;
  warnShadow: string;
  grid: string;
  shadow: string;
  shadowSm: string;
  code: {
    dots: readonly [string, string, string];
    chrome: CodeChrome;
    syntax: CodeSyntax;
    prism: PrismTheme;
  };
};

export type ThemeName = 'amber' | 'mint' | 'rose';
