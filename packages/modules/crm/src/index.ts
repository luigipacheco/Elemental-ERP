import { defineModule } from '@elemental/sdk';
import { schema } from './schema.js';
import { resources } from './resources.js';
import { navigation } from './navigation.js';

export const crmModule = defineModule({
  id: 'crm',
  name: 'CRM',
  version: '0.1.0',
  schema,
  resources,
  navigation,
});

export { schema, resources, navigation };
