import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health';
import { playersRouter } from './routes/players';
import { searchRouter } from './routes/search';
import { metricsRouter } from './routes/metrics';
import { draftRouter } from './routes/draft';
import { mockDraftRouter } from './routes/mockDraft';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', playersRouter);
app.use('/api', searchRouter);
app.use('/api', metricsRouter);
app.use('/api', draftRouter);
app.use('/api', mockDraftRouter);

export default app;
