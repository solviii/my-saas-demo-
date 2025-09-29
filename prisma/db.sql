CREATE TABLE "vectors" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "embedding" vector(1024),
    "chunkContent" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "chunkLength" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vectors_pkey" PRIMARY KEY ("id")
);
CREATE INDEX ON vectors USING ivfflat (embedding);
CREATE INDEX vectors_embedding_idx ON vectors USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX vectors_content_idx ON vectors USING gin (to_tsvector('english', "chunkContent"));

-- Install pgvector
-- sudo apt install postgresql-16-pgvector
-- sudo systemctl restart postgresql
