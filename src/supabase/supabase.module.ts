import { Module, Global } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { env } from 'src/env';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () => {
        return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);
      },
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
