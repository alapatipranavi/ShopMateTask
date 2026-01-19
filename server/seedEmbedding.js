require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { MongoClient } = require("mongodb");

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing");
  process.exit(1);
}

const pineconeApiKey = process.env.PINECONE_API_KEY;
if (!pineconeApiKey) {
  console.error("CRITICAL ERROR: PINECONE_API_KEY is missing");
  process.exit(1);
}

const pineconeIndex = process.env.PINECONE_INDEX;
if (!pineconeIndex) {
  console.error("CRITICAL ERROR: PINECONE_INDEX is missing");
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("CRITICAL ERROR: MONGO_URI is missing");
  process.exit(1);
}

async function main() {
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const pinecone = new Pinecone({ apiKey: pineconeApiKey });
  const index = pinecone.index(pineconeIndex);

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db("shopmate");
  const products = await db.collection("products").find({}).toArray();

  const vectors = [];

  for (const product of products) {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [
        {
          parts: [
            {
              text: product.description,
            },
          ],
        },
      ],
    });

    console.log("Created embedding for product:", product.name);

    vectors.push({
      id: product._id.toString(),
      values: response.embeddings[0].values, // ✅ correct
      metadata: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
      },
    });
  }

  console.log("Total vectors to be upserted:", vectors.length);

  await index.upsert(vectors);

  console.log("Successfully upserted vectors to Pinecone index");

  await client.close();
}

main();
