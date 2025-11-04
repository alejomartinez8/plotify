export interface Collaborator {
  id: string;
  name: string;
  photoFileId: string | null;
  photoFileName: string | null;
  photoFileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LotAssignment {
  lotId: string;
  lotNumber: string;
  owner: string;
  assignedAt: Date;
}

export interface CollaboratorWithLots extends Collaborator {
  lotAssignments: LotAssignment[];
}
