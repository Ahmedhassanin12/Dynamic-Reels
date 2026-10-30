import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { RELATION } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { drawProgress, emphasisPulse, fadeSlide, scalePop } from '../lib/motion';
import { useTheme } from '../lib/theme';
import type {
  RelationColumn,
  RelationColumnInput,
  RelationIntegrityCheck,
  RelationKeyRole,
  RelationRowInput,
  RelationTable,
  VizProps,
} from '../types';
import { ResultBadge } from './ResultBadge';

type NormalizedColumn = {
  name: string;
  label: string;
  role?: RelationKeyRole;
  highlight: boolean;
};

const normalizeColumn = (input: RelationColumnInput, table: RelationTable): NormalizedColumn => {
  if (typeof input === 'string') {
    return {
      name: input,
      label: input,
      highlight: Boolean(table.highlightColumns?.includes(input)),
    };
  }
  const col: RelationColumn = input;
  const role: RelationKeyRole | undefined = col.role ?? (col.pk ? 'pk' : col.fk ? 'fk' : undefined);
  return {
    name: col.name,
    label: col.label ?? col.name,
    role,
    highlight: Boolean(col.highlight || table.highlightColumns?.includes(col.name)),
  };
};

const getCellValue = (row: RelationRowInput, columns: NormalizedColumn[], colIndex: number): string => {
  if (Array.isArray(row)) {
    const val = row[colIndex];
    return val !== undefined ? String(val) : '';
  }
  const colName = columns[colIndex]?.name;
  const val = colName !== undefined ? row[colName] : undefined;
  return val !== undefined ? String(val) : '';
};

/**
 * Relational Database Table & Primary Key / Foreign Key Visualizer.
 * Uses multi-beat progressive choreography to explain:
 * 1. Table structure reveal
 * 2. Primary / Foreign Key column identification
 * 3. Foreign Key value lock
 * 4. Animated SVG FK ──► PK relationship connector
 * 5. Target Primary Key row resolution
 * 6. Valid vs. Invalid reference verification (Referential Integrity)
 */
export const RelationViz = ({ viz, result }: VizProps<'relation'>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const stagger = viz.framesPerStep ?? RELATION.stepStaggerFrames;
  const link = viz.link;

  // Normalize columns and order tables so that when `link` is present,
  // the source (FK / fromTable) is on the LEFT and target (PK / toTable) is on the RIGHT,
  // matching the left-to-right directional flow of `fromTable.fk ──► toTable.pk`.
  const rawTables = viz.tables.slice(0, 2).map((table) => ({
    table,
    columns: table.columns.map((c) => normalizeColumn(c, table)),
  }));

  const normalizedTables =
    link && rawTables.length === 2 && rawTables[0].table.name === link.toTable && rawTables[1].table.name === link.fromTable
      ? [rawTables[1], rawTables[0]]
      : rawTables;

  // Resolve matched key value and matched target row label if `link` is configured
  let resolvedLinkValue: string | undefined = link?.value !== undefined ? String(link.value) : undefined;
  let resolvedTargetLabel: string | undefined;

  if (link) {
    const fromEntry = normalizedTables.find((t) => t.table.name === link.fromTable);
    const toEntry = normalizedTables.find((t) => t.table.name === link.toTable);
    if (fromEntry && toEntry) {
      const fromColIdx = fromEntry.columns.findIndex((c) => c.name === link.fromColumn);
      const toColIdx = toEntry.columns.findIndex((c) => c.name === link.toColumn);
      if (fromColIdx !== -1 && toColIdx !== -1) {
        if (resolvedLinkValue === undefined) {
          const toValues = new Set(toEntry.table.rows.map((r) => getCellValue(r, toEntry.columns, toColIdx)));
          for (const row of fromEntry.table.rows) {
            const candidate = getCellValue(row, fromEntry.columns, fromColIdx);
            if (candidate && toValues.has(candidate)) {
              resolvedLinkValue = candidate;
              break;
            }
          }
        }
        if (resolvedLinkValue !== undefined) {
          const matchedRow = toEntry.table.rows.find(
            (r) => getCellValue(r, toEntry.columns, toColIdx) === resolvedLinkValue,
          );
          if (matchedRow) {
            const labelColIdx = toEntry.columns.findIndex((_, idx) => idx !== toColIdx);
            if (labelColIdx !== -1) {
              resolvedTargetLabel = getCellValue(matchedRow, toEntry.columns, labelColIdx);
            }
          }
        }
      }
    }
  }

  const isDualRelational = normalizedTables.length > 1 && Boolean(link);

  // Resolve progressive storytelling beats (either explicit voice-synced beatFrames or stagger defaults)
  const b0 = viz.beatFrames?.[0] ?? 0;
  const b1 = viz.beatFrames?.[1] ?? stagger;
  const b2 = viz.beatFrames?.[2] ?? stagger * 2;
  const b3 = viz.beatFrames?.[3] ?? stagger * 2.5;
  const b4 = viz.beatFrames?.[4] ?? stagger * 3.2;
  const b5 = viz.beatFrames?.[5] ?? stagger * 4;

  // Single-table beats vs dual-table beats
  const fkColBeat = isDualRelational ? b1 : b1;
  const fkValBeat = isDualRelational ? b2 : b1;
  const arrowDrawBeat = isDualRelational ? b3 : b2;
  const pkResolveBeat = isDualRelational ? b4 : b1;
  const footerBeat = isDualRelational ? b5 : b2;

  const fkColFocus = emphasisPulse(frame, { atFrame: fkColBeat, rampFrames: 10, pulseFrames: 20 });
  const fkValFocus = emphasisPulse(frame, { atFrame: fkValBeat, rampFrames: 10, pulseFrames: 22 });
  const pkColFocus = emphasisPulse(frame, { atFrame: pkResolveBeat, rampFrames: 10, pulseFrames: 22 });
  const connectorDraw = drawProgress(frame, { delay: arrowDrawBeat, duration: 20 });
  const footerSlide = fadeSlide(frame, fps, { delay: footerBeat, distance: 14, preset: 'snappy' });

  // Build valid/invalid integrity check items when in dual-relational mode or when explicitly provided
  const integrityChecks: RelationIntegrityCheck[] =
    viz.integrityChecks ??
    (link && resolvedLinkValue !== undefined
      ? [
          {
            value: resolvedLinkValue,
            valid: true,
            detail: resolvedTargetLabel
              ? `${resolvedTargetLabel} (${link.toTable}.${link.toColumn})`
              : `${link.toTable}.${link.toColumn} match`,
          },
          {
            value: 99,
            valid: false,
            detail: `No match in ${link.toTable}.${link.toColumn}`,
          },
        ]
      : []);

  const hasAnyFk =
    Boolean(link) || normalizedTables.some((entry) => entry.columns.some((c) => c.role === 'fk'));

  const gridTemplateColumns =
    normalizedTables.length === 1
      ? '1fr'
      : normalizedTables.map((entry) => `${Math.max(1, entry.columns.length * 0.45)}fr`).join(' ');

  return (
    <Box
      style={{
        direction: 'ltr',
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top Header: Schema Label + PK/FK Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '3px 11px',
              borderRadius: 6,
              background: theme.tint,
              border: `1px solid ${theme.borderStrong}`,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {link ? 'RELATIONAL DB · FK → PK' : 'RELATIONAL DB · TABLE'}
          </span>
          <span style={{ fontSize: 15, color: theme.muted }}>
            {link
              ? `${link.fromTable}.${link.fromColumn} ──► ${link.toTable}.${link.toColumn}`
              : normalizedTables.map((t) => t.table.name).join(' · ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              padding: '2px 9px',
              borderRadius: 6,
              background: theme.goodTint,
              border: `1px solid ${theme.goodBorder}`,
              color: theme.good,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            PK · Primary Key
          </span>
          {hasAnyFk && (
            <span
              style={{
                padding: '2px 9px',
                borderRadius: 6,
                background: theme.warnTint,
                border: `1px solid ${theme.warnBorder}`,
                color: theme.warn,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              FK · Foreign Key
            </span>
          )}
        </div>
      </div>

      {/* Tables Grid (1 or 2 Tables) */}
      <div style={{ display: 'grid', gridTemplateColumns, gap: 12, alignItems: 'start' }}>
        {normalizedTables.map(({ table, columns }, tableIdx) => {
          const isFromTable = link?.fromTable === table.name;
          const isToTable = link?.toTable === table.name;
          const tableEnterDelay = b0 + tableIdx * 2;

          // Progressive table border activation
          const tableFocusActive = isDualRelational
            ? isFromTable
              ? fkColFocus.active
              : isToTable
                ? pkColFocus.active
                : 1
            : fkColFocus.active;

          const activeBorderColor =
            table.tone === 'good' || isToTable
              ? theme.goodBorder
              : table.tone === 'warn' || isFromTable
                ? theme.warnBorder
                : theme.borderStrong;

          const tableBorder = tableFocusActive > 0.3 ? activeBorderColor : theme.borderStrong;

          const headerAccent =
            table.tone === 'good' || isToTable
              ? theme.good
              : table.tone === 'warn' || isFromTable
                ? theme.warn
                : theme.ink;

          const badgeText =
            table.badge ??
            (isToTable ? 'PARENT · PK' : isFromTable ? 'CHILD · FK' : `${table.rows.length} rows`);

          const colGrid = `repeat(${columns.length}, minmax(0, 1fr))`;

          return (
            <Enter key={table.name} delay={tableEnterDelay} distance={18}>
              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${tableBorder}`,
                  background: theme.paperElevated,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow:
                    tableFocusActive > 0.5
                      ? isToTable || table.tone === 'good'
                        ? theme.goodShadow
                        : isFromTable || table.tone === 'warn'
                          ? theme.warnShadow
                          : undefined
                      : undefined,
                }}
              >
                {/* Table Title Bar */}
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.28)',
                    borderBottom: `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: headerAccent,
                      }}
                    />
                    <span style={{ fontSize: 19, fontWeight: 700, color: theme.text }}>{table.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: headerAccent,
                      background: theme.paper,
                      border: `1px solid ${activeBorderColor}`,
                      padding: '2px 8px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Column Headers Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: colGrid,
                    borderBottom: `1px solid ${theme.borderStrong}`,
                    background: theme.paper,
                  }}
                >
                  {columns.map((col, colIdx) => {
                    const isLinkedCol =
                      (isFromTable && link?.fromColumn === col.name) ||
                      (isToTable && link?.toColumn === col.name);
                    const effectiveRole: RelationKeyRole | undefined =
                      col.role ??
                      (isToTable && link?.toColumn === col.name
                        ? 'pk'
                        : isFromTable && link?.fromColumn === col.name
                          ? 'fk'
                          : undefined);
                    const isTargetCol = col.highlight || isLinkedCol;

                    // Determine when this column's highlight and badge activate
                    const colFocusState = isDualRelational
                      ? isFromTable && isTargetCol
                        ? fkColFocus
                        : isToTable && isTargetCol
                          ? pkColFocus
                          : { isActive: !isTargetCol, active: isTargetCol ? 0 : 1, pulse: 0 }
                      : isTargetCol
                        ? fkColFocus
                        : { isActive: true, active: 1, pulse: 0 };

                    const badgeDelay = isDualRelational
                      ? isFromTable && isTargetCol
                        ? fkColBeat
                        : isToTable && isTargetCol
                          ? pkResolveBeat
                          : tableEnterDelay + 6
                      : isTargetCol
                        ? b2
                        : tableEnterDelay + 6;

                    const badgePop = scalePop(frame, fps, {
                      delay: badgeDelay,
                      from: 0.75,
                      preset: 'emphasis',
                    });

                    const roleColor =
                      effectiveRole === 'pk'
                        ? theme.good
                        : effectiveRole === 'fk'
                          ? theme.warn
                          : isTargetCol
                            ? theme.ink
                            : theme.muted;
                    const roleBg =
                      effectiveRole === 'pk'
                        ? theme.goodTint
                        : effectiveRole === 'fk'
                          ? theme.warnTint
                          : theme.tint;
                    const roleBorder =
                      effectiveRole === 'pk'
                        ? theme.goodBorder
                        : effectiveRole === 'fk'
                          ? theme.warnBorder
                          : theme.borderStrong;

                    const headerBg =
                      isTargetCol && colFocusState.active > 0.1
                        ? effectiveRole === 'pk'
                          ? `rgba(34, 197, 94, ${(0.14 * colFocusState.active + 0.08 * colFocusState.pulse).toFixed(3)})`
                          : `rgba(251, 146, 60, ${(0.14 * colFocusState.active + 0.08 * colFocusState.pulse).toFixed(3)})`
                        : undefined;

                    return (
                      <div
                        key={col.name}
                        style={{
                          padding: '7px 10px',
                          borderRight: colIdx < columns.length - 1 ? `1px solid ${theme.border}` : undefined,
                          background: headerBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15.5,
                            fontWeight: 700,
                            color:
                              isTargetCol && colFocusState.active > 0.2
                                ? roleColor
                                : effectiveRole
                                  ? theme.text
                                  : theme.muted,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.label}
                        </span>
                        {effectiveRole && (
                          <span
                            style={{
                              opacity: badgePop.opacity,
                              transform: badgePop.transform,
                              padding: '1px 6px',
                              borderRadius: 5,
                              background: roleBg,
                              border: `1px solid ${roleBorder}`,
                              color: roleColor,
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              flexShrink: 0,
                            }}
                          >
                            {effectiveRole.toUpperCase()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sample Rows */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {table.rows.map((row, rowIdx) => {
                    const rowEnter = fadeSlide(frame, fps, {
                      delay: tableEnterDelay + 4 + rowIdx * 6,
                      distance: 10,
                      preset: 'snappy',
                    });

                    const linkedColIdx = isFromTable
                      ? columns.findIndex((c) => c.name === link?.fromColumn)
                      : isToTable
                        ? columns.findIndex((c) => c.name === link?.toColumn)
                        : -1;
                    const linkedCellVal =
                      linkedColIdx !== -1 ? getCellValue(row, columns, linkedColIdx) : undefined;
                    const isRowLinkedMatch =
                      resolvedLinkValue !== undefined && linkedCellVal === resolvedLinkValue;
                    const isRowTarget = table.highlightRow === rowIdx || isRowLinkedMatch;

                    // Row highlight activates at fkValBeat for FK table, pkResolveBeat for PK table
                    const rowFocus = isDualRelational
                      ? isFromTable
                        ? fkValFocus
                        : isToTable
                          ? pkColFocus
                          : fkColFocus
                      : fkColFocus;

                    const isRowHighlighted = isRowTarget && rowFocus.active > 0.25;

                    const rowTint = isRowHighlighted
                      ? isToTable || table.tone === 'good'
                        ? theme.goodTint
                        : isFromTable || table.tone === 'warn'
                          ? theme.warnTint
                          : theme.tint
                      : 'transparent';

                    return (
                      <div
                        key={rowIdx}
                        style={{
                          opacity: rowEnter.opacity,
                          transform: rowEnter.transform,
                          display: 'grid',
                          gridTemplateColumns: colGrid,
                          background: rowTint,
                          borderBottom:
                            rowIdx < table.rows.length - 1 ? `1px solid ${theme.border}` : undefined,
                        }}
                      >
                        {columns.map((col, colIdx) => {
                          const cellVal = getCellValue(row, columns, colIdx);
                          const isLinkedCol =
                            (isFromTable && link?.fromColumn === col.name) ||
                            (isToTable && link?.toColumn === col.name);
                          const effectiveRole: RelationKeyRole | undefined =
                            col.role ??
                            (isToTable && link?.toColumn === col.name
                              ? 'pk'
                              : isFromTable && link?.fromColumn === col.name
                                ? 'fk'
                                : undefined);
                          const isCellTarget =
                            (isRowTarget && (isLinkedCol || col.highlight)) ||
                            (col.highlight && table.highlightRow === undefined);

                          const isCellActive = isCellTarget && rowFocus.active > 0.25;

                          const cellColor = isCellActive
                            ? effectiveRole === 'pk'
                              ? theme.good
                              : effectiveRole === 'fk'
                                ? theme.warn
                                : theme.ink
                            : isRowHighlighted
                              ? theme.text
                              : theme.muted;

                          const pulseGlow =
                            isCellActive && rowFocus.pulse > 0.05
                              ? `inset 0 0 0 1.5px ${cellColor}`
                              : undefined;

                          return (
                            <div
                              key={col.name}
                              style={{
                                padding: '7px 10px',
                                borderRight:
                                  colIdx < columns.length - 1 ? `1px solid ${theme.border}` : undefined,
                                boxShadow: pulseGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 17.5,
                                  fontWeight: isCellActive || isRowHighlighted ? 700 : 500,
                                  color: cellColor,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cellVal}
                              </span>
                              {isCellActive && (isLinkedCol || col.highlight) && (
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: cellColor,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isFromTable ? '──►' : '✓'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Enter>
          );
        })}
      </div>

      {/* Animated SVG Relationship Connector Bar (orders.user_id = 42 ──► users.id = 42) */}
      {link && (
        <div
          style={{
            opacity: fkColFocus.active,
            padding: '8px 14px',
            borderRadius: 10,
            background: theme.paperElevated,
            border: `1px solid ${pkColFocus.isActive ? theme.goodBorder : theme.borderStrong}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {/* Left: Source Foreign Key Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 8,
              background: theme.warnTint,
              border: `1px solid ${theme.warnBorder}`,
              boxShadow: fkValFocus.pulse > 0.1 ? `0 0 18px rgba(251, 146, 60, 0.28)` : undefined,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: theme.warn,
                background: theme.paper,
                padding: '1px 5px',
                borderRadius: 4,
                border: `1px solid ${theme.warnBorder}`,
              }}
            >
              FK
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>
              {link.fromTable}.{link.fromColumn}
              {resolvedLinkValue !== undefined && fkValFocus.isActive && (
                <span style={{ color: theme.warn }}> = {resolvedLinkValue}</span>
              )}
            </span>
          </div>

          {/* Center: Animated SVG Connector Path + Signal Pulse + Label */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 140,
            }}
          >
            <svg
              viewBox="0 0 220 30"
              style={{ width: '100%', height: 30, overflow: 'visible' }}
              preserveAspectRatio="none"
            >
              {/* Base track */}
              <line
                x1={4}
                y1={15}
                x2={210}
                y2={15}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              {/* Animated active link line */}
              <line
                x1={4}
                y1={15}
                x2={210}
                y2={15}
                stroke={pkColFocus.isActive ? theme.good : theme.warn}
                strokeWidth={2.75}
                strokeDasharray={206}
                strokeDashoffset={206 * (1 - connectorDraw)}
                strokeLinecap="round"
              />
              {/* Arrowhead */}
              {connectorDraw > 0.85 && (
                <polygon
                  points="216,15 204,9 204,21"
                  fill={pkColFocus.isActive ? theme.good : theme.warn}
                   opacity={(connectorDraw - 0.85) / 0.15}
                />
              )}
              {/* Traveling signal pulse dot */}
              {connectorDraw > 0.02 && connectorDraw < 0.99 && (
                <circle
                  cx={4 + connectorDraw * 206}
                  cy={15}
                  r={5}
                  fill={theme.ink}
                />
              )}
            </svg>
            <span
              style={{
                position: 'absolute',
                fontSize: 11,
                fontWeight: 800,
                color: pkColFocus.isActive ? theme.good : theme.ink,
                background: theme.paper,
                border: `1px solid ${pkColFocus.isActive ? theme.goodBorder : theme.borderStrong}`,
                padding: '2px 9px',
                borderRadius: 999,
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                opacity: connectorDraw > 0.15 ? 1 : 0,
              }}
            >
              {link.label ?? 'REFERENCES'} ──►
            </span>
          </div>

          {/* Right: Target Primary Key Pill */}
          <div
            style={{
              opacity: Math.max(0.35, pkColFocus.active),
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 8,
              background: pkColFocus.isActive ? theme.goodTint : theme.paper,
              border: `1px solid ${pkColFocus.isActive ? theme.goodBorder : theme.border}`,
              boxShadow: pkColFocus.pulse > 0.1 ? `0 0 18px rgba(34, 197, 94, 0.28)` : undefined,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: theme.good,
                background: theme.paper,
                padding: '1px 5px',
                borderRadius: 4,
                border: `1px solid ${theme.goodBorder}`,
              }}
            >
              PK
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>
              {link.toTable}.{link.toColumn}
              {resolvedLinkValue !== undefined && pkColFocus.isActive && (
                <span style={{ color: theme.good }}>
                  {' '}
                  = {resolvedLinkValue}
                  {resolvedTargetLabel ? ` (${resolvedTargetLabel})` : ''}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Valid vs. Invalid Reference Verification Strip (Referential Integrity) */}
      {integrityChecks.length > 0 && (
        <div
          style={{
            opacity: footerSlide.opacity,
            transform: footerSlide.transform,
            display: 'grid',
            gridTemplateColumns: `repeat(${integrityChecks.length}, minmax(0, 1fr))`,
            gap: 10,
          }}
        >
          {integrityChecks.map((chk, idx) => {
            const isValid = chk.valid;
            const toneColor = isValid ? theme.good : theme.bad;
            const toneTint = isValid ? theme.goodTint : theme.badTint;
            const toneBorder = isValid ? theme.goodBorder : theme.badBorder;
            return (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: toneTint,
                  border: `1px solid ${toneBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: toneColor,
                      background: theme.paper,
                      border: `1px solid ${toneBorder}`,
                      padding: '1px 6px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    {isValid ? '✓ VALID' : '✗ INVALID'}
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: theme.text,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {link ? `${link.fromColumn} = ${chk.value}` : `key = ${chk.value}`}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: toneColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  → {chk.detail}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Footer: Left ResultBadge + Right-Aligned Arabic Explanation Note (Safe from Character) */}
      {(viz.note || result) && (
        <div
          style={{
            opacity: footerSlide.opacity,
            transform: footerSlide.transform,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            paddingTop: 6,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          {result ? (
            <ResultBadge text={result} delay={footerBeat} tone="good" />
          ) : (
            <span style={{ fontSize: 14, color: theme.muted }}>RELATIONAL INTEGRITY</span>
          )}

          {viz.note && (
            <div
              dir="rtl"
              style={{
                flex: 1,
                direction: 'rtl',
                textAlign: 'right',
                fontFamily: ARABIC_FONT,
                fontSize: 21,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              <BidiText>{viz.note}</BidiText>
            </div>
          )}
        </div>
      )}
    </Box>
  );
};
