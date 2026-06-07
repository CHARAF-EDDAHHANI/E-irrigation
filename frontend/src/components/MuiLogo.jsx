import { Box, Typography } from "@mui/material";

export default function Logo() {
  const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f"];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        border: "2px solid #ccc",
        borderRadius: 2,
        padding: "4px 8px",
      }}
    >
      {colors.map((color, index) => (
        <Typography
          key={index}
          sx={{
            fontWeight: "bold",
            color,
            fontSize: "20px",
          }}
        >
          O
        </Typography>
      ))}
    </Box>
  );
}