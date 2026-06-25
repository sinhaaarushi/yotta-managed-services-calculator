import { createApp } from "./createApp.js";

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Cloud calculator running at http://localhost:${PORT}`);
});

export default app;
