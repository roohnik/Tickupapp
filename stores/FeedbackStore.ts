// Handles general feedback, tags, and challenge tags.

import { makeAutoObservable } from "mobx";
import { GeneralFeedback, FeedbackTag } from "../types";
import {
  emitGeneralFeedbackCreate,
  emitGeneralFeedbackUpdate,
  emitGeneralFeedbackDelete,
  emitGeneralFeedbackList,
} from "../emitter";

export class FeedbackStore {
  feedbacks: GeneralFeedback[] = [];
  feedbackTags: FeedbackTag[] = [];
  challengeTags: FeedbackTag[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setFeedbackTags = (tags: FeedbackTag[]) => {
    this.feedbackTags = tags;
  };
  addFeedbackTag = (tag: FeedbackTag) => {
    const exists = this.feedbackTags.some((t) => t.id === tag.id);
    if (!exists) this.feedbackTags.push(tag);
    // this.feedbackTags.push(tag);
  };
  updateFeedbackTag = (updated: FeedbackTag) => {
    this.feedbackTags = this.feedbackTags.map((t) =>
      t.id === updated.id ? updated : t
    );
  };
  deleteFeedbackTag = (id: string) => {
    this.feedbackTags = this.feedbackTags.filter((t) => t.id !== id);
  };

  setChallengeTags = (tags: FeedbackTag[]) => {
    this.challengeTags = tags;
  };

  setFeedbacks = (list: GeneralFeedback[]) => {
    this.feedbacks = list;
  };

  addFeedback = (fb: GeneralFeedback) => {
    const exists = this.feedbacks.some((f) => f.id === fb.id);
    if (!exists) this.feedbacks.push(fb);
  };

  updateFeedback = (updated: GeneralFeedback) => {
    this.feedbacks = this.feedbacks.map((f) =>
      f.id === updated.id ? updated : f
    );
  };

  setGeneralFeedbacks = (list: GeneralFeedback[]) => {
    this.feedbacks = list;
  };
  addGeneralFeedback = (fb: GeneralFeedback) => {
    const exists = this.feedbacks.some((f) => f.id === fb.id);
    if (!exists) this.feedbacks.push(fb);
  };
  fetchFeedbacks = () => {
    emitGeneralFeedbackList((feedbacks) => {
      this.setGeneralFeedbacks(feedbacks);
    });
  };

  createFeedback = (data) => {
    emitGeneralFeedbackCreate(data, (feedback) => {
      this.addGeneralFeedback(feedback);
    });
  };

  updateFeedbackOnServer = (data) => {
    emitGeneralFeedbackUpdate(data, (updated) => {
      this.updateFeedback(updated);
    });
  };

  deleteFeedbackOnServer = (id) => {
    emitGeneralFeedbackDelete(id, () => {
      this.deleteFeedback(id);
    });
  };

  deleteFeedback = (id: string) => {
    this.feedbacks = this.feedbacks.filter((f) => f.id !== id);
  };

  //✍️ Local feedback submission
  submitFeedback = (
    data: Omit<GeneralFeedback, "id" | "giverId" | "createdAt">
  ) => {
    const feedback: GeneralFeedback = {
      ...data,
      id: `fb-${Date.now()}`,
      giverId: "system",
      createdAt: new Date().toISOString(),
    };
    this.addFeedback(feedback);
  };
}
