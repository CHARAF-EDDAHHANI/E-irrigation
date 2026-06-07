import { Box, Typography, Button } from "@mui/material";
import MuiLogo from "./MuiLogo";

export default function Header() {
  const buttons = [
    { label: "Agent", type: "agent" },
    { label: "Agriculteur", type: "agriculteur" },
    { label: "Société", type: "societe" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 1,
        borderBottom: "1px solid #ddd",
      }}
    >
        <MuiLogo/> 
        <Box>
        <Typography variant="h6" fontWeight="bold">
          E-Irrigation | ORMVAM
        </Typography>
      </Box>

      {/* RIGHT SIDE BUTTONS */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {buttons.map((btn) => (
          <Button
            key={btn.type}
          
            size="small"
          >
            {btn.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}