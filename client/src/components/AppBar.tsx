// src/components/AppBar.tsx
import React, { useState, useRef, forwardRef } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
  Stack,
  Popover,
  List,
  ListItemButton,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import logo from "../assets/logo.png";
import {
  getAllPossiblePermissions,
  getMenuObjectListByPermissions,
} from "../utilities/linksAndPermissions.utilities";

interface AppBarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const AppBar = forwardRef<HTMLDivElement, AppBarProps>(
  ({ user, onLogout }, ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
      useState<null | HTMLElement>(null);
    const [openSubMenu, setOpenSubMenu] = useState<Record<string, boolean>>({});
    const menuRefs = useRef<Record<string, HTMLElement | null>>({});

    // Get the user all Menu Object List by its Permissions
    const userMenuObjectList = getMenuObjectListByPermissions(
      getAllPossiblePermissions()
    );

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setMobileMenuAnchorEl(null);
    };

    const handleSubMenuToggle = (
      menuTitle: string,
      event: React.MouseEvent<HTMLElement>
    ) => {
      setOpenSubMenu((prev) => ({
        ...prev,
        [menuTitle]: !prev[menuTitle],
      }));
      menuRefs.current[menuTitle] = event.currentTarget;
    };

    const renderDesktopMenu = () => (
      <Stack ref={ref} direction="row" spacing={1} sx={{ flexGrow: 1, ml: 3 }}>
        {userMenuObjectList.map((menuObj, menuObjIndex) => (
          <Box key={menuObjIndex}>
            <Button
              color="inherit"
              startIcon={menuObj.icon}
              endIcon={
                openSubMenu[menuObj.label] ? <ExpandLess /> : <ExpandMore />
              }
              onClick={(e) => handleSubMenuToggle(menuObj.label, e)}
              sx={{ position: "relative" }}
            >
              {menuObj.label}
            </Button>
            <Popover
              open={!!openSubMenu[menuObj.label]}
              anchorEl={menuRefs.current[menuObj.label]}
              onClose={() =>
                setOpenSubMenu((prev) => ({ ...prev, [menuObj.label]: false }))
              }
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                mt: 1,
                "& .MuiPaper-root": {
                  minWidth: 160,
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <List>
                {menuObj.linkObjList.map((linkObj, linkObjIndex) => (
                  <ListItemButton
                    key={linkObjIndex}
                    href={linkObj.link}
                    sx={{ minWidth: 120 }}
                  >
                    <ListItemIcon>{linkObj.linkIcon}</ListItemIcon>
                    <ListItemText>{linkObj.linkLabel}</ListItemText>
                  </ListItemButton>
                ))}
              </List>
            </Popover>
          </Box>
        ))}
      </Stack>
    );

    const renderMobileMenu = () => (
      <>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenuOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={mobileMenuAnchorEl}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "80%",
              maxWidth: 300,
            },
          }}
        >
          {/* <MenuItem>
          <ListItemIcon>
            <Home fontSize="small" />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </MenuItem>
        <Divider /> */}
          {userMenuObjectList.map((menuObj, menuObjIndex) => (
            <div key={menuObjIndex}>
              <MenuItem onClick={(e) => handleSubMenuToggle(menuObj.label, e)}>
                <ListItemIcon>{menuObj.icon}</ListItemIcon>
                <ListItemText primary={menuObj.label} />
                <ListItemIcon>
                  {openSubMenu[menuObj.label] ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
              </MenuItem>
              <Collapse
                in={openSubMenu[menuObj.label]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {menuObj.linkObjList.map((linkObj, linkObjIndex) => (
                    <ListItemButton
                      key={linkObjIndex}
                      href={linkObj.link}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>{linkObj.linkIcon}</ListItemIcon>
                      <ListItemText>{linkObj.linkLabel}</ListItemText>
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </div>
          ))}
        </Menu>
      </>
    );

    return (
      <MuiAppBar position="fixed" elevation={3}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Button */}
            {isMobile && renderMobileMenu()}

            {/* Logo and Title */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={logo} // Replace with your logo path
                alt="Logo"
                style={{ height: 40, marginRight: 10 }}
              />
              <Typography
                variant="h6"
                component="a"
                noWrap
                href="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                  // Responsive font size
                  fontSize: {
                    xs: "1rem", // extra small devices
                    sm: "1.1rem", // small devices
                    md: "1.2rem", // medium devices
                    lg: "1.25rem", // large devices
                  },
                  // You can also make other properties responsive
                  display: {
                    xs: "none", // hide on extra small screens
                    sm: "block", // show on small and larger screens
                  },
                  // Or use the breakpoints syntax
                  [theme.breakpoints.down("sm")]: {
                    mr: 1, // reduce margin on small screens
                  },
                }}
              >
                {import.meta.env.VITE_APPBARR_TITLE}
              </Typography>
            </Box>

            {/* Main Menu - Desktop */}
            {!isMobile && renderDesktopMenu()}

            {/* User Section */}
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "100%", // Ensure parent takes full width
                overflow: "hidden", // Prevent any overflow
              }}
            >
              {user && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minWidth: 0, // This is crucial for text overflow in flex
                      flex: 1, // Allow this container to shrink
                    }}
                  >
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        mr: 1,
                        textOverflow: "ellipsis",
                        // maxWidth: 100,
                        fontSize: {
                          xs: "0.75rem", // extra small devices
                          sm: "1rem", // small devices
                          md: "0.75rem", // medium devices
                          lg: "1rem", // large devices
                        },
                      }}
                    >
                      {user.name}
                    </Typography>
                    <IconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenuOpen}
                      color="inherit"
                    >
                      {user.avatar ? (
                        <Avatar
                          alt={user.name}
                          src={user.avatar}
                          // sx={{ width: 32, height: 32 }}
                        />
                      ) : (
                        <AccountCircle />
                      )}
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={onLogout}>
                        <ListItemIcon>
                          <ExitToApp fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </MuiAppBar>
    );
  }
);

export default AppBar;
