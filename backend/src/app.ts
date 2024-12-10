import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

const app = express();

app.use(morgan('tiny'));

app.use(cors());

app.use(helmet());

app.use(express.json());

/* app.use("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World");
}) */

/* app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send(error.message);
})
 */
//rotas
app.get("/nfts/:tokenId", (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace(".json", "");
    res.json({
        name: "Access #" + tokenId,
        description: "Your access to the system",
        image: `${process.env.BACKEND_URL}/images/${tokenId}.png`
    })
})

app.get("/images/:tokenId", (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId;
    res.download(`${__dirname}/images/${tokenId}`);
})

export default app;