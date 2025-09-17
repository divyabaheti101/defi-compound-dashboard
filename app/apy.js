import Compound, { comp } from "@compound-finance/compound-js";

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


async function calculateCompAPY(cToken, ticker, underlyingDecimals ) {
    let compSpeed = await Compound.eth.read(
        comptroller,
        'function compSpeeds(address) view returns (uint256)',
        [cToken],
        { provider }
    );

    let compPrice = await Compound.eth.read(
        opf,
        'function price(string) view returns (uint256)',
        [Compound.COMP],
        { provider }
    );

    let underlyingPrice = await Compound.eth.read(
        opf,
        'function price(string) view returns (uint256)',
        [ticker],
        { provider }
    );

    let totalSupply = await Compound.eth.read(
        cToken,
        'function totalSupply() view returns (uint256)',
        [],
        { provider }
    );

    let exhchangeRate = await Compound.eth.read(
        cToken,
        'function exchangeRateCurrent() view returns (uint256)',
        [],
        { provider }
    );

    compSpeed = compSpeed / ethMantissa;
    compPrice = compPrice / 1e6;
    underlyingPrice = underlyingPrice / 1e6;
    exhchangeRate = +exhchangeRate.toString() / ethMantissa;
    totalSupply = +totalSupply.toString() * exhchangeRate * underlyingPrice / Math.pow(10, underlyingDecimals);

    const compPerDay = compSpeed * blocksPerDay;

    return compPrice * compPerDay * daysPerYear * 100 / totalSupply;
}

async function calculateAPY(cTokenTicker, underlyingTicker){
    const underlyingDecimals = Compound.decimals[cTokenTicker];
    const cTokenAddress = Compound.util.getAddress(cTokenTicker);
    const supplyAPY = await calculateSupplyAPY(cTokenAddress);
    const compAPY = await calculateCompAPY(cTokenAddress, underlyingTicker, underlyingDecimals);
    return { ticker: underlyingTicker, supplyAPY, compAPY};
}

export default calculateAPY;
