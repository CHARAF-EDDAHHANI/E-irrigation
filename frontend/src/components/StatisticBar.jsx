import { Card, Box, Typography } from "@mui/material";

export default function StatisticBar() {
  const mockStatistics = [
    { id: "active", title: "Dossiers actifs", value: 23, subtitle: "ce mois" },
    { id: "pending", title: "En attente", value: 7, subtitle: "à traiter" },
    { id: "closed", title: "Clôturés", value: 41, subtitle: "année 2025" },
    { id: "rate", title: "Taux validation", value: "78%", subtitle: "moyen" },
  ];

  return (
    <Card
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      {mockStatistics.map((stat) => (
        <Box
          key={stat.id}
          sx={{
            flex: "1 1 120px",
            minWidth: 120,
            p:2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {stat.title}
          </Typography>

          <Typography variant="h5" fontWeight="bold">
            {stat.value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {stat.subtitle}
          </Typography>
        </Box>
      ))}
    </Card>
  );
}