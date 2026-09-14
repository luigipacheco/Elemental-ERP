/**
 * NocoDB column types we care about. The string values match NocoDB's
 * `uidt` (UI Data Type) names so we can pass them straight to the meta-API.
 *
 * Reference: https://docs.nocodb.com/fields/field-types
 */
export const FieldType = {
  SingleLineText: 'SingleLineText',
  LongText: 'LongText',
  Email: 'Email',
  PhoneNumber: 'PhoneNumber',
  URL: 'URL',
  Number: 'Number',
  Decimal: 'Decimal',
  Currency: 'Currency',
  Percent: 'Percent',
  Date: 'Date',
  DateTime: 'DateTime',
  Time: 'Time',
  Checkbox: 'Checkbox',
  SingleSelect: 'SingleSelect',
  MultiSelect: 'MultiSelect',
  Attachment: 'Attachment',
  LinkToAnotherRecord: 'LinkToAnotherRecord',
  Lookup: 'Lookup',
  Rollup: 'Rollup',
  Formula: 'Formula',
  Geometry: 'Geometry',
  JSON: 'JSON',
  User: 'User',
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

export type SelectOption = {
  title: string;
  color?: string;
};

export type RelationType = 'mm' | 'hm' | 'bt' | 'oo';

export interface FieldDefinition {
  /** Column name as stored in DB. Lowercase + underscores by convention. */
  name: string;
  /** Optional display title. Falls back to `name`. */
  title?: string;
  type: FieldType;
  /** Required-at-DB level. */
  required?: boolean;
  /** Default value (string form, NocoDB stores defaults as strings). */
  defaultValue?: string;
  /** For SingleSelect / MultiSelect. */
  options?: SelectOption[];
  /** Helpful tooltip shown to admins/end-users. */
  description?: string;
  /** When type === LinkToAnotherRecord. */
  relation?: {
    type: RelationType;
    /** Table name in the same base. */
    targetTable: string;
  };
  /** When type === Formula. */
  formula?: string;
  /** Mark a column as the table's primary display value. */
  isDisplayValue?: boolean;
}

export type ViewType = 'grid' | 'kanban' | 'gallery' | 'form' | 'calendar';

export interface ViewDefinition {
  name: string;
  type: ViewType;
  /** For kanban: the SingleSelect column to group by. */
  groupBy?: string;
  /** Optional filter expression in NocoDB filter format. */
  filter?: NocoFilter[];
  /** Optional sort by column. */
  sort?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface NocoFilter {
  field: string;
  operator:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'nlike'
    | 'empty'
    | 'notempty'
    | 'is'
    | 'isnot';
  value?: string | number | boolean | null;
  logical?: 'and' | 'or';
}

export interface TableDefinition {
  /** Internal table name (lowercase + underscores by convention). */
  name: string;
  /** Display title shown in NocoDB UI and our app. */
  title: string;
  /** Optional emoji/icon shown in sidebar. */
  icon?: string;
  fields: FieldDefinition[];
  views?: ViewDefinition[];
}
