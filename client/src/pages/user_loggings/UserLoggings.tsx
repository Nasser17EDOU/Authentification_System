import { useState } from "react";
import {
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid/internals";
import { useQuery } from "@tanstack/react-query";
import { sessionDataContext } from "../../context/SessionContext";
import { userApi } from "../../api/user.api";
import type { Logging } from "../../utilities/interfaces/logging.interface";
import type { User } from "../../utilities/interfaces/user.interface";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { ActionButton } from "../../components/ActionButtons";
import { Refresh } from "@mui/icons-material";

type LoggingType = Logging & {
  login: User["login"];
  nom: User["nom"];
  prenom: User["prenom"];
};

export default function UserLoggings() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const gridFontSize = isSmallScreen ? "0.7rem" : "0.875rem";
  const { updateSessionData } = sessionDataContext();
  const userApis = userApi(updateSessionData);

  const initFormData: {
    dateDebut: Date | null;
    dateFin: Date | null;
    searchValue: string | null;
  } = { dateDebut: null, dateFin: null, searchValue: null };

  const [formData, setFormData] = useState({ ...initFormData });

  const {
    data: loggings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "userLoggings",
      formData.dateDebut,
      formData.dateFin,
      formData.searchValue?.trim() || null,
    ],
    queryFn: async () =>
      !formData.dateDebut &&
      !formData.dateFin &&
      !(formData.searchValue?.trim() || null)
        ? []
        : (await userApis.searchUserLoggingsApi({
            ...formData,
            searchValue: formData.searchValue?.trim() || null,
          })) ?? [],
  });

  // Column definitions
  const loggingColumns: GridColDef<LoggingType>[] = [
    { field: "login", headerName: "Login", flex: 1 },
    { field: "nom", headerName: "Nom", flex: 1 },
    { field: "prenom", headerName: "Prénom", flex: 1 },
    {
      field: "debut_logging",
      headerName: "Début de Connexion",
      flex: 1,
      type: "dateTime",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "last_activ_time",
      headerName: "Dernière activité",
      flex: 1,
      type: "dateTime",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
  ];

  // Event Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h6" fontWeight={600}>
          Liste des Connexions Utilisateurs
        </Typography>

        {/* Formulaire de filtre */}
        <form onSubmit={handleSubmit}>
          <Stack
            direction={isSmallScreen ? "column" : "row"}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Recherche (login, nom, prénom)"
              size="small"
              value={formData.searchValue ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  searchValue: e.target.value,
                }))
              }
            />
            <DateTimePicker
              label="Date Début"
              value={formData.dateDebut ?? null}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  dateDebut: date,
                }))
              }
              ampm={false}
              slotProps={{ textField: { size: "small" } }}
            />
            <DateTimePicker
              label="Date Fin"
              value={formData.dateFin ?? null}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dateFin: date }))
              }
              ampm={false}
              slotProps={{ textField: { size: "small" } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                !formData.dateDebut &&
                !formData.dateFin &&
                !(formData.searchValue?.trim() || null)
              }
              sx={{ minWidth: 120 }}
            >
              Rechercher
            </Button>
            <ActionButton
              tooltip="Rafreshir"
              icon={<Refresh />}
              onClick={() => setFormData({ ...initFormData })}
            />
          </Stack>
        </form>

        {/* Table */}
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Stack sx={{ width: "100%", height: "60vh", overflow: "auto" }}>
            <DataGrid<LoggingType>
              rows={loggings ?? []}
              columns={loggingColumns}
              getRowId={(row) => row.logging_id}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  printOptions: {
                    disableToolbarButton: true,
                    hideToolbar: true,
                    hideFooter: true,
                  },
                  csvOptions: { fileName: "connexions_utilisateurs" },
                },
              }}
              showToolbar
              sx={{
                fontSize: gridFontSize,
                "& .MuiDataGrid-cell": { fontSize: gridFontSize },
                "& .MuiDataGrid-columnHeaders": { fontSize: gridFontSize },
                "& .MuiDataGrid-footerContainer": { fontSize: gridFontSize },
              }}
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
