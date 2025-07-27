// src/components/AppBar.tsx
import React, { useState, useRef } from "react";
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
  Divider,
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
  Home,
} from "@mui/icons-material";

interface MainMenu {
  title: string;
  subLinks: string[];
}

interface AppBarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ user, onLogin, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [openSubMenu, setOpenSubMenu] = useState<Record<string, boolean>>({});
  const menuRefs = useRef<Record<string, HTMLElement | null>>({});

  // Sample main menu data
  const mainMenus: MainMenu[] = [
    {
      title: "Vehicles",
      subLinks: ["Car", "Bike", "Train", "Plane"],
    },
    {
      title: "Electronics",
      subLinks: ["Phones", "Computers", "Hard drives"],
    },
    {
      title: "Clothing",
      subLinks: ["Men", "Women", "Kids"],
    },
  ];

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
    <Stack direction="row" spacing={1} sx={{ flexGrow: 1, ml: 3 }}>
      {mainMenus.map((menu) => (
        <Box key={menu.title}>
          <Button
            color="inherit"
            endIcon={openSubMenu[menu.title] ? <ExpandLess /> : <ExpandMore />}
            onClick={(e) => handleSubMenuToggle(menu.title, e)}
            sx={{ position: "relative" }}
          >
            {menu.title}
          </Button>
          <Popover
            open={!!openSubMenu[menu.title]}
            anchorEl={menuRefs.current[menu.title]}
            onClose={() =>
              setOpenSubMenu((prev) => ({ ...prev, [menu.title]: false }))
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
              {menu.subLinks.map((subLink) => (
                <ListItemButton key={subLink} sx={{ minWidth: 120 }}>
                  {subLink}
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
        <MenuItem>
          <ListItemIcon>
            <Home fontSize="small" />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </MenuItem>
        <Divider />
        {mainMenus.map((menu) => (
          <div key={menu.title}>
            <MenuItem onClick={(e) => handleSubMenuToggle(menu.title, e)}>
              <ListItemText primary={menu.title} />
              {openSubMenu[menu.title] ? <ExpandLess /> : <ExpandMore />}
            </MenuItem>
            <Collapse in={openSubMenu[menu.title]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menu.subLinks.map((subLink) => (
                  <MenuItem key={subLink} sx={{ pl: 4 }}>
                    <ListItemText primary={subLink} />
                  </MenuItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </Menu>
    </>
  );

  return (
    <MuiAppBar position="static" elevation={3}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/logo.png" // Replace with your logo path
              alt="Logo"
              style={{ height: 40, marginRight: 10 }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              My App
            </Typography>
          </Box>

          {/* Main Menu - Desktop */}
          {!isMobile && renderDesktopMenu()}

          {/* Mobile Menu Button */}
          {isMobile && renderMobileMenu()}

          {/* User Section */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user ? (
              <>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Welcome, {user.name}
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
                      sx={{ width: 32, height: 32 }}
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
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={onLogin}
                sx={{ ml: 1 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
};

export default AppBar;
