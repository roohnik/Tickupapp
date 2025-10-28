// Handles microlearnings, books, videos, and assignments.

import { makeAutoObservable } from "mobx";
import {
  MicroLearning,
  Book,
  YouTubeVideo,
  Podcast,
  Course,
  LearningAssignment,
  Objective,
} from "../types";

export class LearningStore {
  microLearnings: MicroLearning[] = [];
  books: Book[] = [];
  youtubeVideos: YouTubeVideo[] = [];
  podcasts: Podcast[] = [];
  courses: Course[] = [];
  assignments: LearningAssignment[] = [];
  objectives: Objective[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // ------------------------------
  // 🔹 MicroLearning
  // ------------------------------
  setMicroLearnings = (list: MicroLearning[]) => {
    this.microLearnings = list;
  };
  addMicroLearning = (learning: MicroLearning) => {
    this.microLearnings.push(learning);
  };
  updateMicroLearning = (updated: MicroLearning) => {
    this.microLearnings = this.microLearnings.map((m) =>
      m.id === updated.id ? updated : m
    );
  };
  deleteMicroLearning = (id: string) => {
    this.microLearnings = this.microLearnings.filter((m) => m.id !== id);
  };

  // ------------------------------
  // 🔹 Books
  // ------------------------------
  setBooks = (list: Book[]) => {
    this.books = list;
  };
  addBook = (book: Book) => {
    this.books.push(book);
  };
  updateBook = (updated: Book) => {
    this.books = this.books.map((b) => (b.id === updated.id ? updated : b));
  };
  deleteBook = (id: string) => {
    this.books = this.books.filter((b) => b.id !== id);
  };

  // ------------------------------
  // 🔹 YouTube Videos
  // ------------------------------
  setYouTubeVideos = (list: YouTubeVideo[]) => {
    this.youtubeVideos = list;
  };
  addYouTubeVideo = (video: YouTubeVideo) => {
    this.youtubeVideos.push(video);
  };
  updateYouTubeVideo = (updated: YouTubeVideo) => {
    this.youtubeVideos = this.youtubeVideos.map((v) =>
      v.id === updated.id ? updated : v
    );
  };
  deleteYouTubeVideo = (id: string) => {
    this.youtubeVideos = this.youtubeVideos.filter((v) => v.id !== id);
  };

  // ------------------------------
  // 🔹 Podcasts
  // ------------------------------
  setPodcasts = (list: Podcast[]) => {
    this.podcasts = list;
  };
  addPodcast = (podcast: Podcast) => {
    this.podcasts.push(podcast);
  };
  updatePodcast = (updated: Podcast) => {
    this.podcasts = this.podcasts.map((p) =>
      p.id === updated.id ? updated : p
    );
  };
  deletePodcast = (id: string) => {
    this.podcasts = this.podcasts.filter((p) => p.id !== id);
  };

  // ------------------------------
  // 🔹 Courses
  // ------------------------------
  setCourses = (list: Course[]) => {
    this.courses = list;
  };
  addCourse = (course: Course) => {
    this.courses.push(course);
  };
  updateCourse = (updated: Course) => {
    this.courses = this.courses.map((c) => (c.id === updated.id ? updated : c));
  };
  deleteCourse = (id: string) => {
    this.courses = this.courses.filter((c) => c.id !== id);
  };

  // ------------------------------
  // 🔹 Learning Assignments
  // ------------------------------
  setAssignments = (list: LearningAssignment[]) => {
    this.assignments = list;
  };
  addAssignment = (assignment: LearningAssignment) => {
    this.assignments.push(assignment);
  };
  updateAssignment = (updated: LearningAssignment) => {
    this.assignments = this.assignments.map((a) =>
      a.id === updated.id ? updated : a
    );
  };
  deleteAssignment = (id: string) => {
    this.assignments = this.assignments.filter((a) => a.id !== id);
  };

  // ------------------------------
  // 🔹 Objectives (optional link)
  // ------------------------------
  setObjectives = (objectives: Objective[]) => {
    this.objectives = objectives;
  };
  addObjective = (objective: Objective) => {
    this.objectives.push(objective);
  };
  updateObjective = (updated: Objective) => {
    this.objectives = this.objectives.map((o) =>
      o.id === updated.id ? updated : o
    );
  };
  deleteObjective = (id: string) => {
    this.objectives = this.objectives.filter((o) => o.id !== id);
  };
}
