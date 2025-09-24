import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatsCard({ title, value, changeLabel, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {changeLabel ? <p className="text-xs text-muted-foreground">{changeLabel}</p> : null}
      </CardContent>
    </Card>
  );
}





