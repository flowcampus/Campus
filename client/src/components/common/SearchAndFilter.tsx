import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Typography,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface SearchAndFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  showAdvancedFilters?: boolean;
  loading?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  showAdvancedFilters = false,
  loading = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  
  const debouncedSearch = useDebounce(searchValue, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const activeFiltersCount = Object.values(filterValues).filter(
    value => value !== '' && value !== null && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const renderFilterField = (filter: FilterOption) => {
    const value = filterValues[filter.key] || '';

    switch (filter.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value}
              label={filter.label}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            label={filter.label}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={filter.label}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={filter.label}
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: 2 }}>
        {/* Main Search and Filter Row */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => onSearchChange('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {/* Quick Filters */}
              {filters.slice(0, 2).map((filter) => (
                <Box key={filter.key} sx={{ minWidth: 120 }}>
                  {renderFilterField(filter)}
                </Box>
              ))}

              {/* Advanced Filters Toggle */}
              {(filters.length > 2 || showAdvancedFilters) && (
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ minWidth: 120 }}
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Button>
              )}

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="text"
                  startIcon={<ClearIcon />}
                  onClick={onClearFilters}
                  color="secondary"
                >
                  Clear
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Advanced Filters
          </Typography>
          <Grid container spacing={2}>
            {filters.slice(2).map((filter) => (
              <Grid item xs={12} sm={6} md={4} key={filter.key}>
                {renderFilterField(filter)}
              </Grid>
            ))}
          </Grid>
        </Collapse>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Active Filters:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(filterValues)
                .filter(([_, value]) => 
                  value !== '' && value !== null && value !== undefined &&
                  (Array.isArray(value) ? value.length > 0 : true)
                )
                .map(([key, value]) => {
                  const filter = filters.find(f => f.key === key);
                  const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                  
                  return (
                    <Chip
                      key={key}
                      label={`${filter?.label}: ${displayValue}`}
                      size="small"
                      onDelete={() => onFilterChange(key, '')}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;