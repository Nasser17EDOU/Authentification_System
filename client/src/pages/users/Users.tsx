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
import type { Genre } from "../../utilities/interfaces/types.interface";
import {
  Add,
  Delete,
  Edit,
  LockReset,
  Save,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";
import {
  ActionButton,
  UpdatingActionButton,
} from "../../components/ActionButtons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionDataContext } from "../../context/SessionContext";
import { profileApi } from "../../api/profile.api";
import { formDialog, inputValidator } from "../../components/formDialog";
import { userApi } from "../../api/user.api";
import { passwordApi } from "../../api/password.api";
import type {
  NewUser,
  User,
  UserToUpdate,
} from "../../utilities/interfaces/user.interface";
import type { FormField } from "../../components/FormModal";

export default function Users() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const gridFontSize = isSmallScreen ? "0.7rem" : "0.875rem";
  const {
    sessionUserHasPermission,
    sessionUserHasSomePermissions,
    updateSessionData,
  } = sessionDataContext();
  const userApis = userApi(updateSessionData);
  const profileApis = profileApi(updateSessionData);
  const passwordApis = passwordApi(updateSessionData);
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [gridRowSelectionModel, setGridRowSelectionModel] =
    useState<GridRowSelectionModel>({ ids: new Set(), type: "include" });

  // Use queries
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userApis.getUsersApi,
  });

  const { data: profiles, isLoading: isProfilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: profileApis.getProfilesApi,
    enabled: !!selectedUser,
  });

  const { data: userProfiles, isLoading: isUserProfilesLoading } = useQuery({
    queryKey: ["userProfiles", selectedUser?.user_id],
    queryFn: () =>
      selectedUser ? profileApis.getAUserProfilesApi(selectedUser.user_id) : [],
    enabled: !!selectedUser,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: { userData: NewUser; pass: string }) => {
      return await userApis.createUserApi(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserToUpdate) => {
      return await userApis.updateUserApi(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const changeUserStatusMutation = useMutation({
    mutationFn: async (data: { user_id: number; is_active: boolean }) => {
      return await userApis.changeUserStatusApi(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (user_id: number) => {
      return await userApis.deleteUserApi(user_id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const initUserPassMutation = useMutation({
    mutationFn: async (data: { user_id: number; pass: string }) => {
      return await passwordApis.initUserPassApi(data);
    },
  });

  const updateUserProfilesMutation = useMutation({
    mutationFn: async (data: { user_id: number; profil_ids: number[] }) => {
      return await profileApis.updateUserProfilesApi(data);
    },
    onSuccess: async (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfiles", data.user_id],
      });
    },
  });

  // Event handlers
  const handleAddUser = async () => {
    const formData = await formDialog([...userFields(), passField], {
      title: "Ajouter un utilisateur",
      cancelText: "Annuler",
      confirmText: "Ajouter",
      severity: "info",
    });
    if (formData) {
      createUserMutation.mutate({
        userData: {
          login: formData.login.trim(),
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim() || null,
          genre: formData.genre,
          email: formData.email.trim() || null,
          tel: formData.tel.trim() || null,
        },
        pass: formData.pass.trim(),
      });
    }
  };

  const handleEdit = async (user_id: number) => {
    const user = users?.find((u) => u.user_id === user_id);
    const formData = await formDialog([...userFields(user)], {
      title: "Modifier l'utilisateur",
      cancelText: "Annuler",
      confirmText: "Modifier",
      severity: "info",
    });
    if (formData) {
      updateUserMutation.mutate({
        user_id,
        login: formData.login.trim(),
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim() || null,
        genre: formData.genre,
        email: formData.email.trim() || null,
        tel: formData.tel.trim() || null,
      });
    }
  };

  const handleChangeUserStatus = (user_id: number, is_active: boolean) => {
    changeUserStatusMutation.mutate({ user_id, is_active });
  };

  const handleDeleteClick = (user_id: number) => {
    deleteUserMutation.mutate(user_id);
  };

  const handleInitUserPass = async (user_id: number) => {
    const formData = await formDialog([passField], {
      title: "Réinitialiser le mot de passe",
      cancelText: "Annuler",
      confirmText: "Appliquer",
      severity: "info",
    });
    if (formData) {
      initUserPassMutation.mutate({
        user_id,
        pass: formData.pass.trim(),
      });
    }
  };

  const handleSaveUserProfiles = (user_id: number) => {
    const gridRowSelectionModelIds: number[] = [
      ...gridRowSelectionModel.ids,
    ].map((id) => Number(id));

    const profil_ids = (profiles ?? [])
      .filter((p) => {
        if (gridRowSelectionModel.type === "include") {
          return gridRowSelectionModelIds.some((id) => id === p.profil_id);
        } else {
          return !gridRowSelectionModelIds.some((id) => id === p.profil_id);
        }
      })
      .map((p) => p.profil_id);

    updateUserProfilesMutation.mutate({ user_id, profil_ids });
  };

  const isUserPending = (user_id: number) =>
    (updateUserMutation.isPending &&
      updateUserMutation.variables?.user_id === user_id) ||
    (changeUserStatusMutation.isPending &&
      changeUserStatusMutation.variables?.user_id === user_id) ||
    (initUserPassMutation.isPending &&
      initUserPassMutation.variables?.user_id === user_id) ||
    (deleteUserMutation.isPending && deleteUserMutation.variables === user_id);

  const isUserProfilesPending = (user_id: number) =>
    updateUserProfilesMutation.isPending &&
    updateUserProfilesMutation.variables?.user_id === user_id;

  // Cols def
  const userColumns: GridColDef<User>[] = [
    { field: "login", headerName: "Login", editable: false, flex: 1 },
    { field: "nom", headerName: "Nom", editable: false, flex: 1 },
    { field: "prenom", headerName: "Prénom", editable: false, flex: 1 },
    {
      field: "genre",
      headerName: "Genre",
      editable: false,
      flex: 1,
      type: "singleSelect",
    },
    { field: "email", headerName: "Mail", editable: false, flex: 1 },
    { field: "tel", headerName: "Téléphone", editable: false, flex: 1 },
    {
      field: "is_active",
      headerName: "État du compte",
      editable: false,
      flex: 1,
      type: "boolean",
    },

    ...(sessionUserHasSomePermissions([
      "Modifier les utilisateurs",
      "Supprimer les utilisateurs",
    ])
      ? [
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            sortable: false,
            filterable: false,
            minWidth: 200,
            getActions: ({ row }) => {
              if (isUserPending(row.user_id)) {
                return [<UpdatingActionButton key="updating" />];
              }

              return [
                ...(sessionUserHasPermission("Modifier les utilisateurs")
                  ? [
                      <ActionButton
                        key="edit"
                        tooltip="Modifier l'utilisateur"
                        color="primary"
                        onClick={() => handleEdit(row.user_id)}
                        icon={<Edit />}
                      />,
                      <ActionButton
                        key="initPass"
                        tooltip="Réinitialiser le mot de passe"
                        color="warning"
                        onClick={() => handleInitUserPass(row.user_id)}
                        icon={<LockReset />}
                      />,
                      <ActionButton
                        key="changeStatus"
                        tooltip={row.is_active ? "Désactiver" : "Activer"}
                        color="primary"
                        onClick={() =>
                          handleChangeUserStatus(row.user_id, !row.is_active)
                        }
                        icon={
                          row.is_active ? (
                            <ToggleOn color="primary" />
                          ) : (
                            <ToggleOff color="disabled" />
                          )
                        }
                      />,
                    ]
                  : []),
                ...(sessionUserHasPermission("Supprimer les utilisateurs")
                  ? [
                      <ActionButton
                        key="delete"
                        tooltip="Supprimer l'utilisateur"
                        color="error"
                        onClick={() => handleDeleteClick(row.user_id)}
                        icon={<Delete />}
                      />,
                    ]
                  : []),
              ];
            },
          } as GridColDef<User>,
        ]
      : []),
  ];

  const profileColumns: GridColDef<Profil>[] = [
    {
      field: "profil_lib",
      headerName: "Libellé du profil",
      flex: 1,
      type: "singleSelect",
      editable: false,
    },
  ];

  useEffect(() => {
    // Set permission object List (index + permission) for select profile
    setGridRowSelectionModel({
      ids: new Set(
        (profiles ?? [])
          .filter((p) =>
            (userProfiles ?? []).some((up) => up.profil_id === p.profil_id)
          )
          .map((p) => p.profil_id)
      ),
      type: "include",
    });
  }, [profiles, userProfiles]);

  if (isLoading) return <CircularProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {sessionUserHasPermission("Créer les utilisateurs") && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <ActionButton
            tooltip="Ajouter un utilisateur"
            color="primary"
            onClick={handleAddUser}
            disable={createUserMutation.isPending}
            icon={<Add />}
          />
        </Stack>
      )}

      <Stack
        direction={isSmallScreen ? "column" : "row"}
        minWidth={300}
        gap={2}
      >
        <Stack flex={6} gap={2}>
          <Typography variant="h6" fontWeight={600}>
            Liste des utilisateurs
          </Typography>
          <DataGrid<User>
            rows={users ?? []}
            columns={userColumns}
            onRowClick={(params) => {
              setSelectedUser(
                users?.find((u) => u.user_id === params.id) ?? null
              );
            }}
            getRowId={(row) => row.user_id}
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
                  fileName: "utilisateurs",
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
              "& .MuiDataGrid-footerContainer": { fontSize: gridFontSize },
            }}
          />
        </Stack>

        <Stack flex={2} gap={2}>
          {selectedUser ? (
            isProfilesLoading || isUserProfilesLoading ? (
              <CircularProgress />
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight={600}>
                    Liste des profils de "{selectedUser.login}"
                  </Typography>
                  {sessionUserHasPermission(
                    "Modifier les profils des utilisateurs"
                  ) && (
                    <>
                      {isUserProfilesPending(selectedUser.user_id) ? (
                        <UpdatingActionButton />
                      ) : (
                        <ActionButton
                          tooltip="Enregistrer les profils"
                          color="primary"
                          onClick={() =>
                            handleSaveUserProfiles(selectedUser.user_id)
                          }
                          disable={isUserPending(selectedUser.user_id)}
                          icon={<Save />}
                        />
                      )}
                    </>
                  )}
                </Stack>
                <DataGrid<Profil>
                  rows={profiles ?? []}
                  columns={profileColumns}
                  loading={isUserProfilesPending(selectedUser.user_id)}
                  disableRowSelectionOnClick
                  checkboxSelection
                  rowSelectionModel={gridRowSelectionModel}
                  onRowSelectionModelChange={(newSelection) => {
                    if (
                      sessionUserHasPermission(
                        "Modifier les profils des utilisateurs"
                      )
                    ) {
                      setGridRowSelectionModel(newSelection);
                    }
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
                      csvOptions: {
                        disableToolbarButton: false,
                        fileName: selectedUser.login,
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
              {`Sélectionnez un utilisateur ${
                isSmallScreen ? "au dessus" : "à gauche"
              } pour gérer ses profils.`}
            </Box>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}

const userFields = (user?: User): FormField[] => [
  {
    label: "Login",
    name: "login",
    type: "text",
    required: true,
    defaultValue: user?.login,
    validation: (value) =>
      inputValidator(value.trim(), { minLength: 4, maxLength: 15 }),
  },
  {
    label: "Nom",
    name: "nom",
    type: "text",
    required: true,
    defaultValue: user?.nom,
    validation: (value) =>
      inputValidator(value.trim(), { minLength: 1, maxLength: 50 }),
  },
  {
    label: "Prénom",
    name: "prenom",
    type: "text",
    defaultValue: user?.prenom ?? undefined,
    validation: (value) => inputValidator(value.trim(), { maxLength: 50 }),
  },
  {
    label: "Genre",
    name: "genre",
    type: "select",
    required: true,
    options: [
      { label: "Masculin", value: "Masculin" as Genre },
      { label: "Féminin", value: "Féminin" as Genre },
    ],
    defaultValue: (user?.genre ?? "Masculin") as Genre,
  },
  {
    label: "Mail",
    name: "email",
    type: "email",
    defaultValue: user?.email ?? undefined,
    validation: (value) => inputValidator(value.trim(), { maxLength: 100 }),
  },
  {
    label: "Téléphone",
    name: "tel",
    type: "text",
    defaultValue: user?.tel ?? undefined,
    validation: (value) => inputValidator(value.trim(), { maxLength: 15 }),
  },
];

const passField: FormField = {
  label: "Mot de passe",
  name: "pass",
  type: "password",
  validation: (value) =>
    inputValidator(value.trim(), {
      maxLength: 100,
      reg: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/,
    }),
};
