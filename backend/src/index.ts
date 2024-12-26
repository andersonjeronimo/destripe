import dotenv from "dotenv";
dotenv.config();

import destripeABI from "../Destripe.json";
import collectionABI from "../Collection.json";
import { ethers } from "ethers";
import { Request, Response, NextFunction } from "express";

function getContract(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    return new ethers.Contract(`${process.env.DESTRIPE_CONTRACT}`, destripeABI.abi, provider);
}

function getCollectionContract(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    return new ethers.Contract(`${process.env.COLLECTION_CONTRACT}`, collectionABI.abi, provider);
}

function ownerOf(tokenId: number): Promise<string> {
    return getCollectionContract().ownerOf(tokenId);
}

function getSigner(): ethers.Contract {
    const provider = new ethers.InfuraProvider(`${process.env.NETWORK}`, `${process.env.INFURA_API_KEY}`)
    const signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
    return new ethers.Contract(`${process.env.DESTRIPE_CONTRACT}`, destripeABI.abi, signer);
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
    //console.log(tx.hash);
    return tx.hash;
}

async function paymentCycle() {
    console.log(`Executing the payment cycle...`);
    //const customers: string[] = [`0xAd886e0aeCEbe71C1DA549FccCa811BB2662d91b`];
    const customers: string[] = await getCustomers();
    //console.log(customers);
    //processamento...
    for (let index = 0; index < customers.length; index++) {
        if (customers[index] !== ethers.ZeroAddress) {
            const customer = await getCustomerInfo(customers[index]);
            //await pay(customers[index]);
            if (customer.nextPayment <= (Date.now() / 1000)) {
                await pay(customers[index]);
            }
        }
    }
    console.log(`Finishing the payment cycle...`);
}

//paymentCycle();

const interval = 60 * 60 * 1000;
setInterval(paymentCycle, interval);

const PORT = parseInt(`${process.env.PORT || 3000}`);
import app from "./app";

//rotas
app.get("/nfts/:tokenId", async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace(".json", "");
    let ownerAddess = ethers.ZeroAddress;
    try {
        ownerAddess = await ownerOf(parseInt(tokenId));
    } catch (error) {
        console.log(error);
    }

    if (ownerAddess === ethers.ZeroAddress)
        res.sendStatus(404);

    res.json({
        name: "Access #" + tokenId,
        description: "Your access to the system",
        image: `${process.env.BACKEND_URL}/images/${tokenId}.png`
    })
})

app.get("/images/:tokenId", async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId;
    let ownerAddess = ethers.ZeroAddress;
    try {
        ownerAddess = await ownerOf(parseInt(tokenId));
    } catch (error) {
        console.log(error);
    }

    if (ownerAddess === ethers.ZeroAddress)
        res.sendStatus(404);

    res.download(`${__dirname}/images/${tokenId}.png`);
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}.`));