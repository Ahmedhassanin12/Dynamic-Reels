import { useCurrentFrame } from 'remotion';
import { BidiText } from '../components/BidiText';
import { Box } from '../components/Box';
import { Enter } from '../components/Enter';
import { RELATION } from '../config';
import { ARABIC_FONT, CODE_FONT } from '../lib/fonts';
import { useTheme } from '../lib/theme';
import type {
  RelationColumn,
  RelationColumnInput,
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
 * Displays 1 or 2 database tables with PK/FK column badges, sample rows, and an animated FK -> PK relationship link.
 */
export const RelationViz = ({ viz, result }: VizProps<'relation'>) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const stagger = viz.framesPerStep ?? RELATION.stepStaggerFrames;
  const tables = viz.tables.slice(0, 2);
  const link = viz.link;

  // Normalize columns for each table
  const normalizedTables = tables.map((table) => ({
    table,
    columns: table.columns.map((c) => normalizeColumn(c, table)),
  }));

  // Resolve matched key value for the relationship if `link` is configured
  let resolvedLinkValue: string | undefined = link?.value !== undefined ? String(link.value) : undefined;
  if (link && resolvedLinkValue === undefined) {
    const fromEntry = normalizedTables.find((t) => t.table.name === link.fromTable);
    const toEntry = normalizedTables.find((t) => t.table.name === link.toTable);
    if (fromEntry && toEntry) {
      const fromColIdx = fromEntry.columns.findIndex((c) => c.name === link.fromColumn);
      const toColIdx = toEntry.columns.findIndex((c) => c.name === link.toColumn);
      if (fromColIdx !== -1 && toColIdx !== -1) {
        const toValues = new Set(toEntry.table.rows.map((r) => getCellValue(r, toEntry.columns, toColIdx)));
        for (const row of fromEntry.table.rows) {
          const candidate = getCellValue(row, fromEntry.columns, fromColIdx);
          if (candidate && toValues.has(candidate)) {
            resolvedLinkValue = candidate;
            break;
          }
        }
      }
    }
  }

  const hasAnyFk =
    Boolean(link) || normalizedTables.some(( entry ) => entry.columns.some((c) => c.role === 'fk'));

  const gridTemplateColumns =
    normalizedTables.length === 1
      ? '1fr'
      : normalizedTables.map((entry) => `${Math.max(1, entry.columns.length * 0.45)}fr`).join(' ');

  return (
    <Box
      style={{
        direction: 'ltr',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: CODE_FONT,
      }}
    >
      {/* Top Header: Schema Label + PK/FK Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: theme.tint,
              border: `1px solid ${theme.borderStrong}`,
              color: theme.ink,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {link ? 'RELATIONAL DB · FK → PK' : 'RELATIONAL DB · TABLE'}
          </span>
          <span style={{ fontSize: 16, color: theme.muted }}>
            {link
              ? `${link.fromTable}.${link.fromColumn} → ${link.toTable}.${link.toColumn}`
              : tables.map((t) => t.name).join(' · ')}
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
              fontSize: 13,
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
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              FK · Foreign Key
            </span>
          )}
        </div>
      </div>

      {/* Tables Grid (1 or 2 Tables) */}
      <div style={{ display: 'grid', gridTemplateColumns, gap: 14, alignItems: 'start' }}>
        {normalizedTables.map(({ table, columns }, tableIdx) => {
          const isFromTable = link?.fromTable === table.name;
          const isToTable = link?.toTable === table.name;

          const tableBorder =
            table.tone === 'good' || isToTable
              ? theme.goodBorder
              : table.tone === 'warn' || isFromTable
                ? theme.warnBorder
                : table.tone === 'ink'
                  ? theme.borderStrong
                  : theme.borderStrong;

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
            <Enter key={table.name} delay={tableIdx * stagger}>
              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${tableBorder}`,
                  background: theme.paperElevated,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Table Title Bar */}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.24)',
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
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: headerAccent,
                      }}
                    />
                    <span style={{ fontSize: 19, fontWeight: 700, color: theme.text }}>{table.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: headerAccent,
                      background: theme.paper,
                      border: `1px solid ${tableBorder}`,
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
                    const isColHighlighted = col.highlight || isLinkedCol;

                    const roleColor =
                      effectiveRole === 'pk'
                        ? theme.good
                        : effectiveRole === 'fk'
                          ? theme.warn
                          : isColHighlighted
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

                    return (
                      <div
                        key={col.name}
                        style={{
                          padding: '8px 10px',
                          borderRight: colIdx < columns.length - 1 ? `1px solid ${theme.border}` : undefined,
                          background: isColHighlighted ? 'rgba(255, 255, 255, 0.03)' : undefined,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: isColHighlighted || effectiveRole ? theme.text : theme.muted,
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
                    // Check if this row matches the linked FK/PK value
                    const linkedColIdx = isFromTable
                      ? columns.findIndex((c) => c.name === link?.fromColumn)
                      : isToTable
                        ? columns.findIndex((c) => c.name === link?.toColumn)
                        : -1;
                    const linkedCellVal =
                      linkedColIdx !== -1 ? getCellValue(row, columns, linkedColIdx) : undefined;
                    const isRowLinkedMatch =
                      resolvedLinkValue !== undefined && linkedCellVal === resolvedLinkValue;
                    const isRowHighlighted = table.highlightRow === rowIdx || isRowLinkedMatch;

                    const rowTint = isRowHighlighted
                      ? isToTable
                        ? theme.goodTint
                        : isFromTable
                          ? theme.warnTint
                          : theme.tint
                      : 'transparent';

                    return (
                      <div
                        key={rowIdx}
                        style={{
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
                          const isCellActive =
                            (isRowHighlighted && (isLinkedCol || col.highlight)) ||
                            (col.highlight && table.highlightRow === undefined);

                          const cellColor = isCellActive
                            ? effectiveRole === 'pk'
                              ? theme.good
                              : effectiveRole === 'fk'
                                ? theme.warn
                                : theme.ink
                            : isRowHighlighted
                              ? theme.text
                              : theme.muted;

                          return (
                            <div
                              key={col.name}
                              style={{
                                padding: '9px 10px',
                                borderRight:
                                  colIdx < columns.length - 1 ? `1px solid ${theme.border}` : undefined,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: isCellActive || isRowHighlighted ? 700 : 500,
                                  color: cellColor,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cellVal}
                              </span>
                              {isCellActive && isLinkedCol && (
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: cellColor,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isFromTable ? '→' : '✓'}
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

      {/* Relationship Connector Bar (orders.user_id = 42 ──► users.id = 42) */}
      {link && (
        <Enter delay={normalizedTables.length * stagger}>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: theme.paperElevated,
              border: `1px solid ${theme.borderStrong}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            {/* Source Foreign Key Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 8,
                background: theme.warnTint,
                border: `1px solid ${theme.warnBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: theme.warn,
                  background: theme.paper,
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: `1px solid ${theme.warnBorder}`,
                }}
              >
                FK
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>
                {link.fromTable}.{link.fromColumn}
                {resolvedLinkValue !== undefined && (
                  <span style={{ color: theme.warn }}> = {resolvedLinkValue}</span>
                )}
              </span>
            </div>

            {/* Arrow + Relationship Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
              <div style={{ height: 2, flex: 1, maxWidth: 48, background: theme.warnBorder }} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.ink,
                  background: theme.tint,
                  border: `1px solid ${theme.borderStrong}`,
                  padding: '3px 10px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label ?? 'REFERENCES'} ──►
              </span>
              <div style={{ height: 2, flex: 1, maxWidth: 48, background: theme.goodBorder }} />
            </div>

            {/* Target Primary Key Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 8,
                background: theme.goodTint,
                border: `1px solid ${theme.goodBorder}`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: theme.good,
                  background: theme.paper,
                  padding: '1px 6px',
                  borderRadius: 4,
                  border: `1px solid ${theme.goodBorder}`,
                }}
              >
                PK
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>
                {link.toTable}.{link.toColumn}
                {resolvedLinkValue !== undefined && (
                  <span style={{ color: theme.good }}> = {resolvedLinkValue}</span>
                )}
              </span>
            </div>
          </div>
        </Enter>
      )}

      {/* Bottom Note or Result Badge */}
      {(viz.note || result) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            paddingTop: 8,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          {viz.note ? (
            <div
              style={{
                direction: 'rtl',
                fontFamily: ARABIC_FONT,
                fontSize: 22,
                fontWeight: 600,
                color: theme.text,
              }}
            >
              <BidiText>{viz.note}</BidiText>
            </div>
          ) : (
            <span style={{ fontSize: 16, color: theme.muted }}>RELATIONAL INTEGRITY</span>
          )}
          {result && (
            <ResultBadge
              text={result}
              delay={Math.min(frame, (normalizedTables.length + (link ? 1 : 0)) * stagger)}
              tone="good"
            />
          )}
        </div>
      )}
    </Box>
  );
};
