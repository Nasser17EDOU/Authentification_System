import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid/internals";
import type { Profil } from "../../utilities/interfaces/profil.interface";
import type { Permission } from "../../utilities/interfaces/types.interface";
import { getAllPossiblePermissions } from "../../utilities/linksAndPermissions.utilities";
import { Add, Delete, Edit, Save } from "@mui/icons-material";
import {
  ActionButton,
  UpdatingActionButton,
} from "../../components/ActionButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionDataContext } from "../../context/SessionContext";
import { profileApi } from "../../api/profile.api";
import { formDialog } from "../../components/formDialog";

export default function ProfilsPage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const gridFontSize = isSmallScreen ? "0.7rem" : "0.875rem";
  const {
    sessionUserHasPermission,
    sessionUserHasSomePermissions,
    updateSessionData,
  } = sessionDataContext();
  const profileApis = profileApi(updateSessionData);
  const queryClient = useQueryClient();

  const [selectedProfil, setSelectedProfil] = useState<Profil | null>(null);
  const [gridRowSelectionModel, setGridRowSelectionModel] =
    useState<GridRowSelectionModel>({ ids: new Set(), type: "include" });

  // Set permission object List (index + permission)
  const permissionObjList = getAllPossiblePermissions().map((perm, index) => ({
    id: index,
    permission: perm,
  }));

  // Use queries
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: profileApis.getProfilesApi,
  });

  const { data: permissions, isLoading: isPermLoading } = useQuery({
    queryKey: ["profilePermissions", selectedProfil?.profil_id],
    queryFn: () =>
      selectedProfil
        ? profileApis.getAProfilePermissionsApi(selectedProfil.profil_id)
        : [],
    enabled: !!selectedProfil,
  });

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: async (profil_lib: string) => {
      return await profileApis.createProfileApi(profil_lib);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profil_id: number; profil_lib: string }) => {
      return await profileApis.updateProfileApi(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profil_id: number) => {
      return await profileApis.deleteProfileApi(profil_id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: {
      profil_id: number;
      permissions: Permission[];
    }) => {
      return await profileApis.updateProfilePermissionsApi(data);
    },
    onSuccess: async (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["profilePermissions", data.profil_id],
      });
    },
  });

  // Event handlers
  const handleAddProfile = async () => {
    const formData = await formDialog(
      [
        {
          label: "Libellé du profil",
          name: "profil_lib",
          type: "text",
          required: true,
          validation: (value) =>
            value.trim() === "" ? "Valeur invalide." : null,
        },
      ],
      {
        title: "Ajouter un profil",
        cancelText: "Annuler",
        confirmText: "Ajouter",
        severity: "info",
      }
    );
    if (formData) {
      createProfileMutation.mutate(formData.profil_lib.trim());
    }
  };

  const handleEdit = async (profil_id: number, profil_lib: string) => {
    const formData = await formDialog(
      [
        {
          label: "Libellé du profil",
          name: "profil_lib",
          type: "text",
          defaultValue: profil_lib,
          required: true,
          validation: (value) =>
            value.trim() === "" ? "Valeur invalide." : null,
        },
      ],
      {
        title: "Modifier le profil",
        cancelText: "Annuler",
        confirmText: "Modifier",
        severity: "info",
      }
    );
    if (formData) {
      updateProfileMutation.mutate({
        profil_id,
        profil_lib: formData.profil_lib.trim(),
      });
    }
  };

  const handleDeleteClick = (profil_id: number) => {
    deleteProfileMutation.mutate(profil_id);
  };

  const handleSavePermissions = (profil_id: number) => {
    const gridRowSelectionModelIds: number[] = [
      ...gridRowSelectionModel.ids,
    ].map((id) => Number(id));

    const permissions = permissionObjList
      .filter((permObj) => {
        if (gridRowSelectionModel.type === "include") {
          return gridRowSelectionModelIds.some((id) => id === permObj.id);
        } else {
          return !gridRowSelectionModelIds.some((id) => id === permObj.id);
        }
      })
      .map((permObj) => permObj.permission);

    updatePermissionsMutation.mutate({ profil_id, permissions });
  };

  const isProfilePending = (profil_id: number) =>
    (updateProfileMutation.isPending &&
      updateProfileMutation.variables?.profil_id === profil_id) ||
    (deleteProfileMutation.isPending &&
      deleteProfileMutation.variables === profil_id);

  const isPermissionsPending = (profil_id: number) =>
    updatePermissionsMutation.isPending &&
    updatePermissionsMutation.variables?.profil_id === profil_id;

  // Cols def
  const profileColumns: GridColDef<Profil>[] = [
    { field: "profil_lib", headerName: "Libellé", editable: false, flex: 1 },

    ...(sessionUserHasSomePermissions([
      "Modifier les profils",
      "Supprimer les profils",
    ])
      ? [
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row }) => {
              if (isProfilePending(row.profil_id)) {
                return [<UpdatingActionButton key="updating" />];
              }

              return [
                ...(sessionUserHasPermission("Modifier les profils")
                  ? [
                      <ActionButton
                        key="edit"
                        tooltip="Modifier le profil"
                        color="warning"
                        onClick={() =>
                          handleEdit(row.profil_id, row.profil_lib)
                        }
                        icon={<Edit />}
                      />,
                    ]
                  : []),
                ...(sessionUserHasPermission("Supprimer les profils")
                  ? [
                      <ActionButton
                        key="delete"
                        tooltip="Supprimer le profil"
                        color="error"
                        onClick={() => handleDeleteClick(row.profil_id)}
                        icon={<Delete />}
                      />,
                    ]
                  : []),
              ];
            },
          } as GridColDef<Profil>,
        ]
      : []),
  ];

  const permissionColumns: GridColDef<{
    id: number;
    permission: Permission;
  }>[] = [
    {
      field: "permission",
      headerName: "Permission",
      flex: 1,
      type: "singleSelect",
      valueOptions: getAllPossiblePermissions(),
      editable: false,
    },
  ];

  useEffect(() => {
    // Set permission object List (index + permission) for select profile
    setGridRowSelectionModel({
      ids: new Set(
        permissionObjList
          .filter((po) => (permissions ?? []).some((p) => p === po.permission))
          .map((po) => po.id)
      ),
      type: "include",
    });
  }, [permissions]);

  if (isLoading) return <CircularProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {sessionUserHasPermission("Créer les profils") && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <ActionButton
            tooltip="Ajouter un profil"
            color="primary"
            onClick={handleAddProfile}
            disable={createProfileMutation.isPending}
            icon={<Add />}
          />
        </Stack>
      )}

      <Stack
        direction={isSmallScreen ? "column" : "row"}
        minWidth={300}
        gap={2}
      >
        <Stack flex={1} gap={2}>
          <Typography variant="h6" fontWeight={600}>
            Liste des Profils
          </Typography>
          <DataGrid<Profil>
            rows={profiles ?? []}
            columns={profileColumns}
            onRowClick={(params) => {
              setSelectedProfil(
                profiles?.find((p) => p.profil_id === params.id) ?? null
              );
            }}
            getRowId={(row) => row.profil_id}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                printOptions: {
                  disableToolbarButton: true,
                  hideToolbar: true,
                  hideFooter: true,
                },
                csvOptions: { disableToolbarButton: true },
              },
            }}
            showToolbar
            sx={{
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
              fontSize: gridFontSize,
              "& .MuiDataGrid-cell": { fontSize: gridFontSize },
              "& .MuiDataGrid-columnHeaders": { fontSize: gridFontSize },
              "& .MuiDataGrid-footerContainer": { fontSize: gridFontSize },
            }}
          />
        </Stack>

        <Stack flex={1} gap={2}>
          {selectedProfil ? (
            isPermLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight={600}>
                    Liste des Permissions de "{selectedProfil.profil_lib}"
                  </Typography>
                  {sessionUserHasPermission(
                    "Modifier les permissions des profils"
                  ) && (
                    <>
                      {isPermissionsPending(selectedProfil.profil_id) ? (
                        <UpdatingActionButton />
                      ) : (
                        <ActionButton
                          tooltip="Enregistrer les permissions"
                          color="primary"
                          onClick={() =>
                            handleSavePermissions(selectedProfil.profil_id)
                          }
                          disable={isProfilePending(selectedProfil.profil_id)}
                          icon={<Save />}
                        />
                      )}
                    </>
                  )}
                </Stack>
                <DataGrid<{ id: number; permission: Permission }>
                  rows={permissionObjList}
                  columns={permissionColumns}
                  loading={isPermissionsPending(selectedProfil.profil_id)}
                  disableRowSelectionOnClick
                  checkboxSelection
                  rowSelectionModel={gridRowSelectionModel}
                  onRowSelectionModelChange={(newSelection) => {
                    if (
                      sessionUserHasPermission(
                        "Modifier les permissions des profils"
                      )
                    ) {
                      setGridRowSelectionModel(newSelection);
                    }
                  }}
                  getRowId={(row) => row.id}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      printOptions: {
                        disableToolbarButton: true,
                        hideToolbar: true,
                        hideFooter: true,
                      },
                      csvOptions: {
                        disableToolbarButton: false,
                        fileName: selectedProfil.profil_lib,
                      },
                    },
                  }}
                  showToolbar
                  sx={{
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                    },
                    fontSize: gridFontSize,
                    "& .MuiDataGrid-cell": { fontSize: gridFontSize },
                    "& .MuiDataGrid-columnHeaders": { fontSize: gridFontSize },
                    "& .MuiDataGrid-footerContainer": {
                      fontSize: gridFontSize,
                    },
                  }}
                />
              </>
            )
          ) : (
            <Box
              sx={{ textAlign: "center" }}
              flex={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={isSmallScreen ? "1rem" : "1.2rem"}
              fontWeight={600}
            >
              {`Sélectionnez un profil ${
                isSmallScreen ? "au dessus" : "à gauche"
              } pour gérer ses permissions.`}
            </Box>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
