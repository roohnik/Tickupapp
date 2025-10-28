import { makeAutoObservable } from "mobx";
import { Document, DocumentStatus } from "../types";

export class DocumentStore {
  documents: Document[] = [];
  statuses: DocumentStatus[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setDocuments = (list: Document[]) => {
    this.documents = list;
  };

  setStatuses = (list: DocumentStatus[]) => {
    this.statuses = list;
  };

  addDocument = (doc: Document) => {
    const exists = this.documents.some((d) => d.id === doc.id);
    if (!exists) {
      this.documents.push(doc);
    } else {
      this.updateDocument(doc);
    }
  };

  updateDocument = (updated: Document) => {
    this.documents = this.documents.map((d) =>
      d.id === updated.id ? updated : d
    );
  };

  deleteDocument = (id: string) => {
    this.documents = this.documents.filter((d) => d.id !== id);
  };
}
