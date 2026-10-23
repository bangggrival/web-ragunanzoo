export const dynamic = 'force-dynamic';

import { GET as getFavicon } from '@/app/api/favicon/route';

export async function GET(request: Request) {
  return getFavicon(request);
}
