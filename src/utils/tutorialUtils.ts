/**
 * Tutorial State Management Utilities
 */

// Check if a scenario ID is a tutorial scenario
export function isTutorialScenario(scenarioId: number): boolean {
  return scenarioId >= 1001 && scenarioId <= 1003;
}

// Get the next tutorial scenario ID (or null if tutorial complete)
export function getNextTutorialScenario(currentScenarioId: number): number | null {
  if (currentScenarioId === 1001) return 1002;
  if (currentScenarioId === 1002) return 1003;
  if (currentScenarioId === 1003) return null; // Tutorial complete
  return null;
}

// Get first tutorial scenario
export function getFirstTutorialScenario(): number {
  return 1001;
}