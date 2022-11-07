const special = "5f246b0b-42f3-4fb9-90d5-f8908a69aeef"
const tier1 = "2a481eb9-e37d-47cc-b471-1fa413e98b72"
const tier2 = "ad0e8bd0-d5a3-46f8-9d9c-a8a2e97f4da3"
const tier3 = "1692d62b-9224-4128-8690-66be6fb69d29"
const keys = [special, tier1, tier2, tier3]

export function isPremium() {
  const m = game.modules.get("alpha-premium");
  if (m?.active && keys.includes(m.license)) {
    return true;
  }
  return false;
}
