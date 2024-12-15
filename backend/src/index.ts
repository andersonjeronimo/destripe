import dotenv from "dotenv";
dotenv.config();

import artifacts from "../Destripe.json";
import { ethers } from "ethers";

function getContract(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    return new ethers.Contract(`${process.env.DESTRIPE_CONTRACT}`, artifacts.abi, provider);
}

function getCustomers(): Promise<string[]> {
    return getContract().getCustomers(); //testar
    //return getContract().customers();
}

async function payment() {
    console.log(`Executing the payment cycle...`);
    const customers = await getCustomers();
    console.log(customers);
    //processamento...
    console.log(`Finishing the payment cycle...`);
}

payment();

const interval = 60 * 60 * 1000;
setInterval(payment, interval);

const PORT = parseInt(`${process.env.PORT || 3000}`);
import app from "./app";

app.listen(PORT, () => console.log(`Server is running at ${PORT}.`));