import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // <-- Changé ici pour tout centrer au milieu
        px: 2.5,
        py: 1,
        borderBottom: "0.5px solid #e2e8f0",
        bgcolor: "#fff",
      }}
    >
      {/* CENTER — logos + app name */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
     {/* App name styled as logo */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
          <Typography
            sx={{
              fontSize: 45,
              fontWeight: 900,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #3B6D11 0%, #639922 60%, #97C459 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            E-Irrigation
          </Typography>
        </Box>

        {/* Divider */}
        <Box sx={{ width: "2px", height: 40, bgcolor: "#e2e8f0" }} />
        {/* Official logo */}
        <Box
          component="img"
          src="/logooff.png"
          alt="ORMVAM"
          sx={{ height: 60, width: "auto", objectFit: "contain" }}
        />
      </Box>
    </Box>
  );
}
