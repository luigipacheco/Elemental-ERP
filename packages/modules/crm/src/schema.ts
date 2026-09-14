import { FieldType, type TableDefinition } from '@elemental/sdk';

/**
 * CRM tables. Order matters: tables that are referenced by `LinkToAnotherRecord`
 * fields must be created first. The seed orchestrator already handles this in
 * two passes (tables first, links second), so any order here is safe, but we
 * keep them in domain-logical order for readers.
 */
export const schema: TableDefinition[] = [
  {
    name: 'companies',
    title: 'Companies',
    icon: '🏢',
    fields: [
      { name: 'name', title: 'Name', type: FieldType.SingleLineText, required: true, isDisplayValue: true },
      { name: 'domain', title: 'Domain', type: FieldType.URL },
      { name: 'industry', title: 'Industry', type: FieldType.SingleLineText },
      {
        name: 'size',
        title: 'Size',
        type: FieldType.SingleSelect,
        options: [
          { title: '1-10' },
          { title: '11-50' },
          { title: '51-200' },
          { title: '201-1000' },
          { title: '1000+' },
        ],
      },
      { name: 'country', title: 'Country', type: FieldType.SingleLineText },
      { name: 'notes', title: 'Notes', type: FieldType.LongText },
    ],
    views: [
      { name: 'All', type: 'grid' },
      { name: 'Recently added', type: 'grid', sort: [{ field: 'CreatedAt', direction: 'desc' }] },
    ],
  },
  {
    name: 'contacts',
    title: 'Contacts',
    icon: '👤',
    fields: [
      { name: 'first_name', title: 'First name', type: FieldType.SingleLineText, required: true, isDisplayValue: true },
      { name: 'last_name', title: 'Last name', type: FieldType.SingleLineText },
      { name: 'email', title: 'Email', type: FieldType.Email },
      { name: 'phone', title: 'Phone', type: FieldType.PhoneNumber },
      { name: 'title', title: 'Job title', type: FieldType.SingleLineText },
      {
        name: 'company',
        title: 'Company',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'companies' },
      },
      {
        name: 'tags',
        title: 'Tags',
        type: FieldType.MultiSelect,
        options: [
          { title: 'lead' },
          { title: 'customer' },
          { title: 'partner' },
          { title: 'vip' },
        ],
      },
      { name: 'owner', title: 'Owner', type: FieldType.SingleLineText, description: 'Internal username of the deal owner' },
    ],
    views: [
      { name: 'All', type: 'grid' },
      { name: 'My contacts', type: 'grid' },
    ],
  },
  {
    name: 'deals',
    title: 'Deals',
    icon: '💼',
    fields: [
      { name: 'title', title: 'Title', type: FieldType.SingleLineText, required: true, isDisplayValue: true },
      { name: 'value', title: 'Value', type: FieldType.Currency, defaultValue: '0' },
      {
        name: 'currency',
        title: 'Currency',
        type: FieldType.SingleSelect,
        defaultValue: 'USD',
        options: [{ title: 'USD' }, { title: 'EUR' }, { title: 'MXN' }, { title: 'GBP' }],
      },
      {
        name: 'stage',
        title: 'Stage',
        type: FieldType.SingleSelect,
        defaultValue: 'Lead',
        options: [
          { title: 'Lead' },
          { title: 'Qualified' },
          { title: 'Proposal' },
          { title: 'Won' },
          { title: 'Lost' },
        ],
      },
      { name: 'close_date', title: 'Close date', type: FieldType.Date },
      {
        name: 'company',
        title: 'Company',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'companies' },
      },
      {
        name: 'primary_contact',
        title: 'Primary contact',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'contacts' },
      },
      { name: 'owner', title: 'Owner', type: FieldType.SingleLineText },
    ],
    views: [
      { name: 'Pipeline', type: 'kanban', groupBy: 'stage' },
      { name: 'All deals', type: 'grid' },
      {
        name: 'Closing this month',
        type: 'grid',
        sort: [{ field: 'close_date', direction: 'asc' }],
      },
      { name: 'Won deals', type: 'grid', filter: [{ field: 'stage', operator: 'eq', value: 'Won' }] },
    ],
  },
  {
    name: 'activities',
    title: 'Activities',
    icon: '📞',
    fields: [
      { name: 'subject', title: 'Subject', type: FieldType.SingleLineText, required: true, isDisplayValue: true },
      {
        name: 'type',
        title: 'Type',
        type: FieldType.SingleSelect,
        defaultValue: 'note',
        options: [
          { title: 'call' },
          { title: 'email' },
          { title: 'meeting' },
          { title: 'note' },
        ],
      },
      { name: 'body', title: 'Body', type: FieldType.LongText },
      { name: 'due_at', title: 'Due at', type: FieldType.DateTime },
      { name: 'completed_at', title: 'Completed at', type: FieldType.DateTime },
      {
        name: 'related_type',
        title: 'Related to type',
        type: FieldType.SingleSelect,
        options: [
          { title: 'company' },
          { title: 'contact' },
          { title: 'deal' },
        ],
        description: 'Polymorphic: which collection the related record lives in',
      },
      {
        name: 'related_company',
        title: 'Company',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'companies' },
      },
      {
        name: 'related_contact',
        title: 'Contact',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'contacts' },
      },
      {
        name: 'related_deal',
        title: 'Deal',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'deals' },
      },
      { name: 'owner', title: 'Owner', type: FieldType.SingleLineText },
    ],
    views: [
      { name: 'Today', type: 'grid' },
      { name: 'Overdue', type: 'grid' },
      { name: 'By type', type: 'kanban', groupBy: 'type' },
    ],
  },
  {
    name: 'tasks',
    title: 'Tasks',
    icon: '✅',
    fields: [
      { name: 'title', title: 'Title', type: FieldType.SingleLineText, required: true, isDisplayValue: true },
      { name: 'due_at', title: 'Due at', type: FieldType.DateTime },
      {
        name: 'priority',
        title: 'Priority',
        type: FieldType.SingleSelect,
        defaultValue: 'medium',
        options: [
          { title: 'low' },
          { title: 'medium' },
          { title: 'high' },
          { title: 'urgent' },
        ],
      },
      {
        name: 'status',
        title: 'Status',
        type: FieldType.SingleSelect,
        defaultValue: 'todo',
        options: [
          { title: 'todo' },
          { title: 'in_progress' },
          { title: 'done' },
          { title: 'cancelled' },
        ],
      },
      { name: 'assignee', title: 'Assignee', type: FieldType.SingleLineText },
      {
        name: 'related_type',
        title: 'Related to type',
        type: FieldType.SingleSelect,
        options: [
          { title: 'company' },
          { title: 'contact' },
          { title: 'deal' },
        ],
      },
      {
        name: 'related_company',
        title: 'Company',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'companies' },
      },
      {
        name: 'related_contact',
        title: 'Contact',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'contacts' },
      },
      {
        name: 'related_deal',
        title: 'Deal',
        type: FieldType.LinkToAnotherRecord,
        relation: { type: 'bt', targetTable: 'deals' },
      },
    ],
    views: [
      { name: 'My tasks', type: 'kanban', groupBy: 'status' },
      { name: 'All tasks', type: 'grid' },
    ],
  },
];
