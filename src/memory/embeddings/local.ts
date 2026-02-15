import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import type { EmbeddingProvider } from "./provider.js";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(model: string): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    console.log(`📦 Loading local embedding model: ${model} …`);
    extractorPromise = pipeline("feature-extraction", model, {
      dtype: "fp32",
    })
      .then((ext) => {
        console.log(`✅ Local embedding model ready`);
        return ext;
      })
      .catch((err) => {
        console.error(`❌ Failed to load embedding model: ${(err as Error).message}`);
        extractorPromise = null;
        throw err;
      });
  }
  return extractorPromise;
}

/**
 * Local embedding provider using @huggingface/transformers (ONNX Runtime).
 * Runs offline after initial model download (~22 MB cached at ~/.cache/huggingface/).
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly id = "local";
  readonly model: string;
  readonly dimensions: number;

  constructor(config: { model?: string }) {
    this.model = config.model || "Xenova/all-MiniLM-L6-v2";
    this.dimensions = 384;
  }

  async embedQuery(text: string): Promise<number[]> {
    const extractor = await getExtractor(this.model);
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as Float32Array);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const extractor = await getExtractor(this.model);
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    const data = output.data as Float32Array;
    const dims = this.dimensions;

    const results: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      results.push(Array.from(data.slice(i * dims, (i + 1) * dims)));
    }
    return results;
  }
}
