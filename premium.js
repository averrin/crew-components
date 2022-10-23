export function isPremium() {
  const m = game.modules.get("alpha-premium");
  if (m?.active && m.license == "2a481eb9-e37d-47cc-b471-1fa413e98b72") {
    return true;
  }
  return false;
}
