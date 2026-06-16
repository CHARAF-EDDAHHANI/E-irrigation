import { Box } from "@mui/material";
import { useState } from "react";

import Header from "../components/Header";
import SideBar from "../components/SideBar";
import FoldersList from "../components/FoldersList";
import FolderDetail from "../components/FolderDetails";
import CreateFolder from "../components/CreateFolder";
import ConceptionInsert from "../components/ConceptionInsert";
import ConceptionVision from "../components/ConceptionVision";
import CompteManager from "../components/CompteManager";
import Allbacklogboxs from "../components/Allbacklogboxs";
import Processus from "../components/Processus";

import { fetchFolderById } from "../Axios/folderAxios";
import { fetchConceptionByFolder } from "../Axios/conceptionAxios";

export default function Dashboard({user}) {
  const [currentPage,    setCurrentPage]    = useState("dashboard");
  const [viewMode,       setViewMode]       = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [conceptionData, setConceptionData] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);
  
  // ── ÉTAPE A : Stocker les dossiers au niveau global du Dashboard ──────────
  const [folders, setFolders] = useState([]);

  // ── Open folder detail ────────────────────────────────────────────────────
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

  // ── Back to list ──────────────────────────────────────────────────────────
  const handleBack = () => {
    setViewMode("list");
    setSelectedFolder(null);
    setActiveFolderId(null);
  };

  // ── Launch Conception (no existing conception) ────────────────────────────
  const handleLaunchConception = (folder_id) => {
    setActiveFolderId(folder_id);
    setCurrentPage("conception-insert");
  };

  // ── View Conception (existing conception found) ───────────────────────────
  const handleViewConception = async (folder_id) => {
    try {
      const data = await fetchConceptionByFolder(folder_id);
      setConceptionData(data);
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

          {/* DASHBOARD — folders list */}
          {currentPage === "dashboard" && (
            <>
              {/* 1. EDIT VIEW */}
              {viewMode === "list" && (
                <FoldersList onSelectFolder={handleSelectFolder} onFoldersLoaded={setFolders} />

              )}
              {/* 2. EDIT VIEW */}
              {viewMode === "detail" && (
                <FolderDetail
                  folder={selectedFolder}
                  onBack={handleBack}
                  onLaunchConception={handleLaunchConception}
                  onViewConception={handleViewConception}
                  currentUser={user}
                  //pass function for edit mode:
                  onStartEdit={() => setViewMode("edit")}
                />
              )}
              {/* 3. EDIT VIEW */}
              {viewMode === "edit" && (
              <CreateFolder
                editFolder={selectedFolder}
                onCreate={(updated) => {
                  // 1. RETURN TO DETAIL VIEW
                  setViewMode("detail");
                  // 2. UPDATE DATA OF SELECTED FOLDER
                  setSelectedFolder(updated);
                }}
                onCancel={() => setViewMode("detail")}
                />
              )}
            </>
          )}

          {/* OTHER PAGES */}
          {currentPage === "comptes" && <CompteManager />}

          {currentPage === "folders" && (
            <FoldersList onSelectFolder={handleSelectFolder} onFoldersLoaded={setFolders} />
          )}

          {currentPage === "create-folder" && <CreateFolder />}

          {currentPage === "conception-insert" && (
            <ConceptionInsert
              folderId={activeFolderId}
              folderName={selectedFolder?.folder_name || ""}
              setCurrentPage={setCurrentPage}
              setConceptionData={setConceptionData}
            />
          )}

          {currentPage === "conception-vision" && (
            <ConceptionVision
              conceptionData={conceptionData}
              folderId={activeFolderId}
              setCurrentPage={setCurrentPage}
            />
          )}
          
          {/*  backlogs */}
          {currentPage === "messagerie" && (
            <Allbacklogboxs folders={folders} />
          )}

          {/*  processus */}
          {currentPage === "processus" && <Processus />}
        </Box>
      </Box>
    </Box>
  );
}
