import { useEffect } from "react";
import { Stack, Box } from "@mui/material";
import Sidebar from "../components/Home/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import { useAppSelector } from "../store";
import { ROUTES } from "../constants/routes";

const HomePage = () => {
  const user = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.authToken === null) navigate(ROUTES.LOG_IN);
  }, [user]);

  return (
    <Stack direction="row" sx={{ height: "100%", flexShrink: 1 }}>
      <Sidebar />
      <Box
        sx={{
          width: "400px",
          boxShadow: "var(--shadow-inner)",
          p: "28px 20px",
        }}
      >
        <Outlet />
      </Box>
      <ChatBox />
    </Stack>
  );
};

export default HomePage;
