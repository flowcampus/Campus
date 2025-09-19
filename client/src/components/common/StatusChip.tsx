import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
  showIcon?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  showIcon = false, 
  ...props 
}) => {
  const color = getStatusColor(status) as ChipProps['color'];
  const label = getStatusLabel(status);

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 600,
        textTransform: 'capitalize',
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StatusChip;