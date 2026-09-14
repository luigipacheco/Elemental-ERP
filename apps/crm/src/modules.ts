import { crmModule } from '@elemental/module-crm';
import type { ErpModule } from '@elemental/sdk';

/**
 * Modules registered in this build of the host app. Add a module:
 *   1. Create packages/modules/<id>/
 *   2. Export an ErpModule from its index.ts
 *   3. Push it onto this array
 *   4. `pnpm seed` to apply its schema, then rebuild the app
 */
export const modules: ErpModule[] = [crmModule];
