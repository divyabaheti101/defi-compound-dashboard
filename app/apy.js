import Compound from "@compound-finance/compound-js";

const provider = 'https://mainnet.infura.io/v3/fee8dd8de68a4101a446b3b41ed1c065';
const comptroller = Compound.util.getAddress(Compound.Comptroller);
const opf = Compound.util.getAddress(Compound.PriceFeed);

const cTokenDecimals = 8;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;
const ethMantissa = Math.pow(10, 18);

async function calculateSupplyAPY(cToken) {
    const supplyRatePerBlock = await Compound.eth.read(
        cToken,
        'function supplyRatePerBlock() view returns (uint256)',
        [],
        { provider }
    );

    return 100 * (Math.pow((supplyRatePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1);
}
