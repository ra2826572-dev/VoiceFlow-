import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Heart,
  Copy,
  Trash2,
  Edit2,
  Download,
  Clock,
  Filter,
  FileAudio,
  PenTool,
  Film,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ProjectItem, ProjectFolder, ProjectType } from '../types';

interface ProjectsViewProps {
  onOpenProject?: (project: ProjectItem) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenProject }) => {
  const { success, error } = useToast();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'downloads'>('all');

  // Modals
  const [createProjectModal, setCreateProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('voice');
  const [newProjectFolder, setNewProjectFolder] = useState<string>('');

  const [createFolderModal, setCreateFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderColor, setNewFolderColor] = useState<string>('#8B5CF6');

  const [renameModal, setRenameModal] = useState<{ open: boolean; projectId: string; currentName: string }>({
    open: false,
    projectId: '',
    currentName: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [selectedType, selectedFolderId, onlyFavorites]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedFolderId !== 'all') params.append('folderId', selectedFolderId);
      if (onlyFavorites) params.append('favorite', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.folders) setFolders(data.folders);
      }
    } catch {
      // Fallback
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      error('Please enter a project name');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          type: newProjectType,
          folderId: newProjectFolder || null,
          content: {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects([data.project, ...projects]);
        success(`Project "${newProjectName}" created!`);
        setCreateProjectModal(false);
        setNewProjectName('');
      }
    } catch {
      error('Failed to create project');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
      });
      if (res.ok) {
        const data = await res.json();
        setFolders([...folders, data.folder]);
        success(`Folder "${newFolderName}" created`);
        setCreateFolderModal(false);
        setNewFolderName('');
      }
    } catch {
      error('Failed to create folder');
    }
  };

  const handleToggleFavorite = async (project: ProjectItem) => {
    try {
      const updatedFav = !project.isFavorite;
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: updatedFav }),
      });
      setProjects(projects.map((p) => (p.id === project.id ? { ...p, isFavorite: updatedFav } : p)));
    } catch {}
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProjects([data.project, ...projects]);
        success('Project duplicated!');
      }
    } catch {
      error('Failed to duplicate project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter((p) => p.id !== id));
      success('Project removed');
    } catch {
      error('Failed to delete project');
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/projects/${renameModal.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameModal.currentName }),
      });
      setProjects(
        projects.map((p) =>
          p.id === renameModal.projectId ? { ...p, name: renameModal.currentName } : p
        )
      );
      success('Project renamed!');
      setRenameModal({ open: false, projectId: '', currentName: '' });
    } catch {
      error('Failed to rename project');
    }
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'voice':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'script':
        return <PenTool className="w-4 h-4 text-indigo-400" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-blue-400" />;
      case 'dubbing':
      case 'video':
        return <Film className="w-4 h-4 text-rose-400" />;
      case 'translation':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  // Filter projects by active tab
  let displayedProjects = [...projects];
  if (activeTab === 'recent') {
    displayedProjects.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } else if (activeTab === 'downloads') {
    displayedProjects = displayedProjects.filter((p) => p.downloadsCount > 0);
  }

  if (searchQuery) {
    displayedProjects = displayedProjects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
              <Folder className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Project Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase tracking-wide border border-purple-500/30">
              Cloud Storage
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize voices, scripts, multi-track audio master files, and dubbed videos into dedicated folders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateFolderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => setCreateProjectModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: All Projects, Recent Projects, Download History */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center bg-[#13141f] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recent'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Recent</span>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'downloads'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3 h-3" />
            <span>Download History</span>
          </button>
        </div>

        {/* Search & Favorites Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
              onlyFavorites
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Folders Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFolderId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedFolderId === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          📁 All Folders
        </button>

        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFolderId(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFolderId === f.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'voice', 'script', 'audio', 'video', 'translation'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              selectedType === t
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                : 'bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800/80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedProjects.map((proj) => {
          const folder = folders.find((f) => f.id === proj.folderId);
          return (
            <div
              key={proj.id}
              className="rounded-3xl bg-[#11121c] border border-slate-800 p-5 space-y-3 hover:border-purple-500/40 transition-all shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
                    {getTypeIcon(proj.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{proj.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono capitalize">
                      {proj.type} • {new Date(proj.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFavorite(proj)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      proj.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Folder indicator if assigned */}
              {folder && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                  <span>Folder: {folder.name}</span>
                </div>
              )}

              {/* Stats & Actions */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{proj.downloadsCount} downloads</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setRenameModal({ open: true, projectId: proj.id, currentName: proj.name })
                    }
                    className="p-1 text-slate-500 hover:text-white"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateProject(proj.id)}
                    className="p-1 text-slate-500 hover:text-white"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      {createProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#11121c] border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Create New Project</h3>
              <button onClick={() => setCreateProjectModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube Urdu Intro 01"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Type</label>
                <select
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="voice">AI Voiceover (TTS)</option>
                  <option value="script">AI Writing Script</option>
                  <option value="audio">Multi-Track Audio</option>
                  <option value="translation">Multi-Language Translation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Assign to Folder</label>
                <select
                  value={newProjectFolder}
                  onChange={(e) => setNewProjectFolder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">None (Workspace Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {createFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#11121c] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">New Project Folder</h3>
              <button onClick={() => setCreateFolderModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Ads"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Accent Color</label>
                <div className="flex items-center gap-2">
                  {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        newFolderColor === c ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#11121c] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Rename Project</h3>
            <form onSubmit={handleRenameProject} className="space-y-3">
              <input
                type="text"
                required
                value={renameModal.currentName}
                onChange={(e) =>
                  setRenameModal({ ...renameModal, currentName: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModal({ open: false, projectId: '', currentName: '' })}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
