import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

export function CenterLayout({children}: {children: React.ReactNode}): React.ReactElement {
  return (
    <Grid container
      columns={{ xs: 4, sm: 8, md: 12 }}
      justifyContent="center">
      <Grid xs={4} sm={4} md={4}>
        {children}
      </Grid>
    </Grid>
  );
}
