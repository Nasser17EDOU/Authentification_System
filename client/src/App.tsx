import { Box } from "@mui/material";
import AppBar from "./components/AppBar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar user={{name: "EDOU BIYO'O Nasser Danys"}}/>
        {/* <MainContent /> */}
        <Footer />
      </Box>
    </>
  );
}
