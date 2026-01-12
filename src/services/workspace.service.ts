import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Workspace, WorkspaceType, WorkspaceMember, MemberRole } from '../types';

/**
 * Create a new workspace
 */
export async function createWorkspace(
  ownerId: string,
  name: string,
  type: WorkspaceType = 'personal'
): Promise<string> {
  const workspaceRef = doc(collection(db, 'workspaces'));

  const workspace: Omit<Workspace, 'id'> = {
    name,
    type,
    ownerId,
    currency: 'ILS',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(workspaceRef, {
    ...workspace,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Add owner as member
  await addWorkspaceMember(workspaceRef.id, ownerId, 'owner');

  return workspaceRef.id;
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));

  if (!workspaceDoc.exists()) {
    return null;
  }

  const data = workspaceDoc.data();
  return {
    id: workspaceDoc.id,
    name: data.name,
    type: data.type,
    ownerId: data.ownerId,
    currency: data.currency,
    icon: data.icon,
    color: data.color,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  // Get workspace IDs where user is a member
  const membersQuery = query(
    collection(db, 'workspace_members'),
    where('uid', '==', userId)
  );

  const membersSnapshot = await getDocs(membersQuery);
  const workspaceIds = membersSnapshot.docs.map(doc => doc.data().workspaceId);

  if (workspaceIds.length === 0) {
    return [];
  }

  // Get workspace details
  const workspaces: Workspace[] = [];
  for (const workspaceId of workspaceIds) {
    const workspace = await getWorkspace(workspaceId);
    if (workspace) {
      workspaces.push(workspace);
    }
  }

  return workspaces.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Update workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Workspace>
): Promise<void> {
  const workspaceRef = doc(db, 'workspaces', workspaceId);
  await updateDoc(workspaceRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete workspace and all related data
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete workspace document
  batch.delete(doc(db, 'workspaces', workspaceId));

  // Delete all members
  const membersQuery = query(
    collection(db, 'workspace_members'),
    where('workspaceId', '==', workspaceId)
  );
  const membersSnapshot = await getDocs(membersQuery);
  membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // Delete all categories
  const categoriesQuery = query(
    collection(db, 'categories'),
    where('workspaceId', '==', workspaceId)
  );
  const categoriesSnapshot = await getDocs(categoriesQuery);
  categoriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // Delete all transactions
  const transactionsQuery = query(
    collection(db, 'transactions'),
    where('workspaceId', '==', workspaceId)
  );
  const transactionsSnapshot = await getDocs(transactionsQuery);
  transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
}

/**
 * Add member to workspace
 */
export async function addWorkspaceMember(
  workspaceId: string,
  uid: string,
  role: MemberRole
): Promise<void> {
  const memberRef = doc(db, 'workspace_members', `${workspaceId}_${uid}`);

  await setDoc(memberRef, {
    workspaceId,
    uid,
    role,
    addedAt: serverTimestamp(),
  });
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const membersQuery = query(
    collection(db, 'workspace_members'),
    where('workspaceId', '==', workspaceId)
  );

  const snapshot = await getDocs(membersQuery);

  const members: WorkspaceMember[] = [];
  for (const memberDoc of snapshot.docs) {
    const data = memberDoc.data();

    // Get user data
    const userDoc = await getDoc(doc(db, 'users', data.uid));
    const userData = userDoc.data();

    members.push({
      uid: data.uid,
      email: userData?.email || '',
      displayName: userData?.displayName || null,
      role: data.role,
      addedAt: data.addedAt?.toDate() || new Date(),
    });
  }

  return members.sort((a, b) => {
    // Sort by role priority
    const roleOrder = { owner: 0, admin: 1, member: 2, viewer: 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });
}

/**
 * Update member role
 */
export async function updateMemberRole(
  workspaceId: string,
  uid: string,
  role: MemberRole
): Promise<void> {
  const memberRef = doc(db, 'workspace_members', `${workspaceId}_${uid}`);
  await updateDoc(memberRef, { role });
}

/**
 * Remove member from workspace
 */
export async function removeMember(workspaceId: string, uid: string): Promise<void> {
  const memberRef = doc(db, 'workspace_members', `${workspaceId}_${uid}`);
  await deleteDoc(memberRef);
}

/**
 * Check if user has access to workspace
 */
export async function hasWorkspaceAccess(
  workspaceId: string,
  uid: string
): Promise<boolean> {
  const memberRef = doc(db, 'workspace_members', `${workspaceId}_${uid}`);
  const memberDoc = await getDoc(memberRef);
  return memberDoc.exists();
}

/**
 * Get user role in workspace
 */
export async function getUserRole(
  workspaceId: string,
  uid: string
): Promise<MemberRole | null> {
  const memberRef = doc(db, 'workspace_members', `${workspaceId}_${uid}`);
  const memberDoc = await getDoc(memberRef);

  if (!memberDoc.exists()) {
    return null;
  }

  return memberDoc.data().role;
}
