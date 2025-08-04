// import {
//   Box,
//   CircularProgress,
//   IconButton,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip,
//   TableSortLabel,
//   useTheme,
//   TableFooter,
//   TablePagination,
//   type IconButtonProps,
//   Checkbox,
//   Typography,
//   Button,
//   Avatar,
//   type TableContainerProps,
//   type TableProps,
//   type TableHeadProps,
//   type TableRowProps,
//   type TableBodyProps,
//   type TableCellProps,
// } from "@mui/material";
// import React, { useMemo, useState, useEffect } from "react";
// import { StyledTextField } from "./dialogUtils";
// import UseDebounce from "../contexts/UseDebounce";
// import { exportData } from "./exportationMiddleware";
// import { useUserSession } from "../contexts/UserSessionContext";
// import { getDateValueForSorting } from "./convertUtils";

// type RowsPerPageType = 5 | 10 | 25 | 50 | 75 | 100 | 200;
// type FieldType = {
//   undefineOrNullable?: boolean;
// } & (
//   | {
//       type: "text";
//     }
//   | {
//       type: "number";
//       options?: {
//         decimalPlaces?: number;
//         decimalSeparator?: string;
//         thousandsSeparator?: string;
//         currencyLabel?: string;
//         currencyLabelPosition?: "before" | "after";
//       };
//     }
//   | {
//       type: "date";
//       options?: {
//         locales?: Intl.LocalesArgument;
//         formatOptions?: Intl.DateTimeFormatOptions;
//       };
//     }
//   | {
//       type: "boolean";
//       options?: {
//         labelTrue?: string;
//         labelFalse?: string;
//       };
//     }
//   | {
//       type: "picture";
//     }
// );

// interface ColumnDef<T = any> {
//   colKey: keyof T;
//   colLabel: string;
//   sortableField?: boolean;
//   fieldType?: FieldType;
//   defautlValue?: string | number | boolean | Date;
//   headerCellProps?: TableCellProps;
//   headerRendered?: React.ReactNode;
//   bodyCellProps?: TableCellProps | ((dataId: number) => TableCellProps);
//   cellRendered?: React.ReactNode | ((dataId: number) => React.ReactNode);
// }

// interface TableComponentProps<T = any> {
//   columns: ColumnDef<T>[];
//   data: T[];
//   idKey: keyof T;

//   tableTitle?: React.ReactNode;
//   exportable?: boolean;

//   withCheck?: boolean;
//   selection?: "none" | "single" | "multiple";
//   selectedDataIds?: number[];
//   onSelectionChange?: (selectedDataIds: number[]) => void;

//   loading?: { loadingValue: boolean; loadingRender?: React.ReactNode };
//   emptyStateRender?: React.ReactNode;
//   actions?: React.ReactNode[] | ((dataId: number) => React.ReactNode[]);

//   tableContainerProps?: TableContainerProps;
//   tableProps?: TableProps;
//   tableHeadProps?: TableHeadProps;
//   tableHeadRowProps?: TableRowProps;
//   tableBodyProps?: TableBodyProps;
//   tableBodyRowProps?: TableRowProps | ((dataId: number) => TableRowProps);

//   withFilter?: boolean;

//   // Improved pagination props
//   pagination?:
//     | {
//         page: number;
//         rowsPerPage: number;
//         totalRows: number;
//         onPageChange: (page: number) => void;
//         onRowsPerPageChange: (rowsPerPage: number) => void;
//       }
//     | boolean; // Allow boolean for auto-managed pagination

//   onSort?: (sortBy: keyof T, sortDirection: "asc" | "desc") => void;
//   initialSort?: {
//     column: keyof T;
//     direction: "asc" | "desc";
//   };
//   sx?: React.ComponentProps<typeof TableContainer>["sx"];

//   // New props for large datasets
//   virtualized?: boolean; // Enable virtualization for large datasets
//   defaultRowsPerPage?: RowsPerPageType; // Default rows per page for auto-managed pagination
//   filterDebounce?: number; // Debounce time for filter (ms)
// }

// export const TableComponent = <T extends Record<string, any>>({
//   tableTitle,
//   columns,
//   data,
//   idKey,
//   loading = false,
//   emptyState,
//   tableId,
//   exportTable = false,
//   headerBgColor,
//   selectable = false,
//   selectedIds = [],
//   onSelectionChange,
//   multiSelectable = false,
//   withCheck = false,
//   withFilter = false,
//   actions = undefined,
//   pagination = false,
//   onSort,
//   initialSort,
//   sx,
//   defaultRowsPerPage = 10,
//   filterDebounce = 300,
// }: TableComponentProps<T>) => {
//   const { showAlert } = useUserSession();

//   const theme = useTheme();
//   const [internalSort, setInternalSort] = useState<{
//     column: keyof T;
//     direction: "asc" | "desc";
//   } | null>(initialSort || null);

//   // State for auto-managed pagination
//   const [autoPagination, setAutoPagination] = useState({
//     page: 0,
//     rowsPerPage: defaultRowsPerPage,
//   });

//   // Determine if we're using auto-managed pagination
//   const isPaginationEnabled = pagination !== false;
//   const isAutoPagination = pagination === true;

//   // Get the correct pagination values based on mode
//   // const paginationType = isAutoPagination
//   //   ? autoPagination
//   //   : typeof paginationProp === "object"
//   //   ? paginationProp
//   //   : undefined;

//   const isCheckable = (selectable || multiSelectable) && withCheck;

//   const [searchQuery, setSearchQuery] = useState("");
//   const debouncedSearchQuery = UseDebounce(searchQuery, filterDebounce);

//   // Handle sort changes
//   const handleSort = (column: keyof T) => {
//     const isCurrentColumn = internalSort?.column === column;
//     const newDirection =
//       isCurrentColumn && internalSort?.direction === "asc" ? "desc" : "asc";

//     const newSort = { column, direction: newDirection as "asc" | "desc" };
//     setInternalSort(newSort);
//     onSort?.(column, newDirection);
//   };

//   // Filter data based on search query
//   const filteredData = useMemo(() => {
//     if (!debouncedSearchQuery) return data;

//     const rowKeys = columns.map((col) => col.id);
//     return data.filter((row) => {
//       return rowKeys.some((key) => {
//         const value = row[key];
//         return String(value)
//           .toLowerCase()
//           .includes(debouncedSearchQuery.toLowerCase());
//       });
//     });
//   }, [data, debouncedSearchQuery, columns]);

//   // Sort data (client-side if no onSort provided)
//   // Sort data (client-side if no onSort provided)
//   const sortedData = useMemo(() => {
//     if (!internalSort || onSort) return filteredData; // Server-side sorting

//     return [...filteredData].sort((a, b) => {
//       const valA = a[internalSort.column];
//       const valB = b[internalSort.column];

//       // Find the column definition to check if it's a date column
//       const columnDef = columns.find((col) => col.id === internalSort.column);
//       const isDateColumn = columnDef?.type === "date";

//       if (isDateColumn) {
//         // Handle date comparison using your date format logic
//         const dateA = getDateValueForSorting(valA);
//         const dateB = getDateValueForSorting(valB);

//         // Both are valid dates - compare as dates
//         if (dateA && dateB) {
//           return internalSort.direction === "asc"
//             ? dateA.getTime() - dateB.getTime()
//             : dateB.getTime() - dateA.getTime();
//         }
//         // Only A is valid date - it comes first in asc, last in desc
//         else if (dateA) {
//           return internalSort.direction === "asc" ? -1 : 1;
//         }
//         // Only B is valid date - it comes first in asc, last in desc
//         else if (dateB) {
//           return internalSort.direction === "asc" ? 1 : -1;
//         }
//         // Both are invalid (including 'Pas de date') - compare as strings
//         else {
//           const strA = valA ? String(valA) : "";
//           const strB = valB ? String(valB) : "";
//           return internalSort.direction === "asc"
//             ? strA.localeCompare(strB)
//             : strB.localeCompare(strA);
//         }
//       }

//       // Original non-date sorting logic
//       if (valA == null) return 1;
//       if (valB == null) return -1;

//       if (typeof valA === "number" && typeof valB === "number") {
//         return internalSort.direction === "asc" ? valA - valB : valB - valA;
//       }

//       const stringA = String(valA);
//       const stringB = String(valB);

//       return internalSort.direction === "asc"
//         ? stringA.localeCompare(stringB)
//         : stringB.localeCompare(stringA);
//     });
//   }, [filteredData, internalSort, onSort, columns]);

//   // Handle pagination changes for auto-managed mode
//   const handleAutoPageChange = (newPage: number) => {
//     setAutoPagination((prev) => ({ ...prev, page: newPage }));
//   };

//   const handleAutoRowsPerPageChange = (newRowsPerPage: RowsPerPageType) => {
//     setAutoPagination((prev) => ({
//       ...prev,
//       rowsPerPage: newRowsPerPage,
//       page: 0, // Reset to first page when rows per page changes
//     }));
//   };

//   // Get the current page data for auto-managed pagination
//   const paginatedData = useMemo(() => {
//     if (!isPaginationEnabled || !isAutoPagination) return sortedData;

//     const start = autoPagination.page * autoPagination.rowsPerPage;
//     const end = start + autoPagination.rowsPerPage;
//     return sortedData.slice(start, end);
//   }, [sortedData, isPaginationEnabled, isAutoPagination, autoPagination]);

//   // Reset to first page when search query changes
//   useEffect(() => {
//     if (isAutoPagination) {
//       setAutoPagination((prev) => ({ ...prev, page: 0 }));
//     }
//   }, [debouncedSearchQuery, isAutoPagination]);

//   // The data to actually render in the table
//   const displayData = isAutoPagination ? paginatedData : sortedData;
//   const totalRows = isAutoPagination
//     ? filteredData.length
//     : pagination === false
//     ? displayData.length
//     : pagination.totalRows;

//   const handleSelectRow = (rowId: string | number) => {
//     if (!onSelectionChange) return;

//     if (multiSelectable) {
//       const newSelectedIds = selectedIds.includes(rowId)
//         ? selectedIds.filter((id) => id !== rowId)
//         : [...selectedIds, rowId];
//       onSelectionChange(newSelectedIds);
//     } else {
//       onSelectionChange([rowId]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (!onSelectionChange || !multiSelectable) return;

//     const allSelected =
//       displayData.length > 0 &&
//       displayData.every((row) => selectedIds.includes(row[idKey]));
//     onSelectionChange(allSelected ? [] : displayData.map((row) => row[idKey]));
//   };

//   const handleExport = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     const workbookName =
//       tableTitle?.replace(/[^a-zA-Z0-9]/g, "_").trim() || "liste";
//     const isExported = await exportData.toExcel(workbookName, [
//       {
//         table: document.getElementById(tableId ?? "tableId"),
//         worksheetName: tableTitle || "Liste",
//       },
//     ]);
//     if (!isExported) {
//       showAlert(
//         "L'édition ne s'est pas passée comme prévu. Veuillez réessayer plus tard. Si celà persiste contactez l'administrateur."
//       );
//     }
//   };

//   const isSelected = (rowId: string | number) => selectedIds.includes(rowId);

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//       {/* Table Title and Filter */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Box>
//           {exportTable && (
//             <Button
//               disabled={loading}
//               variant="contained"
//               onClick={handleExport}
//             >
//               Editer
//             </Button>
//           )}
//           {tableTitle && (
//             <Typography
//               variant="h6"
//               sx={{
//                 fontWeight: 600,
//                 color: theme.palette.text.primary,
//                 pl: 1,
//                 mb: -1,
//               }}
//             >
//               {tableTitle}
//             </Typography>
//           )}
//         </Box>

//         {withFilter && (
//           <StyledTextField
//             fullWidth
//             margin="dense"
//             label="Rechercher..."
//             variant="outlined"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             slotProps={{
//               input: { inputProps: { maxLength: 100 } },
//             }}
//             sx={{ maxWidth: 400 }}
//           />
//         )}
//       </Box>

//       <TableContainer
//         id={tableId}
//         component={Paper}
//         sx={{
//           borderRadius: 2,
//           boxShadow: 3,
//           overflow: "auto",
//           maxHeight: "calc(100vh - 300px)",
//           position: "relative",
//           ...sx,
//         }}
//       >
//         {loading && (
//           <Box
//             sx={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(255,255,255,0.7)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: theme.zIndex.modal,
//             }}
//           >
//             <CircularProgress />
//           </Box>
//         )}

//         <Table stickyHeader>
//           <TableHead>
//             <TableRow
//               sx={{ bgcolor: headerBgColor || theme.palette.primary.main }}
//             >
//               {isCheckable && (
//                 <TableCell
//                   padding="checkbox"
//                   sx={{
//                     position: "sticky",
//                     left: 0,
//                     zIndex: theme.zIndex.appBar + 1,
//                     backgroundColor:
//                       headerBgColor || theme.palette.primary.main,
//                   }}
//                 >
//                   {multiSelectable && (
//                     <Checkbox
//                       indeterminate={
//                         selectedIds.length > 0 &&
//                         selectedIds.length < displayData.length
//                       }
//                       checked={
//                         displayData.length > 0 &&
//                         selectedIds.length === displayData.length
//                       }
//                       onChange={handleSelectAll}
//                       color="primary"
//                     />
//                   )}
//                 </TableCell>
//               )}

//               {columns.map((column) => (
//                 <TableCell
//                   key={column.id as string}
//                   align={column.align}
//                   width={column.width}
//                   sx={{
//                     minWidth: column.minWidth,
//                     position: column.sticky ? "sticky" : undefined,
//                     left: column.sticky === "left" ? 0 : undefined,
//                     right: column.sticky === "right" ? 0 : undefined,
//                     zIndex: column.sticky ? theme.zIndex.appBar : undefined,
//                     backgroundColor:
//                       headerBgColor || theme.palette.primary.main,
//                     color: theme.palette.primary.contrastText,
//                   }}
//                 >
//                   {column.sortable ? (
//                     <TableSortLabel
//                       active={internalSort?.column === column.id}
//                       direction={internalSort?.direction || "asc"}
//                       onClick={() => handleSort(column.id)}
//                       sx={{ color: "inherit !important" }}
//                     >
//                       {column.headerRender
//                         ? column.headerRender()
//                         : column.label}
//                     </TableSortLabel>
//                   ) : column.headerRender ? (
//                     column.headerRender()
//                   ) : (
//                     column.label
//                   )}
//                 </TableCell>
//               ))}

//               {actions && (
//                 <TableCell
//                   sx={{
//                     textAlign: "right",
//                     pr: 2,
//                     backgroundColor:
//                       headerBgColor || theme.palette.primary.main,
//                     color: theme.palette.common.white,
//                   }}
//                 >
//                   Actions
//                 </TableCell>
//               )}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {displayData.length === 0 && !loading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={
//                     columns.length + (isCheckable ? 1 : 0) + (actions ? 1 : 0)
//                   }
//                 >
//                   {emptyState || (
//                     <Box
//                       display="flex"
//                       justifyContent="center"
//                       alignItems="center"
//                       py={4}
//                       color="text.secondary"
//                     >
//                       Pas de données
//                     </Box>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ) : (
//               displayData.map((row, rowIndex) => {
//                 const rowId = row[idKey];
//                 const isRowSelected = isSelected(rowId);
//                 const isEvenRow = rowIndex % 2 === 0;

//                 return (
//                   <TableRow
//                     key={rowId}
//                     hover={selectable || multiSelectable}
//                     selected={isRowSelected}
//                     onClick={() =>
//                       (selectable || multiSelectable) && handleSelectRow(rowId)
//                     }
//                     sx={{
//                       cursor:
//                         selectable || multiSelectable ? "pointer" : "default",
//                       "&:last-child td": { borderBottom: 0 },
//                       backgroundColor: isRowSelected
//                         ? theme.palette.action.selected
//                         : isEvenRow
//                         ? theme.palette.background.default
//                         : "lightgray",
//                     }}
//                   >
//                     {isCheckable && (
//                       <TableCell
//                         padding="checkbox"
//                         sx={{
//                           backgroundColor: isRowSelected
//                             ? theme.palette.action.selected
//                             : isEvenRow
//                             ? theme.palette.background.default
//                             : "lightgray",
//                         }}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <Checkbox
//                           checked={isRowSelected}
//                           onChange={() => handleSelectRow(rowId)}
//                           color="primary"
//                         />
//                       </TableCell>
//                     )}

//                     {columns.map((column) => {
//                       const style = column.cellStyled
//                         ? typeof column.cellStyled === "function"
//                           ? column.cellStyled(rowId)
//                           : column.cellStyled
//                         : undefined;
//                       return (
//                         <TableCell
//                           key={column.id as string}
//                           align={column.align}
//                           sx={{
//                             backgroundColor: style
//                               ? style.bgColor
//                               : isRowSelected
//                               ? theme.palette.action.selected
//                               : undefined,
//                             verticalAlign:
//                               column.type === "picture" ? "middle" : undefined,
//                             color: style?.color ?? "",
//                           }}
//                         >
//                           {column.renderCell ? (
//                             column.renderCell(row)
//                           ) : column.type === "picture" ? (
//                             <Avatar
//                               src={
//                                 row[column.id]
//                                   ? `data:image/jpeg;base64,${row[column.id]}`
//                                   : "/default-avatar.png"
//                               }
//                               sx={{
//                                 width: 75,
//                                 height: 75,
//                                 border: "2px solid #e0e0e0",
//                                 // cursor: "pointer",
//                               }}
//                             />
//                           ) : (
//                             row[column.id]
//                           )}
//                         </TableCell>
//                       );
//                     })}

//                     {actions && (
//                       <TableCell
//                         align="right"
//                         onClick={(e) => e.stopPropagation()}
//                         sx={{
//                           backgroundColor: isRowSelected
//                             ? theme.palette.action.selected
//                             : isEvenRow
//                             ? theme.palette.background.default
//                             : "lightgray",
//                         }}
//                       >
//                         <Box display="flex" justifyContent="flex-end" gap={1}>
//                           {(typeof actions === "function"
//                             ? actions(rowId)
//                             : actions
//                           ).map((action, index) => {
//                             const disabled =
//                               typeof action.disabled === "function"
//                                 ? action.disabled(rowId)
//                                 : action.disabled;
//                             const tooltip =
//                               typeof action.tooltip === "function"
//                                 ? action.tooltip(rowId)
//                                 : action.tooltip;
//                             const color =
//                               typeof action.color === "function"
//                                 ? action.color(rowId)
//                                 : action.color;
//                             const icon =
//                               typeof action.icon === "function"
//                                 ? action.icon(rowId)
//                                 : action.icon;

//                             return (
//                               <Tooltip key={index} title={tooltip}>
//                                 <span>
//                                   <IconButton
//                                     color={color}
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       action.onClick(rowId);
//                                     }}
//                                     disabled={disabled}
//                                   >
//                                     {icon}
//                                   </IconButton>
//                                 </span>
//                               </Tooltip>
//                             );
//                           })}
//                         </Box>
//                       </TableCell>
//                     )}
//                   </TableRow>
//                 );
//               })
//             )}
//           </TableBody>

//           {isPaginationEnabled && (
//             <TableFooter>
//               <TableRow>
//                 <TableCell
//                   colSpan={
//                     columns.length + (isCheckable ? 1 : 0) + (actions ? 1 : 0)
//                   }
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="flex-start"
//                     alignItems="center"
//                   >
//                     <TablePagination
//                       rowsPerPageOptions={
//                         [5, 10, 25, 50, 75, 100, 200] as RowsPerPageType[]
//                       }
//                       labelRowsPerPage="Lignes par page :"
//                       labelDisplayedRows={({ from, to, count }) =>
//                         `${from}-${to} sur ${
//                           count !== -1 ? count : `plus que ${to}`
//                         }`
//                       }
//                       component="div"
//                       count={totalRows}
//                       rowsPerPage={
//                         isAutoPagination
//                           ? autoPagination.rowsPerPage
//                           : (pagination as any)?.rowsPerPage || 10
//                       }
//                       page={
//                         isAutoPagination
//                           ? autoPagination.page
//                           : (pagination as any)?.page || 0
//                       }
//                       onPageChange={(_, newPage) => {
//                         if (isAutoPagination) {
//                           handleAutoPageChange(newPage);
//                         } else {
//                           pagination.onPageChange(newPage);
//                         }
//                       }}
//                       onRowsPerPageChange={(e) => {
//                         const newRowsPerPage = Number(
//                           e.target.value
//                         ) as RowsPerPageType;
//                         if (isAutoPagination) {
//                           handleAutoRowsPerPageChange(newRowsPerPage);
//                         } else if (typeof pagination === "object") {
//                           pagination.onRowsPerPageChange(newRowsPerPage);
//                         }
//                       }}
//                       sx={{
//                         borderTop: `1px solid ${theme.palette.divider}`,
//                         width: "100%",
//                         "& .MuiTablePagination-toolbar": {
//                           paddingLeft: 0,
//                           flexWrap: "wrap",
//                           justifyContent: "flex-start",
//                         },
//                         "& .MuiTablePagination-selectLabel": {
//                           margin: 0,
//                           fontSize: "0.875rem",
//                         },
//                         "& .MuiTablePagination-displayedRows": {
//                           margin: 0,
//                           fontSize: "0.875rem",
//                         },
//                         "& .MuiTablePagination-actions": {
//                           marginLeft: theme.spacing(1),
//                         },
//                       }}
//                     />
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             </TableFooter>
//           )}
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };
