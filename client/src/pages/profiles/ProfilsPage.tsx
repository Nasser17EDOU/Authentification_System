import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import {
  DataGrid,
  GridRowModes,
  type GridColDef,
  type GridRowModesModel,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { GridToolbar } from "@mui/x-data-grid/internals";
import type { Profil } from "../../utilities/interfaces/profil.interface";
import type { Permission } from "../../utilities/interfaces/types.interface";
import { getAllPossiblePermissions } from "../../utilities/linksAndPermissions.utilities";
import { Add, Cancel, Delete, Edit, Save } from "@mui/icons-material";
import {
  ActionButton,
  UpdatingActionButton,
} from "../../components/ActionButtons";

export default function ProfilsPage() {
  const [profils, setProfils] = useState<Profil[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [profileRowsStatus, setProfileRowsStatus] = useState<{
    [profil_id: Profil["profil_id"]]: "Normal" | "Edit" | "Updating";
  }>({});
  const [selectedProfil, setSelectedProfil] = useState<Profil | null>(null);
  const [gridRowSelectionModel, setGridRowSelectionModel] =
    useState<GridRowSelectionModel>({ ids: new Set(), type: "include" });
  const [profilPermissionData, setProfilPermissionData] = useState<{
    [profil_id: Profil["profil_id"]]: Permission[];
  }>({});
  const [profilePermissionUpdating, setProfilePermissionUpdating] = useState<{
    [profil_id: Profil["profil_id"]]: boolean;
  }>({});

  const permissionObjList = getAllPossiblePermissions().map((perm, index) => ({
    id: index,
    permission: perm,
  }));

  const getProfilPermissionObjList = (profil_id: Profil["profil_id"]) => {
    const selectedPermissions = profilPermissionData[profil_id] || [];
    return permissionObjList.filter((permObj) =>
      selectedPermissions.some((perm) => perm === permObj.permission)
    );
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setProfils([
      {
        profil_id: 1,
        profil_lib: "Administrateur",
        is_delete: false,
        create_date: new Date(),
        createur_id: null,
        mod_date: null,
        modifieur_id: null,
      },
      {
        profil_id: 2,
        profil_lib: "Utilisateur",
        is_delete: false,
        create_date: new Date(),
        createur_id: null,
        mod_date: null,
        modifieur_id: null,
      },
    ]);
  }, []);

  const profileColumns: GridColDef<Profil>[] = [
    { field: "profil_lib", headerName: "Libellé", editable: true, flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: ({ row }) => {
        const mode = profileRowsStatus[row.profil_id];

        if (mode === "Updating") {
          return [<UpdatingActionButton key="updating" />];
        }

        if (mode === "Edit") {
          return [
            <ActionButton
              key="save"
              tooltip="Enregistrer les modifications"
              color="primary"
              onClick={() => handleSaveClick(row.profil_id)}
              icon={<Save />}
            />,
            <ActionButton
              key="cancel"
              tooltip="Annuler les modifications"
              color="secondary"
              onClick={() => handleCancelClick(row.profil_id)}
              icon={<Cancel />}
            />,
          ];
        }

        return [
          <ActionButton
            key="edit"
            tooltip="Modifier le profil"
            color="warning"
            onClick={() => handleEdit(row.profil_id)}
            icon={<Edit />}
          />,
          <ActionButton
            key="delete"
            tooltip="Supprimer le profil"
            color="error"
            onClick={() => handleDeleteClick(row.profil_id)}
            icon={<Delete />}
          />,
        ];
      },
    },
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

  const handleAddProfile = () => {
    const newId = Math.max(0, ...profils.map((p) => p.profil_id)) + 1;
    const newProfile: Profil = {
      profil_id: newId,
      profil_lib: "Nouveau profil",
      is_delete: false,
      create_date: new Date(),
      createur_id: null,
      mod_date: null,
      modifieur_id: null,
    };
    setProfils([...profils, newProfile]);
    setRowModesModel((prev) => ({
      ...prev,
      [newId]: { mode: GridRowModes.Edit },
    }));
    setProfileRowsStatus((prev) => ({
      ...prev,
      [newId]: "Edit",
    }));
    setSelectedProfil(newProfile);
  };

  const handleEdit = (profil_id: Profil["profil_id"]) => {
    setRowModesModel((prev) => ({
      ...prev,
      [profil_id]: {
        mode: GridRowModes.Edit,
        fieldToFocus: "profil_lib" as keyof Profil,
      },
    }));
    setProfileRowsStatus((prev) => ({
      ...prev,
      [profil_id]: "Edit",
    }));
  };

  const handleSaveClick = (profil_id: Profil["profil_id"]) => {
    setRowModesModel((prev) => ({
      ...prev,
      [profil_id]: { mode: GridRowModes.View },
    }));
    setProfileRowsStatus((prev) => ({
      ...prev,
      [profil_id]: "Updating",
    }));
    setTimeout(() => {
      setProfileRowsStatus((prev) => ({
        ...prev,
        [profil_id]: "Normal",
      }));
    }, 10000);
  };

  const handleCancelClick = (profil_id: Profil["profil_id"]) => {
    const isNew =
      profils.find((r) => r.profil_id === profil_id)?.profil_lib ===
      "Nouveau profil";

    if (isNew) {
      setProfils(profils.filter((r) => r.profil_id !== profil_id));
      if (selectedProfil?.profil_id === profil_id) {
        setSelectedProfil(null);
      }
    } else {
      // Revert changes by resetting the row to its original state
      setProfils(
        profils.map((profil) =>
          profil.profil_id === profil_id
            ? { ...profils.find((p) => p.profil_id === profil_id)! }
            : profil
        )
      );
    }

    setRowModesModel((prev) => ({
      ...prev,
      [profil_id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
    setProfileRowsStatus((prev) => ({
      ...prev,
      [profil_id]: "Normal",
    }));
  };

  const handleDeleteClick = (profil_id: Profil["profil_id"]) => {
    setProfils(profils.filter((profil) => profil.profil_id !== profil_id));
    if (selectedProfil?.profil_id === profil_id) {
      setSelectedProfil(null);
    }
  };

  const processRowUpdate = (newRow: Profil, oldRow: Profil) => {
    // If the row is not in edit mode, don't process the update
    if (profileRowsStatus[newRow.profil_id] !== "Edit") {
      return oldRow;
    }

    const updatedProfils = profils.map((profil) =>
      profil.profil_id === newRow.profil_id ? { ...profil, ...newRow } : profil
    );
    setProfils(updatedProfils);
    return newRow;
  };

  // const handlePermissionToggle = (
  //   permission: Permission,
  //   isSelected: boolean
  // ) => {
  //   setSelectedPermissions((prev) =>
  //     isSelected ? [...prev, permission] : prev.filter((p) => p !== permission)
  //   );
  // };

  const handleSavePermissions = () => {
    setProfilePermissionUpdating((prev) => ({
      ...prev,
      [selectedProfil!.profil_id]: true,
    }));

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

    setProfilPermissionData({
      ...profilPermissionData,
      [selectedProfil!.profil_id]: permissions,
    });
    setTimeout(() => {
      setProfilePermissionUpdating((prev) => ({
        ...prev,
        [selectedProfil!.profil_id]: false,
      }));
    }, 10000);

    // setSelectedProfilPermissionObjIdList([]);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <ActionButton
          tooltip="Ajouter un profil"
          color="primary"
          onClick={() => handleAddProfile()}
          icon={<Add />}
        />
      </Stack>

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
            rows={profils}
            columns={profileColumns}
            rowModesModel={rowModesModel}
            onRowModesModelChange={setRowModesModel}
            onRowClick={(params) => {
              if (profileRowsStatus[params.row.profil_id] !== "Edit") {
                setSelectedProfil(params.row as Profil);
                setGridRowSelectionModel({
                  ids: new Set(
                    getProfilPermissionObjList(params.row.profil_id).map(
                      (p) => p.id
                    )
                  ),
                  type: "include",
                });
              }
            }}
            onCellEditStart={(params, event) => {
              if (rowModesModel[params.id]?.mode !== GridRowModes.Edit) {
                event.defaultMuiPrevented = true;
              }
            }}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(error) => console.error(error)}
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
            }}
          />
        </Stack>

        <Stack flex={1} gap={2}>
          {selectedProfil ? (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={600}>
                  Liste des Permissions de "{selectedProfil.profil_lib}"
                </Typography>
                {profilePermissionUpdating[selectedProfil.profil_id] ? (
                  <UpdatingActionButton />
                ) : (
                  <ActionButton
                    tooltip="Enregistrer les permissions"
                    color="primary"
                    onClick={handleSavePermissions}
                    icon={<Save />}
                  />
                )}
              </Stack>
              <DataGrid<{ id: number; permission: Permission }>
                rows={permissionObjList}
                columns={permissionColumns}
                loading={profilePermissionUpdating[selectedProfil.profil_id]}
                disableRowSelectionOnClick
                checkboxSelection
                rowSelectionModel={gridRowSelectionModel}
                onRowSelectionModelChange={setGridRowSelectionModel}
                getRowId={(row) => row.id}
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
                }}
              />
            </>
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
              Sélectionnez un profil à gauche pour gérer ses permissions.
            </Box>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
