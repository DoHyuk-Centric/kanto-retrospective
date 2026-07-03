import path from "path";
import dotenv from "dotenv";

// 다른 모듈이 import될 때 process.env를 이미 사용할 수 있도록,
// index.ts에서 반드시 가장 먼저 import 해야 한다.
dotenv.config({ path: path.join(__dirname, "..", ".env") });
