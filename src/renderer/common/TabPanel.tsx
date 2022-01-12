import { Box } from '@mui/material';
import { ReactNode } from 'react';

export interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}
export function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
