import {
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  type IconButtonOwnProps,
} from "@mui/material";
import type { JSX } from "@emotion/react/jsx-runtime";
import { Save } from "@mui/icons-material";

export const ActionButton = ({
  tooltip,
  disable = false,
  color = "default",
  onClick = () => {},
  icon,
}: {
  tooltip: string;
  disable?: boolean;
  color?: IconButtonOwnProps["color"];
  onClick?: () => void;
  icon: JSX.Element;
}) => {
  return (
    <Tooltip title={tooltip} arrow>
      <IconButton disabled={disable} color={color} onClick={onClick}>
        {{
          ...icon,
          props: {
            ...icon.props,
            sx: {
              fontSize: {
                xs: 20,
                sm: 22,
                md: 24,
              },
              ...icon.props.sx,
            },
          },
        }}
      </IconButton>
    </Tooltip>
  );
};

export const UpdatingActionButton = ({
  icon = <Save />,
}: {
  icon?: JSX.Element;
}) => {
  return (
    <Stack position="relative" display="inline-flex">
      <IconButton disabled>
        {{
          ...icon,
          props: {
            ...icon.props,
            sx: {
              fontSize: {
                xs: 20,
                sm: 22,
                md: 24,
              },
              ...icon.props.sx,
            },
          },
        }}
      </IconButton>

      <CircularProgress
        // thickness={4}
        sx={{
          position: "absolute",
          fontSize: {
            xs: 22,
            sm: 24,
            md: 26,
          },
        }}
      />
    </Stack>
  );
};
