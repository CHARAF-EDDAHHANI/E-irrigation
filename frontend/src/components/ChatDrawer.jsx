import { useState, useEffect, useRef } from "react";
import {
  Drawer, Box, Typography, Stack, Avatar, IconButton,
  TextField, CircularProgress, Chip, Tooltip,
} from "@mui/material";
import {
  Close, Send, ChatBubbleOutlined, AttachFile, Article, InsertDriveFile,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { fetchOrCreateChatByFolder, sendMessage } from "../Axios/backLogAxios";

const T = {
  bg: "#f8fafc", surface: "#ffffff", border: "#e2e8f0",
  green: "#16a34a", greenDk: "#14532d", greenLt: "#f0fdf4", greenBd: "#bbf7d0",
  blue: "#2563eb", blueLt: "#eff6ff",
  text: "#0f172a", sub: "#475569", muted: "#94a3b8",
  bubbleSelf: "#2563eb", bubbleOther: "#f1f5f9",
  error: "#dc2626",
};

const DRAWER_WIDTH = 420;

const fmtTime = (iso) => {
  try {
    const d = new Date(iso);
    const diff = (new Date() - d) / 1000;
    if (diff < 60)    return "à l'instant";
    if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch { return ""; }
};

// ── FILE ATTACHMENT PREVIEW ───────────────────────────────────────────────────
function FileAttachment({ file_url, file_name, isSelf }) {
  if (!file_url) return null;
  const isPDF = file_name?.toLowerCase().endsWith(".pdf");
  return (
    <Box
      component="a"
      href={file_url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex", alignItems: "center", gap: 1,
        mt: 0.75, p: "8px 12px", borderRadius: "10px",
        bgcolor: isSelf ? alpha("#fff", 0.15) : alpha(T.green, 0.07),
        border: `0.5px solid ${isSelf ? alpha("#fff", 0.25) : T.greenBd}`,
        textDecoration: "none",
        transition: "opacity 0.15s",
        "&:hover": { opacity: 0.8 },
      }}
    >
      {isPDF
        ? <Article sx={{ fontSize: 16, color: isSelf ? "#fff" : T.green }} />
        : <InsertDriveFile sx={{ fontSize: 16, color: isSelf ? "#fff" : T.green }} />
      }
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: isSelf ? "#fff" : T.green, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
        {file_name || "Fichier joint"}
      </Typography>
    </Box>
  );
}

// ── BUBBLE ────────────────────────────────────────────────────────────────────
function Bubble({ msg, currentUserId }) {
  const isSelf = msg.sender_id === currentUserId;
  return (
    <Stack direction={isSelf ? "row-reverse" : "row"} spacing={1} alignItems="flex-end" sx={{ mb: 1.5 }}>
      {!isSelf && (
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: alpha(T.green, 0.15), color: T.green, flexShrink: 0 }}>
          {(msg.sender_type || "?")[0].toUpperCase()}
        </Avatar>
      )}
      <Box sx={{ maxWidth: "72%" }}>
        {!isSelf && (
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.muted, mb: "3px", ml: "4px" }}>
            {(() => {
              const roleLabels = {
                admin: "Admin",
                agent: "Agent",
                company: "Société",
                farmer: "Agriculteur"
              };
              return roleLabels[msg.sender_type] || "Message";
            })()}
          </Typography>

        )}
        <Box sx={{
          px: 1.8, py: 1.1,
          bgcolor: isSelf ? T.bubbleSelf : T.bubbleOther,
          color: isSelf ? "#fff" : T.text,
          borderRadius: isSelf ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          boxShadow: isSelf ? `0 2px 10px ${alpha(T.blue, 0.25)}` : "0 1px 4px rgba(0,0,0,0.06)",
          wordBreak: "break-word",
        }}>
          {msg.content && (
            <Typography sx={{ fontSize: 13.5, lineHeight: 1.5 }}>{msg.content}</Typography>
          )}
          <FileAttachment file_url={msg.file_url} file_name={msg.file_name} isSelf={isSelf} />
        </Box>
        <Typography sx={{ fontSize: 10, color: T.muted, mt: "3px", textAlign: isSelf ? "right" : "left", mr: isSelf ? "4px" : 0, ml: isSelf ? 0 : "4px" }}>
          {fmtTime(msg.created_at)}
        </Typography>
      </Box>
    </Stack>
  );
}

// ── DATE SEPARATOR ────────────────────────────────────────────────────────────
function DateSep({ label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ my: 2 }}>
      <Box sx={{ flex: 1, height: "1px", bgcolor: T.border }} />
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: T.border }} />
    </Stack>
  );
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach(msg => {
    const label = new Date(msg.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    if (label !== lastDate) { groups.push({ type: "date", label }); lastDate = label; }
    groups.push({ type: "msg", msg });
  });
  return groups;
}

// ── MAIN DRAWER ───────────────────────────────────────────────────────────────
export default function ChatDrawer({ open, onClose, folder, currentUser }) {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [backlogbox_id, setBacklogbox_id] = useState(null);
  const [error,         setError]         = useState(null);
  const [attachedFile,  setAttachedFile]  = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef    = useRef(null);

  useEffect(() => {
    if (!open || !folder?.folder_id) return;
    setLoading(true);
    setError(null);
    fetchOrCreateChatByFolder(folder.folder_id)
      .then(data => {
        setBacklogbox_id(data.backlogbox_id);
        setMessages(data.messages || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, folder?.folder_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    e.target.value = "";
  };

  const removeAttachment = () => setAttachedFile(null);

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && !attachedFile) || !backlogbox_id) return;

    setInput("");
    setAttachedFile(null);
    setSending(true);

    // Optimistic update
    const optimistic = {
      message_id:  `temp-${Date.now()}`,
      sender_id:   currentUser?.user_id,
      sender_name: currentUser?.fullName || "Moi",
      content,
      file_url:    attachedFile ? URL.createObjectURL(attachedFile) : null,
      file_name:   attachedFile?.name || null,
      created_at:  new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const updatedBox = await sendMessage(backlogbox_id, content, attachedFile);
      setMessages(updatedBox.messages || []);
    } catch {
      setMessages(prev => prev.filter(m => m.message_id !== optimistic.message_id));
      setInput(content);
      setAttachedFile(attachedFile);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const grouped = groupByDate(messages);
  const canSend = (input.trim() || attachedFile) && backlogbox_id && !error;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: DRAWER_WIDTH, bgcolor: T.bg, border: "none",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
        },
      }}
    >

      {/* HEADER */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: 2.5, py: 2, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${alpha(T.green, 0.3)}`, flexShrink: 0 }}>
              <ChatBubbleOutlined sx={{ fontSize: 17, color: "white" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1 }}>Messagerie</Typography>
              <Typography sx={{ fontSize: 11, color: T.muted, mt: "2px" }}>{folder?.folder_name || "Dossier"}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Chip size="small" label={`${messages.length} msg`} sx={{ fontSize: 10, fontWeight: 700, bgcolor: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}`, height: 22 }} />
            <IconButton size="small" onClick={onClose} sx={{ color: T.muted, "&:hover": { bgcolor: T.bg, color: T.text } }}>
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* MESSAGES AREA */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: T.border, borderRadius: 2 } }}>

        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", gap: 1.5 }}>
            <CircularProgress size={28} sx={{ color: T.green }} />
            <Typography sx={{ fontSize: 12, color: T.muted }}>Chargement...</Typography>
          </Stack>
        )}

        {!loading && error && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: T.error, fontWeight: 600 }}>Erreur de connexion</Typography>
            <Typography sx={{ fontSize: 12, color: T.muted }}>{error}</Typography>
          </Stack>
        )}

        {!loading && !error && messages.length === 0 && (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", gap: 1.5, opacity: 0.7 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: T.greenLt, border: `1px solid ${T.greenBd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChatBubbleOutlined sx={{ fontSize: 24, color: T.green }} />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.sub }}>Aucun message</Typography>
            <Typography sx={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>Démarrez la conversation sur ce dossier.</Typography>
          </Stack>
        )}

        {!loading && !error && grouped.map((item, i) =>
          item.type === "date"
            ? <DateSep key={`date-${i}`} label={item.label} />
            : <Bubble key={item.msg.message_id} msg={item.msg} currentUserId={currentUser?.user_id} />
        )}

        <div ref={bottomRef} />
      </Box>

      {/* FILE PREVIEW STRIP */}
      {attachedFile && (
        <Box sx={{ bgcolor: T.surface, borderTop: `0.5px solid ${T.border}`, px: 2, pt: 1.25, pb: 0.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ p: "8px 12px", borderRadius: "8px", bgcolor: T.greenLt, border: `0.5px solid ${T.greenBd}` }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Article sx={{ fontSize: 16, color: T.green }} />
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: T.text }}>{attachedFile.name}</Typography>
                <Typography sx={{ fontSize: 10, color: T.muted }}>{(attachedFile.size / 1024).toFixed(0)} KB</Typography>
              </Box>
            </Stack>
            <IconButton size="small" onClick={removeAttachment} sx={{ color: T.error, p: 0.25 }}>
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* INPUT AREA */}
      <Box sx={{ bgcolor: T.surface, borderTop: `1px solid ${T.border}`, px: 2, py: 1.5, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">

          {/* Attach button */}
          <Tooltip title="Joindre un fichier PDF">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || !!error || !backlogbox_id}
              sx={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                bgcolor: attachedFile ? T.greenLt : T.bg,
                border: `0.5px solid ${attachedFile ? T.greenBd : T.border}`,
                color: attachedFile ? T.green : T.muted,
                "&:hover": { bgcolor: T.greenLt, borderColor: T.greenBd, color: T.green },
              }}
            >
              <AttachFile sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileSelect} />

          {/* Text input */}
          <TextField
            fullWidth multiline maxRows={4} size="small"
            placeholder="Écrire un message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading || !!error || !backlogbox_id}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", fontSize: 13.5, bgcolor: T.bg,
                "& fieldset": { borderColor: T.border },
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: T.green, borderWidth: "1.5px" },
                "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(T.green, 0.1)}` },
              },
            }}
          />

          {/* Send button */}
          <IconButton
            onClick={handleSend}
            disabled={!canSend || sending}
            sx={{
              width: 40, height: 40, flexShrink: 0,
              bgcolor: canSend ? T.green : T.border,
              color: canSend ? "white" : T.muted,
              borderRadius: "12px", transition: "all 0.15s",
              "&:hover": { bgcolor: canSend ? T.greenDk : T.border, transform: canSend ? "scale(1.05)" : "none" },
              "&.Mui-disabled": { bgcolor: T.border, color: T.muted },
            }}
          >
            {sending ? <CircularProgress size={16} sx={{ color: "white" }} /> : <Send sx={{ fontSize: 17 }} />}
          </IconButton>
        </Stack>

        <Typography sx={{ fontSize: 10, color: T.muted, mt: "6px", ml: "4px" }}>
          Entrée pour envoyer · Maj+Entrée pour nouvelle ligne · 📎 PDF uniquement
        </Typography>
      </Box>

    </Drawer>
  );
}