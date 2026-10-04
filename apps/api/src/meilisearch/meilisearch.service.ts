import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class MeilisearchService {
  private readonly logger = new Logger('MeilisearchService');
  private readonly client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILI_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILI_ADMIN_API_KEY || 'supersecretadminkeynew',
    });
  }

  private getIndex(indexName: string): Index {
    const indexed = this.client.index(indexName);
    this.logger.debug('Payload to Meili:', JSON.stringify(indexName, null, 2));

    return indexed;
  }

  async addOrUpdate<T extends object>(
    indexName: string,
    documents: T[],
  ): Promise<void> {
    try {
      const index = this.getIndex(indexName);
      await index.addDocuments(documents);
      this.logger.log(
        `Indexed ${documents.length} document(s) to "${indexName}"`,
      );
      this.logger.debug(
        'Payload to Meili:',
        JSON.stringify(documents, null, 2),
      );
    } catch (err) {
      this.logger.error(`Failed to index documents to "${indexName}"`, err);
    }
  }

  async delete(indexName: string, documentId: string) {
    try {
      const index = this.getIndex(indexName);
      await index.deleteDocument(documentId);
      this.logger.log(`Deleted document ${documentId} from "${indexName}"`);
    } catch (err) {
      this.logger.error(
        `Failed to delete document ${documentId} from "${indexName}"`,
        err,
      );
    }
  }

  async clearIndex(indexName: string) {
    try {
      const index = this.getIndex(indexName);
      await index.deleteAllDocuments();
      this.logger.warn(`All documents cleared from "${indexName}"`);
    } catch (err) {
      this.logger.error(`Failed to clear index "${indexName}"`, err);
    }
  }
}
