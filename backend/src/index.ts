import dotenv from "dotenv";
dotenv.config();

import artifacts from "../Destripe.json";
import { ethers } from "ethers";

function getContract(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    return new ethers.Contract(`${process.env.DESTRIPE_CONTRACT}`, artifacts.abi, provider);
}

function getSigner(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    const signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
    return new ethers.Contract(`${process.env.DESTRIPE_CONTRACT}`, artifacts.abi, signer);
}

function getCustomers(): Promise<string[]> {
    return getContract().getCustomers();
}

type CustomerInfo = {
    tokenId: number;
    index: number;
    nextPayment: number;
}

function getCustomerInfo(customerAddress: string): Promise<CustomerInfo> {
    return getContract().payments(customerAddress) as Promise<CustomerInfo>;
}

async function pay(customerAddress: string): Promise<string> {
    const tx = await getSigner().payMonthlyFee(customerAddress);
    const receipt = await tx.wait();
    console.log(tx.hash);
    return tx.hash;
}

async function paymentCycle() {
    console.log(`Executing the payment cycle...`);
    const customers: string[] = [`0xAd886e0aeCEbe71C1DA549FccCa811BB2662d91b`];//await getCustomers();
    console.log(customers);
    //processamento...
    for (let index = 0; index < customers.length; index++) {
        if (customers[index] !== ethers.ZeroAddress) {
            const customer = await getCustomerInfo(customers[index]);            
            await pay(customers[index]);
            /* if (customer.nextPayment <= (Date.now() / 1000)) {
                await pay(customers[index]);
            } */
        }
    }
    console.log(`Finishing the payment cycle...`);
}

paymentCycle();

const interval = 60 * 60 * 1000;
setInterval(paymentCycle, interval);

const PORT = parseInt(`${process.env.PORT || 3000}`);
import app from "./app";

app.listen(PORT, () => console.log(`Server is running at ${PORT}.`));