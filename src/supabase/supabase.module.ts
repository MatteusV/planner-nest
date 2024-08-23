import { Module, Global } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () => {
        return createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE,
        );
      },
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
