export type ExecutionStep = {
  /** 1-based line number in the code snippet */
  line: number;
  /** Console output emitted at this step */
  output?: string;
  /** Variable state snapshot at this step */
  vars?: Record<string, string>;
  /** Short educational note for this step */
  note?: string;
};

export type EventLoopStep = {
  /** Optional 1-based active line number in the code snippet */
  line?: number;
  /** Frames currently on the Call Stack (bottom-to-top or top-to-bottom) */
  stack: string[];
  /** Active Web API timers/requests */
  webApis?: string[];
  /** Callbacks waiting in the Microtask Queue (Promises) */
  microtasks: string[];
  /** Callbacks waiting in the Task / Macrotask Queue (setTimeout, I/O) */
  tasks: string[];
  /** Console outputs emitted up to this step */
  output?: string[];
  /** Which runtime zone is currently active */
  activeZone?: 'stack' | 'webApi' | 'microtask' | 'task' | 'loop';
  /** Short explanation of what happens in this tick */
  note?: string;
};

export type StackSlot = {
  name: string;
  value: string;
  /** Optional Heap object id this variable points to (e.g. "0x4F2A") */
  ref?: string;
  changed?: boolean;
};

export type HeapObject = {
  id: string;
  label: string;
  entries: Record<string, string>;
  /** Optional property key that was mutated through a shared reference */
  mutatedKey?: string;
};

export type ComplexityCurve = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n²)';

export type LinkedListNode = {
  value: string | number;
  /** Address or identifier for this node (e.g. "0x1A", "0x4F") */
  address?: string;
  /** Target pointer: next node address or null/undefined for tail */
  next?: string | null;
  /** Highlight state */
  highlight?: boolean;
  /** Optional badge on the node (e.g. "HEAD", "TAIL", "NEW") */
  badge?: string;
  tone?: 'good' | 'bad' | 'warn' | 'ink';
};

export type LinkedListNodeInput = string | number | LinkedListNode;

export type RelationKeyRole = 'pk' | 'fk';

export type RelationColumn = {
  /** Column identifier used in row records (e.g. "id", "user_id", "name") */
  name: string;
  /** Optional display label (defaults to `name`) */
  label?: string;
  /** Key role badge: 'pk' (Primary Key) or 'fk' (Foreign Key) */
  role?: RelationKeyRole;
  /** Shorthand boolean for Primary Key */
  pk?: boolean;
  /** Shorthand boolean for Foreign Key */
  fk?: boolean;
  /** Visually highlight this column */
  highlight?: boolean;
};

export type RelationColumnInput = string | RelationColumn;

export type RelationRowInput = (string | number)[] | Record<string, string | number>;

export type RelationTable = {
  /** Table name (e.g. "users", "orders") */
  name: string;
  /** Optional subtitle or badge on the table header (e.g. "PARENT TABLE", "CHILD TABLE") */
  badge?: string;
  /** Columns in display order */
  columns: RelationColumnInput[];
  /** Sample rows (each row can be a tuple in column order or a column-keyed record) */
  rows: RelationRowInput[];
  /** Optional 0-based row index to highlight */
  highlightRow?: number;
  /** Optional column names to highlight */
  highlightColumns?: string[];
  /** Optional visual tone for the table card */
  tone?: 'good' | 'ink' | 'warn' | 'paper';
};

export type RelationLink = {
  /** Source (Foreign Key) table name, e.g. "orders" */
  fromTable: string;
  /** Source (Foreign Key) column name, e.g. "user_id" */
  fromColumn: string;
  /** Target (Primary Key) table name, e.g. "users" */
  toTable: string;
  /** Target (Primary Key) column name, e.g. "id" */
  toColumn: string;
  /** Optional matched key value to highlight across both tables (e.g. 42) */
  value?: string | number;
  /** Optional relationship label (e.g. "REFERENCES", "1:N") */
  label?: string;
};

export type AsyncState = 'pending' | 'fulfilled' | 'rejected' | 'running' | 'idle';

export type AsyncStep = {
  label: string;
  status: AsyncState;
  value?: string;
  mainThread?: string;
  note?: string;
};

export type AsyncLane = {
  name: string;
  operation: string;
  status: 'idle' | 'running' | 'done' | 'blocked' | 'error';
  progress?: number;
};

export type VizConfig =
  | { type: 'scan'; cells: string[]; target: number }
  | { type: 'lookup'; key: string; buckets: number; hit: number; valuePreview?: string; subtitle?: string }
  | { type: 'execution'; steps: ExecutionStep[]; framesPerStep?: number }
  | { type: 'eventLoop'; steps: EventLoopStep[]; framesPerStep?: number }
  | {
      type: 'callStack';
      frames: string[];
      returns?: string[];
      lines?: number[];
      mode?: 'stack' | 'queue';
      framesPerStep?: number;
    }
  | {
      type: 'binarySearch';
      cells: (string | number)[];
      targetIndex: number;
      framesPerStep?: number;
    }
  | {
      type: 'memory';
      stack: StackSlot[];
      heap: HeapObject[];
      note?: string;
    }
  | {
      type: 'complexity';
      curves?: ComplexityCurve[];
      highlight?: ComplexityCurve;
      note?: string;
    }
  | {
      type: 'linkedList';
      nodes: LinkedListNodeInput[];
      activePointer?: number | string;
      pointerLabel?: string;
      note?: string;
      framesPerStep?: number;
    }
  | {
      type: 'asyncFlow';
      mode?: 'promise' | 'waterfall';
      promise?: {
        name?: string;
        state: 'pending' | 'fulfilled' | 'rejected';
        settledValue?: string;
        durationMs?: number;
      };
      lanes?: AsyncLane[];
      steps?: AsyncStep[];
      framesPerStep?: number;
      note?: string;
    }
  | {
      type: 'relation';
      tables: RelationTable[];
      link?: RelationLink;
      note?: string;
      framesPerStep?: number;
    };

export type VizType = VizConfig['type'];
export type VizProps<K extends VizType> = { viz: Extract<VizConfig, { type: K }>; result?: string };
