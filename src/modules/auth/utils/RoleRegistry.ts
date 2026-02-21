// utils/RoleRegistry.ts

export type RoleMetadata = {
  isBillable: boolean;
  billingScope: 'profile' | 'shared' | 'none';
  displayName: string;
  trial?: boolean;
  trialLength?: number; // in days
};

export const RoleRegistry: Record<string, RoleMetadata> = {
  admin: {
    isBillable: false,
    billingScope: 'none',
    displayName: 'Admin',
  },
  player: {
    isBillable: false,
    billingScope: 'none',
    displayName: 'Player',
  },
  storyweaver: {
    isBillable: false,
    billingScope: 'none',
    displayName: 'Storyweaver',
  },
  // add others as needed
};
