import {
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid/internals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionDataContext } from "../../context/SessionContext";
import { ActionButton } from "../../components/ActionButtons";
import { Edit } from "@mui/icons-material";
import { passwordApi } from "../../api/password.api";
import type { PassParam } from "../../utilities/interfaces/passParam.interface";
import { formDialog } from "../../components/formDialog";

export default function PassParam() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const gridFontSize = isSmallScreen ? "0.7rem" : "0.875rem";
  const { sessionUserHasPermission, updateSessionData } = sessionDataContext();
  const passwordApis = passwordApi(updateSessionData);
  const queryClient = useQueryClient();

  const { data: passParam, isLoading } = useQuery({
    queryKey: ["passParam"],
    queryFn: async () => (await passwordApis.getPassParamApi()) ?? null,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      pass_expir_day: number;
      allow_past_pass: boolean;
    }) => {
      return await passwordApis.updatePassParamApi(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["passParam"] });
    },
  });

  // Column definitions
  const passParamColumns: GridColDef<PassParam>[] = [
    {
      field: "pass_expir_day",
      headerName: "Durée de validité (en jour)",
      flex: 1,
      type: "number",
    },
    {
      field: "allow_past_pass",
      headerName: "Autoriser les anciens mots de passe",
      flex: 1,
      type: "boolean",
    },
  ];

  // Event Handlers
  const handleEdit = async () => {
    const formData = await formDialog(
      [
        {
          label: "Durée de validité (en jour)",
          name: "pass_expir_day",
          type: "number",
          defaultValue: passParam?.pass_expir_day ?? 90,
          required: true,
          validation: (value) =>
            Number(value) < 1 ? "Valeur invalide." : null,
        },
        {
          label: "Autoriser les anciens mots de passe",
          name: "allow_past_pass",
          type: "boolean",
          defaultValue: !!passParam?.allow_past_pass,
        },
      ],
      {
        title: "Modifier les paramètres",
        cancelText: "Annuler",
        confirmText: "Appliquer",
        severity: "info",
      }
    );
    if (formData) {
      updateMutation.mutate({
        pass_expir_day: formData.pass_expir_day,
        allow_past_pass: formData.allow_past_pass,
      });
    }
  };

  if (isLoading || updateMutation.isPending) return <CircularProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight={600}>
            Paramètres des mots de passe
          </Typography>

          {sessionUserHasPermission(
            "Modifier les paramètres des mots de passe"
          ) && (
            <ActionButton
              tooltip="Modifier les paramètre"
              color="primary"
              onClick={handleEdit}
              icon={<Edit />}
            />
          )}
        </Stack>

        {/* Table */}
        <Stack sx={{ width: "100%", height: "60vh", overflow: "auto" }}>
          <DataGrid<PassParam>
            rows={passParam ? [passParam] : []}
            columns={passParamColumns}
            getRowId={(row) => row.pass_param_id}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                printOptions: {
                  disableToolbarButton: true,
                  hideToolbar: true,
                  hideFooter: true,
                },
                csvOptions: { fileName: "param_mot_de_passe" },
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
      </Stack>
    </Container>
  );
}
