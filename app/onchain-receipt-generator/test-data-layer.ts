// Temporary scratchpad — DELETE after Sub-step 3.2 verification
import { fetchReceipt } from "./lib/fetch-receipt";

async function test() {
  // Known recent transactions on each chain
  const tests = [
    {
      label: "Ethereum",
      hash: "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
    },
    {
      label: "Base",
      hash: "0x64e192d275b8eed83f7b3e54e57ad1643675f6dceaa7fe6f55afc35bfb539c7c",
    },
    {
      label: "BSC",
      hash: "0x8f080f1243858dd53181b6ff2c5e3bb4bf79729ad3b12c121b25dbaead9ed72b",
    },
    {
      label: "Solana",
      hash: "3B2ej83XyRxmKmsf77FQMoVzbDbFqm74KViZ2RSnk5pXpJ1YB2cNa9QuYNGwigwxPZk374KhonBvL5PBHri9BU6e",
    },
  ];

  for (const t of tests) {
    console.log(`\n=== ${t.label}: ${t.hash.slice(0, 20)}... ===`);
    const result = await fetchReceipt(t.hash);
    console.log(JSON.stringify(result, null, 2));
  }
}

test();
