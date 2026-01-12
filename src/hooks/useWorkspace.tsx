import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth } from './useAuth';
import {
  getUserWorkspaces,
  getWorkspace,
  createWorkspace as createWorkspaceService,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole as updateMemberRoleService,
  removeMember as removeMemberService,
} from '../services/workspace.service';
import { initializeDefaultCategories } from '../services/category.service';
import { Workspace, WorkspaceType, WorkspaceContextType, WorkspaceMember, MemberRole } from '../types';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user workspaces
  const loadWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const userWorkspaces = await getUserWorkspaces(user.uid);
      setWorkspaces(userWorkspaces);

      // Set current workspace
      if (userWorkspaces.length > 0) {
        const defaultWorkspace = user.defaultWorkspaceId
          ? userWorkspaces.find((w) => w.id === user.defaultWorkspaceId)
          : null;

        setCurrentWorkspace(defaultWorkspace || userWorkspaces[0]);
      } else {
        // Create first workspace for new users
        const workspaceId = await createWorkspaceService(
          user.uid,
          'המרחב שלי',
          'personal'
        );
        await initializeDefaultCategories(workspaceId);

        const newWorkspace = await getWorkspace(workspaceId);
        if (newWorkspace) {
          setWorkspaces([newWorkspace]);
          setCurrentWorkspace(newWorkspace);
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load workspace members
  const loadMembers = useCallback(async () => {
    if (!currentWorkspace) {
      setMembers([]);
      return;
    }

    try {
      const workspaceMembers = await getWorkspaceMembers(currentWorkspace.id);
      setMembers(workspaceMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const createWorkspace = async (name: string, type: WorkspaceType): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const workspaceId = await createWorkspaceService(user.uid, name, type);
    await initializeDefaultCategories(workspaceId);

    await loadWorkspaces();
    return workspaceId;
  };

  const updateWorkspace = async (
    workspaceId: string,
    data: Partial<Workspace>
  ): Promise<void> => {
    await updateWorkspaceService(workspaceId, data);
    await loadWorkspaces();

    // Update current workspace if it's the one being updated
    if (currentWorkspace?.id === workspaceId) {
      const updated = await getWorkspace(workspaceId);
      setCurrentWorkspace(updated);
    }
  };

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    await deleteWorkspaceService(workspaceId);
    await loadWorkspaces();

    // Switch to another workspace if current was deleted
    if (currentWorkspace?.id === workspaceId && workspaces.length > 1) {
      const otherWorkspace = workspaces.find((w) => w.id !== workspaceId);
      if (otherWorkspace) {
        setCurrentWorkspace(otherWorkspace);
      }
    }
  };

  const addMember = async (
    workspaceId: string,
    email: string,
    role: MemberRole
  ): Promise<void> => {
    // In a real app, you'd lookup the user by email first
    // For now, this is a simplified version
    await addWorkspaceMember(workspaceId, email, role);
    await loadMembers();
  };

  const updateMemberRole = async (
    workspaceId: string,
    uid: string,
    role: MemberRole
  ): Promise<void> => {
    await updateMemberRoleService(workspaceId, uid, role);
    await loadMembers();
  };

  const removeMember = async (workspaceId: string, uid: string): Promise<void> => {
    await removeMemberService(workspaceId, uid);
    await loadMembers();
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    members,
    loading,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    updateMemberRole,
    removeMember,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
