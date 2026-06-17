import { Box } from "@mui/material";
import { useState } from "react";

import Header from "../components/Header";
import SideBar from "../components/SideBar";
import FoldersList from "../components/FoldersList";
import FolderDetail from "../components/FolderDetails";
import CreateFolder from "../components/CreateFolder";
import ConceptionInsert from "../components/ConceptionInsert";
import ConceptionVision from "../components/ConceptionVision";
import ConceptionVisionTab from "../components/ConceptionVisionTab"; 
import CompteManager from "../components/CompteManager";
import Allbacklogboxs from "../components/Allbacklogboxs";
import Processus from "../components/Processus";


import { fetchFolderById } from "../Axios/folderAxios";
import { fetchConceptionByFolder } from "../Axios/conceptionAxios";

export default function Dashboard({ user }) {
  const [currentPage,    setCurrentPage]    = useState("dashboard");
  const [viewMode,       setViewMode]       = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [conceptionData, setConceptionData] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [folders,        setFolders]        = useState([]);
  const [conceptionViewMode, setConceptionViewMode] = useState("table");


  // ── Fetch single folder details ──────────────────────────────────────────
  const handleSelectFolder = async (folder_id) => {
    try {
      const data = await fetchFolderById(folder_id);
      setSelectedFolder(data);
      setActiveFolderId(folder_id);
      setViewMode("detail");
    } catch (err) {
      console.error(err);
    }
  };

  // ── Refresh folder data after an update call ─────────────────────────────
  const handleRefreshFolder = async (folder_id) => {
    try {
      const data = await fetchFolderById(folder_id);
      setSelectedFolder(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  // ── Back to folders list view ─────────────────────────────────────────────
  const handleBack = () => {
    setViewMode("list");
    setSelectedFolder(null);
    setActiveFolderId(null);
  };

  // ── Navigation to launch a new conception workflow ────────────────────────
  const handleLaunchConception = (folder_id) => {
    setActiveFolderId(folder_id);
    setCurrentPage("conception-insert");
  };

  // ── Navigation to view an existing conception ────────────────────────────
  const handleViewConception = async (folder_id, mode="table") => {
    try {
      const data = await fetchConceptionByFolder(folder_id);
      setConceptionData(data);
      setConceptionViewMode(mode);
      setCurrentPage("conception-vision");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideBar setCurrentPage={setCurrentPage} currentPage={currentPage} />

        <Box sx={{ flex: 1, overflowY: "auto" }}>

          {/* DASHBOARD SYSTEM — CURRENT PAGE SUB-VIEWS */}
          {currentPage === "dashboard" && (
            <>
              {/* 1. FOLDER-LIST VIEW */}
              {viewMode === "list" && (
                <FoldersList onSelectFolder={handleSelectFolder} onFoldersLoaded={setFolders} />
              )}
              
              {/* 2. FOLDER-DETAIL VIEW */}
              {viewMode === "detail" && (
                <FolderDetail
                  folder={selectedFolder}
                  onBack={handleBack}
                  onLaunchConception={handleLaunchConception}
                  onViewConception={handleViewConception}
                  onRefresh={handleRefreshFolder}
                  currentUser={user}
                  onStartEdit={() => setViewMode("edit")}
                />
              )}
              
              {/* 3. EDIT-MODE VIEW */}
              {viewMode === "edit" && (
                <CreateFolder
                  editFolder={selectedFolder}
                  onCreate={async (updated) => {
                    // Go back to details layout view
                    setViewMode("detail");
                    // Trigger API call to pull fresh server data for this folder
                    await handleRefreshFolder(selectedFolder.folder_id);
                  }}
                  onCancel={() => setViewMode("detail")}
                />
              )}
            </>
          )}

          {/* ACCOUNT-MANAGER VIEW */}
          {currentPage === "comptes" && <CompteManager />}

          {/* ACCOUNT-MANAGER VIEW */}
          {currentPage === "folders" && (
            <FoldersList onSelectFolder={handleSelectFolder} onFoldersLoaded={setFolders} />
          )}

          {/* CREATE NEW FOLDER VIEW */}
          {currentPage === "create-folder" && <CreateFolder />}

          {/*INSERT CONCEPTION VIEW */}
          {currentPage === "conception-insert" && (
            <ConceptionInsert
              folderId={activeFolderId}
              folderName={selectedFolder?.folder_name || ""}
              setCurrentPage={setCurrentPage}
              setConceptionData={setConceptionData}
            />
          )}

          {/*VISUALISATION CONCEPTION VIEW */}
          {currentPage === "conception-vision" && (
            conceptionViewMode === "table" ? (
              /* TABLE VIEW MODE */
              <ConceptionVisionTab
                conceptionData={conceptionData}
                folderId={activeFolderId}
                setCurrentPage={setCurrentPage}
              />
            ) : (
              /* CHARTS DIAGRAMS VIEW MODE */
              <ConceptionVision
                conceptionData={conceptionData}
                folderId={activeFolderId}
                setCurrentPage={setCurrentPage}
              />
            )
          )}

          {/* Backlog messaging subsystem */}
          {currentPage === "messagerie" && (
            <Allbacklogboxs folders={folders} />
          )}

          {/* Process tracking system */}
          {currentPage === "processus" && <Processus />}
        </Box>
      </Box>
    </Box>
  );
}
