/**
 * SettingsRegistry - Central registry for game settings/worlds
 *
 * This ensures consistency when filtering content by setting
 * (e.g., "Woven Realms" vs "cyberpunk" content)
 */

export enum GameSetting {
  WOVEN_REALMS = 'woven-realms',
  CYBERPUNK = 'cyberpunk',
  // TODO: Add more settings as they are created
}

export const SettingsRegistry = {
  /**
   * Get all available settings
   */
  getAll(): GameSetting[] {
    return Object.values(GameSetting);
  },

  /**
   * Validate if a setting exists
   */
  isValid(setting: string): boolean {
    return Object.values(GameSetting).includes(setting as GameSetting);
  },

  /**
   * Get setting metadata (display name, description, etc.)
   */
  getMetadata(setting: GameSetting): { displayName: string; description: string } | null {
    const metadata: Record<GameSetting, { displayName: string; description: string }> = {
      [GameSetting.WOVEN_REALMS]: {
        displayName: 'Woven Realms',
        description: 'A fantasy world of magic and mystery',
      },
      [GameSetting.CYBERPUNK]: {
        displayName: 'Cyberpunk 2080',
        description: 'A dystopian future of technology and corporate power',
      },
      // TODO: Add metadata for additional settings
    };

    return metadata[setting] || null;
  },
};
